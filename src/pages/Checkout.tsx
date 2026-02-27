import { FormEvent, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { addItemsAndRedirectToCheckout, authenticateAndCheckout } from "@/lib/woocommerce";
import {
    DELIVERY_AREAS,
    PICKUP_INFO,
    matchDeliveryAddress,
    getAvailableDeliveryDates,
    formatDeliveryDate,
    type StreetMatch,
} from "@/lib/deliveryAreas";
import usePageMetadata from "@/hooks/usePageMetadata";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import {
    Truck,
    Store,
    MapPin,
    CalendarDays,
    ChevronLeft,
    ShoppingBag,
    ExternalLink,
    Loader2,
    Check,
    AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

// ─── Types ───
type DeliveryMethod = "delivery" | "pickup";

interface DeliverySelection {
    method: DeliveryMethod;
    address?: string;
    streetMatch?: StreetMatch;
    date?: Date;
}

// ─── Step indicator ───
const STEPS = [
    { key: "method", label: "Leveranssätt" },
    { key: "address", label: "Adress" },
    { key: "date", label: "Dag & tid" },
    { key: "summary", label: "Sammanfattning" },
] as const;

function StepIndicator({ currentStep, method }: { currentStep: number; method?: DeliveryMethod }) {
    // When pickup, skip step 2 (address) — show 3 steps
    const visibleSteps = method === "pickup"
        ? STEPS.filter((s) => s.key !== "address")
        : [...STEPS];

    return (
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8">
            {visibleSteps.map((step, i) => {
                const originalIndex = STEPS.findIndex((s) => s.key === step.key);
                const isCompleted = currentStep > originalIndex;
                const isCurrent = currentStep === originalIndex;
                return (
                    <div key={step.key} className="flex items-center gap-1 sm:gap-2">
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${isCurrent
                                ? "bg-primary text-primary-foreground shadow-md"
                                : isCompleted
                                    ? "bg-primary/20 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                        >
                            {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                        </div>
                        <span
                            className={`hidden sm:inline text-sm ${isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                                }`}
                        >
                            {step.label}
                        </span>
                        {i < visibleSteps.length - 1 && (
                            <div className={`h-px w-6 sm:w-10 ${isCompleted ? "bg-primary/40" : "bg-border"}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main component ───
const Checkout = () => {
    usePageMetadata({
        title: "Kassa | Hasselblads Livs",
        description: "Välj leveranssätt och slutför din beställning.",
        canonicalPath: "/kassa",
    });

    const navigate = useNavigate();
    const { items, subtotal, shippingFee, total, clearCart } = useCart();
    const { user } = useAuth();
    const hasItems = items.length > 0;

    const [step, setStep] = useState(0);
    const [selection, setSelection] = useState<DeliverySelection>({ method: "delivery" });
    const [addressInput, setAddressInput] = useState("");
    const [addressError, setAddressError] = useState<string | null>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const deliveryDates = useMemo(() => getAvailableDeliveryDates(5), []);

    // ─── Step navigation ───
    const goNext = useCallback(() => {
        setStep((s) => {
            // Skip address step for pickup
            if (s === 0 && selection.method === "pickup") return 2;
            return s + 1;
        });
    }, [selection.method]);

    const goBack = useCallback(() => {
        setStep((s) => {
            // Skip address step for pickup when going back
            if (s === 2 && selection.method === "pickup") return 0;
            return s - 1;
        });
    }, [selection.method]);

    // ─── Address validation submit ───
    const handleAddressSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault();

            const query = addressInput.trim();
            if (!query) {
                setAddressError("Ange din gatuadress");
                return;
            }

            const result = matchDeliveryAddress(query);
            if (result) {
                setSelection((prev) => ({
                    ...prev,
                    address: query,
                    streetMatch: result,
                }));
                setAddressError(null);
                goNext();
            } else {
                setAddressError(
                    "Vi hittade ingen matchande gata i våra leveransområden (Solängen & Malevik). Kontrollera stavningen."
                );
            }
        },
        [addressInput, goNext]
    );

    // ─── Final checkout ───
    const handleCheckout = useCallback(async () => {
        setIsRedirecting(true);

        // Build order note
        const lines: string[] = [];
        if (selection.method === "delivery" && selection.streetMatch) {
            lines.push(`🚚 Hemleverans till ${selection.streetMatch.area.label}`);
            lines.push(`📍 ${selection.address}`);
            lines.push(`🕐 ${selection.date ? formatDeliveryDate(selection.date) : ""} ${selection.streetMatch.area.deliveryTime}`);
        } else {
            lines.push(`📦 Hämta i butik`);
            lines.push(`📍 ${PICKUP_INFO.address}`);
            lines.push(`🕐 ${selection.date ? formatDeliveryDate(selection.date) : ""}`);
        }
        const deliveryNote = lines.join("\n");

        if (user) {
            try {
                const token = await user.getIdToken();
                await authenticateAndCheckout(items, token, clearCart, deliveryNote);
            } catch (error) {
                console.error("Failed to get Firebase token", error);
                await addItemsAndRedirectToCheckout(items, clearCart, deliveryNote);
            }
        } else {
            await addItemsAndRedirectToCheckout(items, clearCart, deliveryNote);
        }
    }, [selection, items, clearCart, user]);

    // ─── Empty cart ───
    if (!hasItems && !isRedirecting) {
        return (
            <div className="min-h-screen bg-background">
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 max-w-2xl text-center">
                        <div className="rounded-3xl border border-border/70 bg-card p-12">
                            <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold mb-4">Din varukorg är tom</h2>
                            <p className="text-muted-foreground mb-6">
                                Lägg till produkter i varukorgen för att fortsätta till kassan.
                            </p>
                            <Button asChild size="lg">
                                <Link to="/webbutik">Börja handla</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    // ─── Redirecting ───
    if (isRedirecting) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Skickar till betalning...</h2>
                    <p className="text-muted-foreground">
                        Du skickas nu till vår säkra betalningslösning.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <section className="relative h-[200px] md:h-[260px] overflow-hidden">
                <img
                    src="/Bilder%20frukt/Butik1-frukt.jpg"
                    alt="Hasselblads Livs kassa"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">Kassa</h1>
                    <p className="text-white/80 mt-2">Välj leveranssätt och slutför din beställning</p>
                </div>
            </section>

            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4 max-w-2xl">
                    <StepIndicator currentStep={step} method={selection.method} />

                    {/* ─── STEP 0: Delivery method ─── */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-center mb-6">Hur vill du få dina varor?</h2>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelection((prev) => ({ ...prev, method: "delivery" }));
                                }}
                                className={`w-full rounded-2xl border-2 p-5 text-left transition-all hover:shadow-md ${selection.method === "delivery"
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-border/70 bg-card hover:border-primary/30"
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`rounded-xl p-3 ${selection.method === "delivery" ? "bg-primary/10" : "bg-muted"}`}>
                                        <Truck className={`h-6 w-6 ${selection.method === "delivery" ? "text-primary" : "text-muted-foreground"}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-lg">Hemleverans</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Vi levererar till Solängen ({DELIVERY_AREAS[0].deliveryTime}) och Malevik ({DELIVERY_AREAS[1].deliveryTime}), måndag–fredag.
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {subtotal >= 600 ? (
                                                <span className="text-green-600 font-medium">✨ Fri frakt!</span>
                                            ) : (
                                                <>Frakt: 49 kr (fri vid 600 kr)</>
                                            )}
                                        </p>
                                    </div>
                                    {selection.method === "delivery" && (
                                        <Check className="h-5 w-5 text-primary mt-1" />
                                    )}
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelection((prev) => ({ ...prev, method: "pickup" }));
                                }}
                                className={`w-full rounded-2xl border-2 p-5 text-left transition-all hover:shadow-md ${selection.method === "pickup"
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-border/70 bg-card hover:border-primary/30"
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`rounded-xl p-3 ${selection.method === "pickup" ? "bg-primary/10" : "bg-muted"}`}>
                                        <Store className={`h-6 w-6 ${selection.method === "pickup" ? "text-primary" : "text-muted-foreground"}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-lg">Hämta i butik</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {PICKUP_INFO.address}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            <span className="text-green-600 font-medium">Alltid gratis</span>
                                        </p>
                                    </div>
                                    {selection.method === "pickup" && (
                                        <Check className="h-5 w-5 text-primary mt-1" />
                                    )}
                                </div>
                            </button>

                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                                    <ChevronLeft className="h-4 w-4" />
                                    Tillbaka
                                </Button>
                                <Button onClick={goNext} size="lg">
                                    Fortsätt
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 1: Address (delivery only) ─── */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-center mb-2">Ange din leveransadress</h2>
                            <p className="text-center text-muted-foreground text-sm mb-6">
                                Vi levererar till Solängen och Malevik. Ange din gatuadress så kontrollerar vi.
                            </p>

                            <form onSubmit={handleAddressSubmit} className="space-y-4">
                                <div className="rounded-2xl border border-border/70 bg-card p-6">
                                    <label htmlFor="delivery-address" className="text-sm font-medium text-muted-foreground">
                                        Gatuadress
                                    </label>
                                    <div className="relative mt-2">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="delivery-address"
                                            type="text"
                                            placeholder="Ex. Frejagatan 5 eller Maleviks Sjöväg 4"
                                            value={addressInput}
                                            onChange={(e) => {
                                                setAddressInput(e.target.value);
                                                setAddressError(null);
                                            }}
                                            className="pl-10"
                                            autoComplete="street-address"
                                            autoFocus
                                        />
                                    </div>

                                    {addressError && (
                                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
                                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                            <p className="text-destructive">{addressError}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between pt-2">
                                    <Button type="button" variant="ghost" onClick={goBack} className="gap-2">
                                        <ChevronLeft className="h-4 w-4" />
                                        Tillbaka
                                    </Button>
                                    <Button type="submit" size="lg">
                                        Kontrollera adress
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ─── STEP 2: Date & time ─── */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-center mb-2">
                                {selection.method === "delivery" ? "Välj leveransdag" : "Välj upphämtningsdag"}
                            </h2>
                            {selection.method === "delivery" && selection.streetMatch && (
                                <p className="text-center text-sm text-muted-foreground mb-6">
                                    <strong>{selection.streetMatch.street}</strong> i{" "}
                                    <strong>{selection.streetMatch.area.label}</strong> – leverans{" "}
                                    {selection.streetMatch.area.deliveryTime}
                                </p>
                            )}
                            {selection.method === "pickup" && (
                                <p className="text-center text-sm text-muted-foreground mb-6">
                                    Hämta på <strong>{PICKUP_INFO.address}</strong>
                                </p>
                            )}

                            <div className="space-y-2">
                                {deliveryDates.map((date) => {
                                    const isSelected =
                                        selection.date?.toDateString() === date.toDateString();
                                    const timeSlot =
                                        selection.method === "delivery" && selection.streetMatch
                                            ? selection.streetMatch.area.deliveryTime
                                            : "från kl 10";

                                    return (
                                        <button
                                            key={date.toISOString()}
                                            type="button"
                                            onClick={() =>
                                                setSelection((prev) => ({ ...prev, date }))
                                            }
                                            className={`w-full rounded-2xl border-2 p-4 text-left transition-all hover:shadow-md ${isSelected
                                                ? "border-primary bg-primary/5 shadow-sm"
                                                : "border-border/70 bg-card hover:border-primary/30"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <CalendarDays
                                                        className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                                                    />
                                                    <div>
                                                        <p className="font-semibold">
                                                            {formatDeliveryDate(date)}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {timeSlot}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isSelected && <Check className="h-5 w-5 text-primary" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="text-xs text-muted-foreground text-center mt-2">
                                Beställning senast kl 18:00 dagen innan leverans.
                            </p>

                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" onClick={goBack} className="gap-2">
                                    <ChevronLeft className="h-4 w-4" />
                                    Tillbaka
                                </Button>
                                <Button
                                    onClick={goNext}
                                    size="lg"
                                    disabled={!selection.date}
                                >
                                    Fortsätt
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 3: Summary ─── */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-center mb-6">
                                Bekräfta din beställning
                            </h2>

                            {/* Delivery info card */}
                            <div className="rounded-2xl border border-border/70 bg-card p-6 space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    {selection.method === "delivery" ? (
                                        <><Truck className="h-5 w-5 text-primary" /> Hemleverans</>
                                    ) : (
                                        <><Store className="h-5 w-5 text-primary" /> Hämta i butik</>
                                    )}
                                </h3>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    {selection.method === "delivery" && selection.streetMatch ? (
                                        <>
                                            <p className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                {selection.address} ({selection.streetMatch.area.label})
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4" />
                                                {selection.date && formatDeliveryDate(selection.date)}{" "}
                                                {selection.streetMatch.area.deliveryTime}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                {PICKUP_INFO.address}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4" />
                                                {selection.date && formatDeliveryDate(selection.date)}{" "}
                                                från kl 10
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Cart summary */}
                            <div className="rounded-2xl border border-border/70 bg-card p-6 space-y-3">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                    {items.length} {items.length === 1 ? "vara" : "varor"}
                                </h3>
                                <ul className="divide-y divide-border/40">
                                    {items.map((item) => (
                                        <li key={item.id} className="flex items-center justify-between py-2 text-sm">
                                            <span className="text-muted-foreground">
                                                {item.quantity}× {item.name}
                                            </span>
                                            <span className="font-medium tabular-nums">
                                                {formatPrice(item.lineTotal ?? (item.price * item.quantity))} kr
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <Separator />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Delsumma</span>
                                    <span>{formatPrice(subtotal)} kr</span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Frakt</span>
                                    <span className={shippingFee === 0 ? "text-green-600 font-medium" : ""}>
                                        {selection.method === "pickup"
                                            ? "Gratis"
                                            : shippingFee === 0
                                                ? "Gratis"
                                                : `${formatPrice(shippingFee)} kr`}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Att betala</span>
                                    <span>
                                        {formatPrice(selection.method === "pickup" ? subtotal : total)} kr
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between pt-2">
                                <Button variant="ghost" onClick={goBack} className="gap-2">
                                    <ChevronLeft className="h-4 w-4" />
                                    Tillbaka
                                </Button>
                                <Button onClick={handleCheckout} size="lg" className="gap-2">
                                    Gå till betalning
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Checkout;

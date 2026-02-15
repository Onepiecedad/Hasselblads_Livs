import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DELIVERY_AREAS, matchDeliveryAddress, type StreetMatch } from "@/lib/deliveryAreas";

export type DeliveryStatus = "idle" | "available" | "out-of-area";

interface AddressLookupProps {
  className?: string;
  onStatusChange?: (status: DeliveryStatus) => void;
}

const AddressLookup = ({ className, onStatusChange }: AddressLookupProps) => {
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<DeliveryStatus>("idle");
  const [match, setMatch] = useState<StreetMatch | null>(null);

  const updateStatus = (next: DeliveryStatus, m: StreetMatch | null) => {
    setStatus(next);
    setMatch(m);
    onStatusChange?.(next);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = inputValue.trim();
    if (!query) {
      updateStatus("idle", null);
      return;
    }

    const result = matchDeliveryAddress(query);
    if (result) {
      updateStatus("available", result);
    } else {
      updateStatus("out-of-area", null);
    }
  };

  return (
    <div className={cn("rounded-3xl border border-border/70 bg-card p-6 shadow-sm", className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="address" className="text-sm font-medium text-muted-foreground">
            Ange din gatuadress för att kontrollera om vi levererar till dig
          </label>
          <Input
            id="address"
            type="text"
            placeholder="Ex. Frejagatan 5 eller Maleviks Sjöväg 4"
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              if (status !== "idle") {
                updateStatus("idle", null);
              }
            }}
            className="mt-2"
            autoComplete="street-address"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Leverans till Solängen {DELIVERY_AREAS[0].deliveryTime} & Malevik {DELIVERY_AREAS[1].deliveryTime}
          </div>
          <Button type="submit">Kontrollera adress</Button>
        </div>
      </form>

      <div className="mt-4 space-y-2" aria-live="polite">
        {status === "available" && match && (
          <div className="rounded-xl border border-primary/50 bg-primary/10 px-4 py-3 text-sm">
            <p className="font-semibold text-primary">✅ Leverans möjlig!</p>
            <p className="text-muted-foreground">
              <strong>{match.street}</strong> finns i <strong>{match.area.label}</strong> – leverans {match.area.deliveryTime}.
            </p>
          </div>
        )}

        {status === "out-of-area" && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm">
            <p className="font-semibold text-destructive">Utanför leveransområdet</p>
            <p className="text-muted-foreground">
              Vi hittade ingen matchande gata i våra leveransområden (Solängen & Malevik).
              Kontrollera stavningen eller kontakta oss så undersöker vi möjligheterna.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressLookup;

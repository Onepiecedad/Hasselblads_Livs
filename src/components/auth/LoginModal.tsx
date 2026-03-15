import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { fetchWalletBalance, WalletBalance } from "@/lib/wallet";

export function LoginModal() {
    const { user, isAdmin, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [wallet, setWallet] = useState<WalletBalance | null>(null);
    const [fetchingWallet, setFetchingWallet] = useState(false);

    // Fetch wallet balance when user is logged in
    useEffect(() => {
        let isMounted = true;
        const loadWallet = async () => {
            if (user && !isAdmin) {
                setFetchingWallet(true);
                const data = await fetchWalletBalance();
                if (isMounted) {
                    setWallet(data);
                    setFetchingWallet(false);
                }
            } else {
                if (isMounted) setWallet(null);
            }
        };
        loadWallet();
        return () => { isMounted = false; };
    }, [user, isAdmin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                toast.success("Inloggad framgångsrikt!");
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                toast.success("Konto skapat framgångsrikt!");
            }
            setIsOpen(false);
        } catch (error: unknown) {
            console.error("Auth error", error);
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Ett fel uppstod vid inloggning.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            toast.error("Vänligen ange din e-postadress för att återställa lösenordet.");
            return;
        }
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success("Återställningslänk har skickats till din e-post.");
            setIsOpen(false);
        } catch (error: unknown) {
            console.error("Auth error", error);
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Ett fel uppstod vid återställning av lösenord.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        toast.success("Utloggad");
    };

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end hidden md:flex">
                    <span className="text-white text-sm font-medium">
                        Inloggad som {user.email} {isAdmin && "(Admin)"}
                    </span>
                    {!isAdmin && (
                        <span className="text-white/80 text-xs mt-0.5 font-medium flex items-center gap-1">
                            Saldo: {fetchingWallet ? "Laddar..." : wallet ? `${wallet.balance} kr` : "0 kr"}
                        </span>
                    )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/10">
                    Logga ut
                </Button>
            </div>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center justify-center h-11 w-11 rounded-full text-white hover:bg-white/10 transition-colors md:h-12 md:w-12" aria-label="Logga in">
                    <User className="!h-7 !w-7 md:!h-8 md:!w-8" strokeWidth={1.75} />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isLogin ? "Logga in" : "Skapa konto"}</DialogTitle>
                    <DialogDescription>
                        {isLogin
                            ? "Ange din e-post och ditt lösenord för att logga in och se ditt saldo."
                            : "Skapa ett nytt konto med din e-postadress."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="email"
                            placeholder="E-postadress"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Lösenord"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {isLogin && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={handleResetPassword}
                                    className="text-xs text-primary hover:underline"
                                    disabled={loading}
                                >
                                    Glömt lösenordet?
                                </button>
                            </div>
                        )}
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Laddar..." : (isLogin ? "Logga in" : "Skapa konto")}
                    </Button>
                    <div className="text-center text-sm">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-primary hover:underline"
                        >
                            {isLogin ? "Har du inget konto? Skapa ett här." : "Har du redan ett konto? Logga in."}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

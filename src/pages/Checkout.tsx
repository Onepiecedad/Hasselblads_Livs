import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import usePageMetadata from "@/hooks/usePageMetadata";

const Checkout = () => {
  usePageMetadata({
    title: "Kassa | Hasselblads Livs",
    description: "Slutför din beställning och välj leveransalternativ för Hasselblads Livs i Mölndal.",
    canonicalPath: "/kassa",
    ogImage: "https://images.unsplash.com/photo-1611078489935-0cb964de3b06?auto=format&fit=crop&w=1200&q=80&fm=webp",
  });

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">Kassa</h1>
        <p className="text-muted-foreground mb-10">
          Fyll i dina uppgifter och bekräfta beställningen. Har du frågor? Kontakta oss på 031-123 45 67.
        </p>
        <form className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="text-sm font-medium text-muted-foreground">
                Förnamn
              </label>
              <Input id="firstName" name="firstName" autoComplete="given-name" required />
            </div>
            <div>
              <label htmlFor="lastName" className="text-sm font-medium text-muted-foreground">
                Efternamn
              </label>
              <Input id="lastName" name="lastName" autoComplete="family-name" required />
            </div>
          </div>
          <div>
            <label htmlFor="address" className="text-sm font-medium text-muted-foreground">
              Adress
            </label>
            <Input id="address" name="address" autoComplete="street-address" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="postalCode" className="text-sm font-medium text-muted-foreground">
                Postnummer
              </label>
              <Input id="postalCode" name="postalCode" autoComplete="postal-code" required />
            </div>
            <div>
              <label htmlFor="city" className="text-sm font-medium text-muted-foreground">
                Ort
              </label>
              <Input id="city" name="city" autoComplete="address-level2" required />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                E-post
              </label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm font-medium text-muted-foreground">
                Telefon
              </label>
              <Input id="phone" name="phone" type="tel" autoComplete="tel" required />
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="text-sm font-medium text-muted-foreground">
              Leveransinstruktioner
            </label>
            <textarea
              id="notes"
              name="notes"
              className="mt-2 min-h-[120px] w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <Button size="lg" className="justify-center">
            Gå vidare till betalning
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;

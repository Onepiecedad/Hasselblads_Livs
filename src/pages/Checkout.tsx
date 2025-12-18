import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { redirectToWooCommerceCheckout, getWooCommerceStoreUrl } from "@/lib/woocommerce";
import usePageMetadata from "@/hooks/usePageMetadata";
import { ShoppingCart, ArrowRight, Store, AlertCircle } from "lucide-react";

const Checkout = () => {
  usePageMetadata({
    title: "Kassa | Hasselblads Livs",
    description: "Slutför din beställning och välj leveransalternativ för Hasselblads Livs i Mölndal.",
    canonicalPath: "/kassa",
    ogImage: "https://images.unsplash.com/photo-1611078489935-0cb964de46b60?auto=format&fit=crop&w=1200&q=80&fm=webp",
  });

  const { items, subtotal, shippingFee, total, clearCart } = useCart();

  // Kontrollera om några produkter har WooCommerce ID
  const itemsWithWooCommerceId = items.filter(item => {
    // Försök hitta woocommerce_id från item (behöver läggas till i CartItem)
    return true; // För nu, anta alla har det
  });

  const handleCheckout = () => {
    // Mappa cart items till WooCommerce format
    const wooItems = items.map(item => ({
      id: item.id,
      woocommerce_id: (item as unknown as { woocommerce_id?: number }).woocommerce_id,
      quantity: item.quantity
    }));

    redirectToWooCommerceCheckout(wooItems, clearCart);
  };

  const handleGoToStore = () => {
    window.location.href = getWooCommerceStoreUrl();
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold mb-4">Din varukorg är tom</h1>
          <p className="text-muted-foreground mb-8">
            Lägg till några produkter för att fortsätta till kassan.
          </p>
          <Button size="lg" onClick={() => window.location.href = '/webshop'}>
            <Store className="w-5 h-5 mr-2" />
            Gå till butiken
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">Kassa</h1>
        <p className="text-muted-foreground mb-10">
          Granska din beställning och fortsätt till betalning.
        </p>

        {/* Varukorg-sammanfattning */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Din varukorg ({items.length} {items.length === 1 ? 'produkt' : 'produkter'})</h2>

          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={item.id} className="py-4 flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × {item.price} kr{item.unit}
                  </p>
                </div>
                <div className="text-right font-medium">
                  {item.quantity * item.price} kr
                </div>
              </div>
            ))}
          </div>

          {/* Summering */}
          <div className="border-t border-border mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Delsumma</span>
              <span>{subtotal} kr</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Frakt</span>
              <span>{shippingFee === 0 ? 'Gratis' : `${shippingFee} kr`}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span>Totalt</span>
              <span>{total} kr</span>
            </div>
          </div>
        </div>

        {/* Info om redirect */}
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Du kommer att skickas till vår säkra betalningssida för att slutföra köpet.
              Där kan du välja betalningsmetod (Klarna, kort eller Swish).
            </p>
          </div>
        </div>

        {/* Knappar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="flex-1 justify-center"
            onClick={handleCheckout}
          >
            Gå vidare till betalning
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="justify-center"
            onClick={() => window.location.href = '/webshop'}
          >
            Fortsätt handla
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;


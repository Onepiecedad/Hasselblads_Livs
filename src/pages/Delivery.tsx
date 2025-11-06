import { Truck, Package, CheckCircle, Building2 } from "lucide-react";
import deliveryVan from "@/assets/delivery-van.jpg";
import deliveryPacking from "@/assets/delivery-packing.jpg";

const Delivery = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <img
          src={deliveryVan}
          alt="Hasselblads Livs leveransservice med kylbil"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Hemleverans</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Färsk frukt, grönsaker och delikatesser direkt till din dörr
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Vi levererar färsk frukt, grönsaker och delikatesser direkt till din dörr.
              Allt packas samma morgon i vår butik på Frejagatan i Mölndal, med samma omsorg som när du handlar hos oss personligen.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed mt-6">
              Vi kör ut till hela Malevik med omnejd, bland annat längs Blomstervägen, Maleviksvägen, Kullsviksvägen, Havsörnsvägen och Platåvägen.
              Varje leverans innehåller noggrant utvalda varor, handplockade för smak, kvalitet och hållbarhet.
            </p>
          </div>

          {/* Image */}
          <div className="mb-12 rounded-lg overflow-hidden">
            <img
              src={deliveryPacking}
              alt="Färska råvaror packas för leverans"
              className="w-full h-auto"
            />
          </div>

          {/* How it works */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center">Så fungerar det</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">1. Beställ</h3>
                  <p className="text-muted-foreground">
                    Du beställer via webbutiken eller direkt i butiken.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. Bekräftelse</h3>
                  <p className="text-muted-foreground">
                    Vi kontaktar dig för att bekräfta leveranstid.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. Packning & Transport</h3>
                  <p className="text-muted-foreground">
                    På leveransdagen packas varorna i kylbil och körs hem till dig.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4. Mottagning</h3>
                  <p className="text-muted-foreground">
                    Du tar emot leveransen vid dörren eller vid en överenskommen plats.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Section */}
          <div className="bg-muted/30 rounded-lg p-8 mb-12">
            <div className="flex gap-4 mb-4">
              <Building2 className="h-8 w-8 text-primary flex-shrink-0" />
              <h2 className="text-2xl font-bold">Leverans till företag</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              För företag i Göteborgsområdet erbjuder vi även abonnemang på frukt och grönt.
              Vi levererar regelbundet till kontor, caféer och restauranger som vill ge personal och gäster tillgång till färska råvaror varje vecka.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Leveranserna planeras efter era behov – ni bestämmer volym, intervall och innehåll, vi sköter resten.
            </p>
          </div>

          {/* Closing Statement */}
          <div className="text-center py-8">
            <p className="text-xl font-semibold mb-2">
              Vårt mål är enkelt: att göra god mat tillgänglig för fler, utan att kompromissa med kvaliteten.
            </p>
            <p className="text-lg text-muted-foreground">
              Från vår butik till ditt bord – färskt, lokalt och med hjärta.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Delivery;

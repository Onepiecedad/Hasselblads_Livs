import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-produce.jpg";
import godastJustNu from "@/assets/godast-just-nu.png";
import sasongspremiar from "@/assets/sasongspremiar.png";
import varoriSasong from "@/assets/varor-i-sasong.png";
import erbjudanden from "@/assets/erbjudanden.png";

const Home = () => {
  const categories = [
    {
      title: "Godast just nu",
      image: godastJustNu,
      description: "Säsongens bästa",
    },
    {
      title: "Säsongspremiärer & Nyheter",
      image: sasongspremiar,
      description: "Nytt i sortimentet",
    },
    {
      title: "Varor i säsong",
      image: varoriSasong,
      description: "Färskt från säsongen",
    },
    {
      title: "Erbjudanden",
      image: erbjudanden,
      description: "Bästa priserna",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Fresh produce"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-primary-foreground">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Lite godare
            <br />
            & bättre mat
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-95">
            Vi erbjuder snabb leverans av frukt och grönt av högsta kvalité – alltid färskt och
            noggrant utvalt!
          </p>
          <Link to="/webbutik">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Utforska vårt sortiment
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link key={index} to="/kategorier">
                <div className="group cursor-pointer h-full">
                  <div className="relative aspect-square overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Hemleverans</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Upplev en smidig och snabb leverans direkt till din dörr! Med vår enkla bokning
              genom kassan väljer du det leveransalternativ som passar just dina behov. Ange din
              specifika adress för en personlig och exakt leveransupplevelse.
            </p>
            <Link to="/kontakt">
              <Button size="lg" className="px-8">
                Mer information
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Populära produkter</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="aspect-square bg-muted relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-secondary/20 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Produkt {item}</h3>
                  <p className="text-muted-foreground mb-4">Färsk och kvalitetsgranskad</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">49 kr</span>
                    <Button size="sm">Lägg till</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

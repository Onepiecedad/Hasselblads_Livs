import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-produce.jpg";
import godastJustNu from "@/assets/godast-just-nu.png";
import sasongspremiar from "@/assets/sasongspremiar.png";
import varoriSasong from "@/assets/varor-i-sasong.png";
import erbjudanden from "@/assets/erbjudanden.png";
import fruktGront from "@/assets/category-frukt-gront.jpg";
import mejeriAgg from "@/assets/category-mejeri-agg.png";
import skafferi from "@/assets/category-skafferi.jpg";
import sottGott from "@/assets/category-sott-gott.jpg";
import ostChark from "@/assets/category-ost-chark.jpg";
import brod from "@/assets/category-brod.jpg";
import notterTorkad from "@/assets/category-notter-torkad.jpg";
import snacksDryck from "@/assets/category-snacks-dryck.jpg";

const Home = () => {
  const heroCategories = [
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

  const productCategories = [
    {
      name: "Frukt & Grönt",
      image: fruktGront,
      count: "45+ produkter",
    },
    {
      name: "Mejeri & Ägg",
      image: mejeriAgg,
      count: "30+ produkter",
    },
    {
      name: "Skafferi",
      image: skafferi,
      count: "50+ produkter",
    },
    {
      name: "Sött & Gott",
      image: sottGott,
      count: "25+ produkter",
    },
    {
      name: "Ost & Chark",
      image: ostChark,
      count: "35+ produkter",
    },
    {
      name: "Bröd",
      image: brod,
      count: "20+ produkter",
    },
    {
      name: "Nötter & Torkad frukt",
      image: notterTorkad,
      count: "15+ produkter",
    },
    {
      name: "Snacks & Dryck",
      image: snacksDryck,
      count: "40+ produkter",
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
            {heroCategories.map((category, index) => (
              <Link key={index} to="/kategorier">
                <div className="group cursor-pointer h-full">
                  <div className="relative aspect-square overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground text-center px-4">
                        {category.title}
                      </h3>
                    </div>
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

      {/* Product Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Kategorier</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productCategories.map((category, index) => (
              <Link key={index} to="/webbutik">
                <div className="group cursor-pointer h-full">
                  <div className="relative aspect-square overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                    <span className="text-sm text-muted-foreground">{category.count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

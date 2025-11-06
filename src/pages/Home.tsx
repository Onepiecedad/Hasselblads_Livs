import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Truck, Instagram } from "lucide-react";
import heroImage from "@/assets/hero-produce.jpg";
import storeInterior from "@/assets/store-interior.png";
import storeProducts from "@/assets/store-products.png";

const Home = () => {
  // Mock products for "Säsongens bästa" - 2x4 grid
  const seasonalProducts = [
    { id: 1, name: "Svenska jordgubbar", price: "45 kr", image: "/placeholder.svg" },
    { id: 2, name: "Ekologiska tomater", price: "35 kr", image: "/placeholder.svg" },
    { id: 3, name: "Färsk basilika", price: "25 kr", image: "/placeholder.svg" },
    { id: 4, name: "Sparris", price: "55 kr", image: "/placeholder.svg" },
    { id: 5, name: "Blåbär", price: "40 kr", image: "/placeholder.svg" },
    { id: 6, name: "Rädisor", price: "20 kr", image: "/placeholder.svg" },
    { id: 7, name: "Färsk dill", price: "15 kr", image: "/placeholder.svg" },
    { id: 8, name: "Spenat", price: "30 kr", image: "/placeholder.svg" },
  ];

  // Mock products for "Erbjudanden" - 2x2 grid
  const offers = [
    { id: 1, name: "Avokado 3-pack", price: "39 kr", oldPrice: "55 kr", image: "/placeholder.svg" },
    { id: 2, name: "Ekologiska morötter", price: "25 kr", oldPrice: "35 kr", image: "/placeholder.svg" },
    { id: 3, name: "Gula lökar 1kg", price: "18 kr", oldPrice: "28 kr", image: "/placeholder.svg" },
    { id: 4, name: "Persikor", price: "45 kr", oldPrice: "60 kr", image: "/placeholder.svg" },
  ];

  // Mock Instagram posts
  const instagramPosts = [
    { id: 1, image: "/placeholder.svg", alt: "Instagram post 1" },
    { id: 2, image: "/placeholder.svg", alt: "Instagram post 2" },
    { id: 3, image: "/placeholder.svg", alt: "Instagram post 3" },
    { id: 4, image: "/placeholder.svg", alt: "Instagram post 4" },
    { id: 5, image: "/placeholder.svg", alt: "Instagram post 5" },
    { id: 6, image: "/placeholder.svg", alt: "Instagram post 6" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Färska råvaror från Hasselblads Livs"
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

      {/* Säsongens bästa - 2x4 grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Säsongens bästa</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handplockade favoriter som är extra goda just nu
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {seasonalProducts.map((product) => (
              <Link key={product.id} to="/webbutik">
                <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-lg font-bold text-primary">{product.price}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Erbjudanden - 2x2 grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Erbjudanden</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Bästa priserna på utvalda produkter
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {offers.map((product) => (
              <Link key={product.id} to="/webbutik">
                <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded-md text-xs font-bold z-10">
                      REA
                    </div>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-primary">{product.price}</p>
                      <p className="text-sm text-muted-foreground line-through">{product.oldPrice}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/sasong">
              <Button variant="outline" size="lg">
                Se alla erbjudanden
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Hemleverans-teaser */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Truck className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">Hemleverans i Mölndal</h2>
            <p className="text-xl mb-4 opacity-95 leading-relaxed">
              Färska råvaror direkt till din dörr – packade samma morgon i vår butik på Frejagatan.
            </p>
            <p className="text-lg mb-8 opacity-90">
              Fri frakt vid order över 400 kr
            </p>
            <Link to="/hemleverans">
              <Button size="lg" variant="secondary" className="px-8">
                Läs mer om hemleverans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Butikbilder med CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Välkommen till vår butik</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upplev vårt noga utvalda sortiment i vår butik på Frejagatan i Mölndal
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
              <img
                src={storeInterior}
                alt="Hasselblads Livs butiksmiljö"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
              <img
                src={storeProducts}
                alt="Produkter i butiken"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="text-center">
            <Link to="/butiken">
              <Button size="lg" variant="outline" className="px-8">
                Hitta hit
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Instagram-feed */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Instagram className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-4xl font-bold mb-4">Följ oss på Instagram</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              @hasselbladslivs
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {instagramPosts.map((post) => (
              <a
                key={post.id}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                  <img
                    src={post.image}
                    alt={post.alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Instagram className="h-8 w-8 text-white" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter-prenumeration */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Håll dig uppdaterad</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Prenumerera på vårt nyhetsbrev och få de senaste erbjudandena och säsongstipsen
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Din e-postadress"
                className="flex-1"
                required
              />
              <Button type="submit" size="lg" className="sm:w-auto">
                Prenumerera
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-4">
              Vi skickar inga spam-mejl och du kan avsluta prenumerationen när som helst
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
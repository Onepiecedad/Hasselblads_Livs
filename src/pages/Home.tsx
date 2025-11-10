import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Truck, Instagram, Sparkles, LayoutGrid, Leaf } from "lucide-react";
import SectionHeader from "@/components/sections/SectionHeader";
import heroImage from "@/assets/hero-frukt.jpg";
import homeCardGodast from "@/assets/home-card-godast.png";
import homeCardSasong from "@/assets/home-card-sasong.png";
import homeCardVaror from "@/assets/home-card-varor.png";
import homeCardErbjudanden from "@/assets/home-card-erbjudanden.png";
import { categoryCards } from "@/lib/categoryCards";
import usePageMetadata from "@/hooks/usePageMetadata";

const Home = () => {
  // Mock products for "Säsongens bästa" - 2x4 grid
  const seasonalProducts = [
    { id: 1, name: "Svenska jordgubbar", price: "45 kr", image: "/produkter-frukt/svenska-jordgubbar.jpeg" },
    { id: 2, name: "Ekologiska tomater", price: "35 kr", image: "/produkter-frukt/ekologiska-tomater.jpeg" },
    { id: 3, name: "Färsk basilika", price: "25 kr", image: "/produkter-frukt/färsk-basilika.jpeg" },
    { id: 4, name: "Sparris", price: "55 kr", image: "/produkter-frukt/sparris.jpeg" },
    { id: 5, name: "Blåbär", price: "40 kr", image: "/produkter-frukt/blåbär.jpeg" },
    { id: 6, name: "Rädisor", price: "20 kr", image: "/produkter-frukt/rädisor.jpeg" },
    { id: 7, name: "Färsk dill", price: "15 kr", image: "/produkter-frukt/dill.jpeg" },
    { id: 8, name: "Spenat", price: "30 kr", image: "/produkter-frukt/spenat.jpeg" },
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

  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.hasselbladslivs.se";
  const structuredData = useMemo(
    () => [
      {
        id: "schema-organization",
        data: {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Hasselblads Livs",
          url: `${origin}/`,
          logo: `${origin}/favicon.ico`,
          sameAs: ["https://www.facebook.com/", "https://www.instagram.com/"],
        },
      },
    ],
    [origin],
  );

  usePageMetadata({
    title: "Hasselblads Livs | Frukt & Grönt i Mölndal",
    description:
      "Handla färska frukter, grönsaker och delikatesser från Hasselblads Livs i Mölndal. Hemleverans, säsongens favoriter och aktuella erbjudanden.",
    canonicalPath: "/",
    ogImage: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=1200&q=80&fm=webp",
    structuredData,
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Färska råvaror från Hasselblads Livs"
            className="w-full h-full object-cover object-[center_12%] md:object-[center_25%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
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
        </div>
      </section>

      {/* Legacy highlight cards */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Godast just nu",
                  href: "/säsong?tab=godast-just-nu",
                  image: homeCardGodast,
                },
                {
                  title: "Säsongs­premiärer & Nyheter",
                  href: "/säsong?tab=nyheter",
                  image: homeCardSasong,
                },
                {
                  title: "Varor i säsong",
                  href: "/säsong?tab=i-sasong",
                  image: homeCardVaror,
                },
                {
                  title: "Erbjudanden",
                  href: "/säsong?tab=erbjudanden",
                  image: homeCardErbjudanden,
                },
              ].map((card) => (
                <Link
                  key={card.title}
                  to={card.href}
                  className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-[32px]"
                >
                  <div className="overflow-hidden rounded-[32px] shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                    <div className="aspect-[4/3]">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Säsongens bästa - 2x4 grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeader
            eyebrow="Kuraterat"
            eyebrowIcon={<Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}
            title="Säsongens bästa"
            description="Handplockade favoriter som är extra goda just nu"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {seasonalProducts.map((product) => (
              <Link key={product.id} to="/säsong?tab=godast-just-nu">
                <Card className="group cursor-pointer overflow-hidden rounded-3xl border border-white/50 bg-white/80 shadow-[0_25px_60px_rgba(15,23,42,0.12)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_35px_80px_rgba(15,23,42,0.18)]">
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-4 bottom-4 hidden rounded-2xl bg-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg backdrop-blur group-hover:flex">
                      Favorit
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-semibold text-lg leading-tight text-foreground line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-2 text-primary">
                      <Leaf className="h-4 w-4" aria-hidden="true" />
                      <p className="text-lg font-bold">{product.price}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Kategorier */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <SectionHeader
            eyebrow="Utforska sortimentet"
            eyebrowIcon={<LayoutGrid className="h-4 w-4" aria-hidden="true" />}
            title="Kategorier"
            description="Utforska våra mest uppskattade kategorier och gå direkt till rätt sortiment"
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 max-w-5xl mx-auto">
            {categoryCards.slice(0, 8).map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-[32px]"
              >
                <div className="relative aspect-square overflow-hidden rounded-[32px] shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </Link>
            ))}
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
                    loading="lazy"
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

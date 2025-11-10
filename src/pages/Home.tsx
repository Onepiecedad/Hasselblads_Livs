import { useMemo } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import SectionHeader from "@/components/sections/SectionHeader";
import heroImage from "@/assets/hero-frukt.jpg";
import homeCardGodast from "@/assets/home-card-godast.png";
import homeCardSasong from "@/assets/home-card-sasong.png";
import homeCardVaror from "@/assets/home-card-varor.png";
import homeCardErbjudanden from "@/assets/home-card-erbjudanden.png";
import { categoryCards } from "@/lib/categoryCards";
import usePageMetadata from "@/hooks/usePageMetadata";

const Home = () => {
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

    </div>
  );
};

export default Home;

import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DeliverySection from "@/components/sections/DeliverySection";
import InstagramFeed from "@/components/sections/InstagramFeed";
import HeroLeafBadge from "@/components/ui/HeroLeafBadge";
import homeCardGodast from "@/assets/home-card-godast.png";
import homeCardSasong from "@/assets/home-card-sasong.png";
import homeCardVaror from "@/assets/home-card-varor.png";
import homeCardErbjudanden from "@/assets/home-card-erbjudanden.png";
import { categoryCards } from "@/lib/categoryCards";
import usePageMetadata from "@/hooks/usePageMetadata";

// Hero slideshow images from optimized store photos
const heroImages = [
  "/hero-slideshow/DSCF0006.jpg",
  "/hero-slideshow/DSCF0007.jpg",
  "/hero-slideshow/DSCF0012.jpg",
  "/hero-slideshow/gemini-hero.jpg",
  "/hero-slideshow/DSCF0014.jpg",
  "/hero-slideshow/DSCF0018.jpg",
  "/hero-slideshow/DSCF0019.jpg",
  "/hero-slideshow/DSCF0023.jpg",
  "/hero-slideshow/DSCF0025.jpg",
  "/hero-slideshow/DSCF0029.jpg",
  "/hero-slideshow/web_DSCF0024.jpg",
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance hero slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
    ogImage: "/hero-slideshow/DSCF0003.jpg",
    structuredData,
  });

  const highlightCards = [
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
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Slideshow */}
      <section className="relative h-[450px] md:h-[550px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`Hasselblads Livs butik ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
            />
          ))}
        </div>

        {/* Leaf decoration */}
        <div className="absolute z-10 pointer-events-none hero-leaf-container">
          <HeroLeafBadge className="w-full h-auto max-h-full drop-shadow-2xl" />
        </div>
      </section>

      {/* Delivery Section with Bike Illustration */}
      <DeliverySection />

      {/* Highlight Cards - 2x2 Grid */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {highlightCards.map((card) => (
                <Link
                  key={card.title}
                  to={card.href}
                  className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-[32px]"
                >
                  <div className="overflow-hidden rounded-[32px] shadow-lg transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
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

      {/* Instagram Feed */}
      <InstagramFeed />


      {/* Kategorier - 3x3 Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-8">
            Kategorier
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 max-w-5xl mx-auto">
            {categoryCards.slice(0, 9).map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-[32px]"
              >
                <div className="relative aspect-square overflow-hidden rounded-[32px] shadow-lg transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
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

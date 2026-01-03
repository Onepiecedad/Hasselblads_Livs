import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircularGallery } from "@/components/ui/circular-gallery";
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

import { Leaf } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const parallaxContainerRef = useRef<HTMLDivElement>(null);

  // Auto-advance hero slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // 5 seconds per image
    return () => clearInterval(timer);
  }, []);

  // Direct DOM parallax for better performance and to satisfy lint rules
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const container = parallaxContainerRef.current;
      if (!container) return;

      const items = container.querySelectorAll<HTMLElement>('[data-parallax-speed]');
      items.forEach((item) => {
        if (!item) return;
        const speed = parseFloat(item.getAttribute('data-parallax-speed') || '0');
        const rot = parseFloat(item.getAttribute('data-parallax-rot') || '0');
        let transform = `translate3d(0, ${y * speed}px, 0)`;
        if (rot) {
          transform += ` rotate(${y * rot}deg)`;
        }
        item.style.transform = transform;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial call to set positions
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [parallaxContainerRef]);

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
    <div className="min-h-screen relative grain-effect">
      {/* Sublte Parallax Background Elements - Hidden on mobile */}
      <div className="parallax-bg hidden md:block" aria-hidden="true" ref={parallaxContainerRef}>
        {/* Soft Orbs - Much larger and more distinct */}
        <div
          className="parallax-orb w-[800px] h-[800px] bg-peach -top-40 -left-60"
          data-parallax-speed="0.25"
        />
        <div
          className="parallax-orb w-[1000px] h-[1000px] bg-sky top-[600px] -right-60"
          data-parallax-speed="-0.2"
        />
        <div
          className="parallax-orb w-[900px] h-[900px] bg-cream top-[1600px] -left-80"
          data-parallax-speed="0.15"
        />
        <div
          className="parallax-orb w-[800px] h-[800px] bg-pink top-[2600px] -right-40"
          data-parallax-speed="-0.1"
        />

        {/* Floating Leaves - Much larger (40px-120px) and more numerous */}
        {[
          { top: 300, left: '2%', size: 80, speed: 0.5, rot: 0.15 },
          { top: 800, right: '5%', size: 60, speed: 0.3, rot: -0.1 },
          { top: 1400, left: '10%', size: 100, speed: 0.45, rot: 0.2 },
          { top: 2000, right: '12%', size: 70, speed: 0.2, rot: -0.12 },
          { top: 2600, left: '8%', size: 120, speed: 0.6, rot: 0.25 },
          { top: 3200, right: '15%', size: 50, speed: 0.35, rot: -0.08 },
          { top: 3800, left: '5%', size: 90, speed: 0.55, rot: 0.3 },
        ].map((leaf, i) => (
          <Leaf
            key={i}
            className="parallax-leaf animate-slow-rotate"
            data-parallax-speed={leaf.speed}
            data-parallax-rot={leaf.rot}
            style={{
              top: leaf.top,
              left: leaf.left,
              right: leaf.right,
              width: leaf.size,
              height: leaf.size,
            }}
          />
        ))}
      </div>

      {/* Hero Section with Slideshow */}
      <section className="relative h-[500px] md:h-[650px] overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Crossfade slideshow - two layers for smooth transitions */}
          {heroImages.map((image, index) => {
            const isActive = index === currentSlide;
            const isPrevious = index === (currentSlide - 1 + heroImages.length) % heroImages.length;

            return (
              <img
                key={image}
                src={image}
                alt={`Hasselblads Livs butik ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover will-change-[opacity]"
                style={{
                  opacity: isActive ? 1 : 0,
                  transition: 'opacity 1200ms ease-in-out',
                  zIndex: isActive ? 2 : isPrevious ? 1 : 0,
                }}
                loading="eager"
              />
            );
          })}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20 z-10" />
        </div>

        {/* Leaf decoration - stabilized with key and memoized badge */}
        <div key="hero-leaf-badge" className="absolute z-10 pointer-events-none hero-leaf-container">
          <HeroLeafBadge className="w-full h-auto max-h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]" />
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden md:block opacity-60">
          <div className="w-[1px] h-12 bg-white/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-[slide_2s_infinite]" />
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <DeliverySection />

      {/* Highlights - Transparent background to show parallax */}
      <section className="py-20 md:py-32 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-24 relative">
              <h2 className="text-4xl md:text-6xl font-bold text-primary tracking-tight mb-8">
                Handplockat ur <br className="hidden md:block" /> sortimentet
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium opacity-70 leading-relaxed">
                Vi väljer ut det bästa för dagen. Här hittar du allt från solmogna nyheter till våra mest älskade klassiker.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10 lg:gap-14">
              {highlightCards.map((card) => (
                <Link
                  key={card.title}
                  to={card.href}
                  className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-2xl"
                >
                  <div className="space-y-5">
                    <div className="relative overflow-hidden rounded-2xl soft-shadow transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-auto transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-base font-bold text-primary transition-colors group-hover:text-primary/70 uppercase tracking-wide">
                        {card.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Kategorier - 3D Circular Gallery */}
      <section className="py-16 md:py-24 bg-transparent overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4 md:mb-6">
            <h2 className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-6">
              Våra Avdelningar
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto font-medium opacity-70 leading-relaxed">
              Dra för att utforska • Klicka för att öppna
            </p>
          </div>

          <CircularGallery
            items={categoryCards.slice(0, 9).map(c => ({
              name: c.name,
              image: c.image,
              href: c.href,
            }))}
            radius={350}
            mobileRadius={200}
            autoRotateSpeed={0.3}
            onItemClick={(item) => navigate(item.href)}
          />

          <div className="mt-16 text-center">
            <Link
              to="/webbutik"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-white text-base font-bold transition-all duration-300 hover:bg-primary/90 hover:scale-105 shadow-lg"
            >
              Se hela sortimentet
            </Link>
          </div>
        </div>
      </section>

      {/* Social Feed - At the bottom */}
      <section className="bg-transparent">
        <InstagramFeed />
      </section>

    </div>
  );
};

export default Home;

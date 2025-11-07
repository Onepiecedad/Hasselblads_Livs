import { useEffect, useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import HeroSection from "@/components/sections/HeroSection";
import SectionHeader from "@/components/sections/SectionHeader";
import TwoColumnTextImage from "@/components/sections/TwoColumnTextImage";
import TextBlock from "@/components/sections/TextBlock";
import CTASection from "@/components/sections/CTASection";
import usePageMetadata from "@/hooks/usePageMetadata";

const sustainabilityPrinciples = [
  {
    id: "eko",
    title: "Eko & närproducerat",
    content:
      "Vi prioriterar certifierade ekologiska odlare och lokala producenter inom Västra Götalandsregionen. För produkter från längre bort väljer vi leverantörer som kan visa spårbarhet och hållbara odlingsmetoder.",
  },
  {
    id: "emballage",
    title: "Emballage",
    content:
      "Vi packar i återanvändbara kylväskor och papperspåsar. Plast används endast när den förlänger hållbarheten eller skyddar ömtåliga varor. Påsar kan lämnas tillbaka vid nästa leverans.",
  },
  {
    id: "kyla",
    title: "Kylkedja & svinn",
    content:
      "Kylkedjan bryts aldrig: varorna håller 4 °C från lagret till din dörr. Råvaror som närmar sig bäst före datum tillagas i butiken eller skänks till lokala välgörenhetsinitiativ i Mölndal.",
  },
];

const About = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.hasselbladslivs.se";

  const structuredData = useMemo(
    () => [
      {
        id: "schema-about-page",
        data: {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Om Hasselblads Livs",
          url: `${origin}/om-oss`,
          description:
            "Information om Hasselblads Livs historia, hållbarhetsarbete och samarbeten med lokala producenter.",
        },
      },
    ],
    [origin],
  );

  usePageMetadata({
    title: "Om Hasselblads Livs | Vårt löfte",
    description:
      "Lär känna Hasselblads Livs i Mölndal. Läs om vår historia, hållbarhetsprinciper och samarbeten med lokala producenter.",
    canonicalPath: "/om-oss",
    ogImage: "https://images.unsplash.com/photo-1531181662980-64d09b8ba187?auto=format&fit=crop&w=1200&q=80&fm=webp",
    structuredData,
  });

  useEffect(() => {
    const scrollToHash = () => {
      if (window.location.hash === "#hallbarhet") {
        const element = document.getElementById("hallbarhet");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        eyebrow="Hasselblads Livs"
        title="Om oss"
        description="Från Davida Hasselblads charkuteri 1878 till dagens frukt- och gröntoas i Mölndal."
        backgroundImage="https://images.unsplash.com/photo-1531181662980-64d09b8ba187?auto=format&fit=crop&w=1600&q=80&fm=webp"
        imageAlt="Historisk bild av grönsaksmarknad"
        overlayClassName="from-black/70 via-black/60 to-black/30"
      />

      <section className="py-16">
        <div className="container mx-auto px-4 space-y-16">
          <SectionHeader
            eyebrow="Vårt löfte"
            title="God mat med hjärta – från Mölndal till ditt bord"
            description="Vi tror på att kombinera tradition med framtidstro. Därför väljer vi leverantörer som delar våra värderingar om kvalitet, hållbarhet och omtanke."
          />

          <TwoColumnTextImage
            title="Så väljer vi våra produkter"
            description="Våra inköp styrs av tre principer: smak, hållbarhet och relationer."
            image={{
              src: "https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&fit=crop&w=1200&q=80&fm=webp",
              alt: "Handplockade morötter på marknad",
            }}
            imagePosition="right"
          >
            <p>
              Varje vecka gör vi rundor i Mölndal och Göteborg för att träffa odlare, bagerier och småproducenter. Vi väljer ut produkter som är i säsong och som kan spåras hela vägen tillbaka till producenten.
            </p>
            <p>
              När vi tar in varor från utlandet handlar det från odlare vi själva besökt. Det ger oss kontroll över kvaliteten och gör att du kan känna dig trygg med det du äter.
            </p>
            <p>
              Sortimentet förändras över året. Det skapar variation och säkerställer att du alltid får det som smakar bäst just nu.
            </p>
          </TwoColumnTextImage>

          <div id="hallbarhet" className="scroll-mt-32 md:scroll-mt-40">
            <SectionHeader
              eyebrow="Hållbarhet"
              title="Våra hållbarhetsprinciper"
              description="Allt vi gör ska hålla över tid – för råvarorna, för vår personal och för Mölndal."
              align="left"
            />
            <Accordion type="single" collapsible className="rounded-3xl border border-border/70 bg-card px-6">
              {sustainabilityPrinciples.map((principle) => (
                <AccordionItem key={principle.id} value={principle.id}>
                  <AccordionTrigger className="text-left text-lg font-semibold">
                    {principle.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                    {principle.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <TextBlock title="Lokala initiativ och samarbeten">
            <p>
              Vi engagerar oss i Mölndal tillsammans med skolor, föreningar och lokala föreningsliv. Ett exempel är samarbetet med Mölndals stads odlingslotter där vi erbjuder plantor och utbildning för unga odlare.
            </p>
            <p>
              Varje månad bjuder vi in en lokal producent till butiken för provsmakning. Det kan vara ost från Halland, honung från Hällesåker eller handgjord kombucha från Göteborg.
            </p>
            <p>
              Genom Matsvinnsinitiativet donerar vi överskott till Stadsmissionen och lokala matbanker. På så sätt gör vi gott för både magen och samhället.
            </p>
          </TextBlock>

          <CTASection
            title="Vill du lära känna våra leverantörer?"
            description="Vi uppdaterar kontinuerligt information om gårdar, bagerier och producenter som levererar till Hasselblads Livs."
            primaryAction={{ label: "Läs mer om våra leverantörer", href: "/webbutik" }}
            secondaryAction={{ label: "Kontakta oss", href: "/kontakt" }}
          />
        </div>
      </section>
    </div>
  );
};

export default About;

import { useEffect, useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import HeroSection from "@/components/sections/HeroSection";
import SectionHeader from "@/components/sections/SectionHeader";
import TwoColumnTextImage from "@/components/sections/TwoColumnTextImage";
import TextBlock from "@/components/sections/TextBlock";
import CTASection from "@/components/sections/CTASection";
import ImageGrid, { GalleryImage } from "@/components/sections/ImageGrid";
import usePageMetadata from "@/hooks/usePageMetadata";
import aboutHeroImage from "@/assets/about-hero.jpg";

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

const historyMilestones = [
  {
    year: "1878",
    title: "Davida Hasselblad öppnar i Mölndal",
    description: "Allt börjar med ett charkuteri på Lilla Katrinelund. Familjen driver egen distribution redan från dag ett.",
  },
  {
    year: "1930–1960",
    title: "Kolonialvaror & frukt",
    description: "Sortimentet breddas och leveranserna rullar vidare genom stan – först med häst, senare med lastbil.",
  },
  {
    year: "2003",
    title: "Frejagatan 9 blir ny hemvist",
    description: "Butiken öppnar igen med fokus på frukt, grönt och delikatesser som speglar regionen.",
  },
  {
    year: "Idag",
    title: "Fjärde generationen på plats",
    description: "Familjen och ungdomarna i kvarteret driver butiken tillsammans med ett nätverk av odlare och producenter.",
  },
];

const heritageGallery: GalleryImage[] = [
  {
    src: "/Bilder%20frukt/Leverans3-frukt.jpg",
    alt: "Historisk häst och vagn med Hasselblads logotyp",
    caption: "Häst och vagn – originalleveransen från Lilla Katrinelund",
  },
  {
    src: "/Bilder%20frukt/Butik2-frukt.jpg",
    alt: "Familjen Hasselblad framför butiken",
    caption: "Familjen samlad framför butiken på Frejagatan",
  },
  {
    src: "/Bilder%20frukt/Leverans1-frukt.jpg",
    alt: "Lastcykel med Hasselblads låda",
    caption: "Leveranser med lastcykel i närområdet",
  },
  {
    src: "/Bilder%20frukt/Fasad-by-night-1536x1152.jpg",
    alt: "Fasaden kvällstid",
    caption: "Kvällsöppet med ljuset från diskarna som lyser upp torget",
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
        backgroundImage={aboutHeroImage}
        imageAlt="Leverans från Hasselblads Livs"
      />

      <section className="py-16">
        <div className="container mx-auto px-4 space-y-16">
          <SectionHeader
            eyebrow="Historia"
            title="Fyra generationer Hasselblad i Mölndal"
            description="Från Davida Hasselblads charkuteri 1878 till dagens frukt- och gröntoas på Frejagatan – alltid med egna leveranser och nära relationer till kunderna."
            align="left"
          />

          <div className="grid gap-6 md:grid-cols-2">
            {historyMilestones.map((milestone) => (
              <div key={milestone.year} className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">{milestone.year}</p>
                <h3 className="mt-2 text-2xl font-semibold">{milestone.title}</h3>
                <p className="mt-3 text-muted-foreground">{milestone.description}</p>
              </div>
            ))}
          </div>

          <ImageGrid images={heritageGallery} />

          <SectionHeader
            eyebrow="Vårt löfte"
            title="God mat med hjärta – från Mölndal till ditt bord"
            description="Vi kombinerar familjens historia med framtidstro. Allt vi säljer ska vara spårbart, omsorgsfullt odlat och utvalt för att smaka bättre hemma hos dig."
            align="left"
          />

          <TwoColumnTextImage
            title="Så väljer vi våra produkter"
            description="Våra inköp styrs av tre principer: smak, hållbarhet och relationer. Vi väljer bara råvaror som vi själva skulle bjuda familjen på."
            image={{
              src: "/Bilder%20frukt/Butik4-frukt.jpg",
              alt: "Disken med frukt och grönt på Hasselblads Livs",
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

          <TextBlock title="Relationer med våra leverantörer">
            <p>
              Våra samarbeten bygger på år av förtroende. Vi jobbar direkt med gårdarna i Västsverige, med mejerier som levererar ost samma dag och med småskaliga producenter som gör marmelad, must och lakrits i små batcher.
            </p>
            <p>
              När vi tar in något nytt handlar vi alltid först hem ett mindre parti, smakar tillsammans i butiken och bjuder kunderna på feedback. Det gör att producenterna får en tydlig bild av vad Mölndalsborna uppskattar.
            </p>
          </TextBlock>

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
            secondaryAction={{ label: "Kontakta oss", href: "/kundservice#kontakt" }}
          />
        </div>
      </section>
    </div>
  );
};

export default About;

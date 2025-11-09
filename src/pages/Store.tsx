import { useMemo } from "react";
import HeroSection from "@/components/sections/HeroSection";
import SectionHeader from "@/components/sections/SectionHeader";
import TextBlock from "@/components/sections/TextBlock";
import ImageGrid, { GalleryImage } from "@/components/sections/ImageGrid";
import TeamSection, { TeamMember } from "@/components/sections/TeamSection";
import ContactBlock from "@/components/sections/ContactBlock";
import GoogleMapEmbed from "@/components/sections/GoogleMapEmbed";
import CTASection from "@/components/sections/CTASection";
import usePageMetadata from "@/hooks/usePageMetadata";

const galleryImages: GalleryImage[] = [
  {
    src: "https://images.unsplash.com/photo-1457530378978-8bac673b8062?auto=format&fit=crop&w=900&q=80&fm=webp",
    alt: "Butikshyllor fyllda med färsk frukt",
    caption: "Färska leveranser varje morgon",
  },
  {
    src: "https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?auto=format&fit=crop&w=900&q=80&fm=webp",
    alt: "Kryddor och örter på rad",
    caption: "Örter och specialiteter i lösvikt",
  },
  {
    src: "https://images.unsplash.com/photo-1514516401255-232c9531e1d2?auto=format&fit=crop&w=900&q=80&fm=webp",
    alt: "Personal som packar frukt",
    caption: "Teamet packar dagens hemleveranser",
  },
  {
    src: "https://images.unsplash.com/photo-1504309250225-0f60034a9d9e?auto=format&fit=crop&w=900&q=80&fm=webp",
    alt: "Stenugnsbakat bröd i butik",
    caption: "Levainbröd från lokala bagerier",
  },
  {
    src: "https://images.unsplash.com/photo-1576866209830-5d2c6ea0c318?auto=format&fit=crop&w=900&q=80&fm=webp",
    alt: "Delikatessdisk med ostar",
    caption: "Ost- och delikatessdisken",
  },
  {
    src: "https://images.unsplash.com/photo-1619474264134-632d852559b6?auto=format&fit=crop&w=900&q=80&fm=webp",
    alt: "Säsongens citrusfrukter",
    caption: "Säsongens citrussortiment",
  },
];

const teamMembers: TeamMember[] = [
  {
    name: "Axel Hasselblad",
    role: "Butikschef",
    bio: "Fjärde generationen i Hasselbladsfamiljen och den som handplockar sortimentet varje morgon.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80&fm=webp",
  },
  {
    name: "Amalia Lund",
    role: "Delikatessansvarig",
    bio: "Specialiserad på ost och chark. Ansvarar för våra provsmakningar och samarbeten med lokala producenter.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80&fm=webp",
  },
  {
    name: "Milton Eriksson",
    role: "Hemleverans",
    bio: "Packar och levererar dina varor med kylbil – ser till att allt håller sig perfekt hela vägen hem.",
    image: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80&fm=webp",
  },
];

const Store = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.hasselbladslivs.se";

  const structuredData = useMemo(
    () => [
      {
        id: "schema-localbusiness",
        data: {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Hasselblads Livs",
          image: [
            "https://images.unsplash.com/photo-1457530378978-8bac673b8062?auto=format&fit=crop&w=900&q=80&fm=webp",
            "https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?auto=format&fit=crop&w=900&q=80&fm=webp",
          ],
          url: `${origin}/butiken`,
          telephone: "+46-31-123-45-67",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Frejagatan 9",
            postalCode: "43145",
            addressLocality: "Mölndal",
            addressCountry: "SE",
          },
          openingHours: ["Mo-Fr 08:00-18:00", "Sa 09:00-15:00"],
          sameAs: ["https://www.facebook.com/", "https://www.instagram.com/"],
        },
      },
    ],
    [origin],
  );

  usePageMetadata({
    title: "Butiken i Mölndal | Hasselblads Livs",
    description:
      "Besök Hasselblads Livs på Frejagatan 9 i Mölndal. Upptäck vår butik, träffa teamet och hitta hit med karta och kontaktuppgifter.",
    canonicalPath: "/butiken",
    ogImage: "https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=1200&q=80&fm=webp",
    structuredData,
  });

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        eyebrow="Hasselblads Livs"
        title="Butiken på Frejagatan"
        description="Sedan 2003 har vi förvandlat Frejagatan 9 till Mölndals gröna vardagsrum. Titta in, provsmaka och få hjälp av vårt team."
        backgroundImage="https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=1600&q=80&fm=webp"
        imageAlt="Butiksmiljö med frukt och grönsaker"
        overlayClassName="from-black/70 via-black/60 to-black/30"
      />

      <section className="py-16">
        <div className="container mx-auto px-4 space-y-16">
          <SectionHeader
            align="left"
            eyebrow="Sedan 2003"
            title="Din lokala frukt- och gröntoas"
            description="Butiken är hjärtat i Hasselblads Livs. Här möter du oss, smakar på nyheter och tar del av vår kunskap om säsongens bästa varor."
          />

          <TextBlock>
            <p>
              Varje morgon packar vi upp säsongens frukter, grönsaker och delikatesser. Många av våra leverantörer är små familjeföretag i Västsverige – andra har vi besökt på plats runtom i Europa.
            </p>
            <p>
              Vi hjälper gärna till med menyer, fruktkorgar till kontoret eller tips inför helgens middag. Berätta vad du är sugen på så guidar vi dig rätt.
            </p>
            <p>
              I butiken hittar du också ett noga kuraterat sortiment av ost, bröd, skafferivaror och drycker. Allt vi tar in ska smaka gott och ha en tydlig berättelse.
            </p>
          </TextBlock>

          <div>
            <SectionHeader
              align="left"
              eyebrow="Butiken i bilder"
              title="Ett litet smakprov"
              description="Klicka för att förstora och upplev atmosfären innan du kommer förbi."
              className="mb-8"
            />
            <ImageGrid images={galleryImages} />
          </div>

          <TeamSection members={teamMembers} />

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <ContactBlock
              addressLines={["431 45 Mölndal", "Sverige"]}
              phone="031-123 45 67"
              email="info@hasselbladslivs.se"
              openingHours={[
                { label: "Mån-fre", value: "08.00–18.00" },
                { label: "Lördag", value: "09.00–15.00" },
                { label: "Söndag", value: "Stängt" },
              ]}
            />
            <GoogleMapEmbed
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2134.896549566366!2d12.015829876500205!3d57.655479281088294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x464ff36b92f4099f%3A0xd07cd27b006bb89e!2sFrejagatan%209%2C%20431%2045%20M%C3%B6lndal!5e0!3m2!1ssv!2sse!4v1700000000000"
              title="Karta till Hasselblads Livs i Mölndal"
              height={420}
            />
          </div>

          <CTASection
            title="Planerar du ett större event eller vill boka personlig guidning?"
            description="Kontakta oss så skräddarsyr vi en provsmakning eller plockar ihop allt du behöver för middagen."
            primaryAction={{ label: "Kontakta oss", href: "/kundservice#kontakt" }}
            secondaryAction={{ label: "Se hemleverans", href: "/hemleverans" }}
          />
        </div>
      </section>
    </div>
  );
};

export default Store;

import { useMemo } from "react";
import { Camera, MapPin, Store as StoreIcon } from "lucide-react";
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
    src: "/Bilder%20frukt/Butik3-frukt.jpg",
    alt: "Tomater, squash och avokado i träbackar",
    caption: "Handskrivna skyltar och säsongens primörer",
  },
  {
    src: "/Bilder%20frukt/Butik4-frukt.jpg",
    alt: "Kund som handlar bland frukt och grönt",
    caption: "Butiken badar i dagsljus från glaspartierna",
  },
  {
    src: "/Bilder%20frukt/Butik5-frukt.jpg",
    alt: "Hyllor med marmelader och must",
    caption: "Småskaliga producenters varor i löpmeter",
  },
  {
    src: "/Bilder%20frukt/Butik7-frukt.jpg",
    alt: "Lakrits och konfektyr på rad",
    caption: "Sött & gott för presentkorgen",
  },
  {
    src: "/Bilder%20frukt/Butik8-frukt.jpg",
    alt: "Entrén med leveransbil och kryddbord",
    caption: "Vår fasad på Frejagatan en solig dag",
  },
  {
    src: "/Bilder%20frukt/Fasad-by-night-1536x1152.jpg",
    alt: "Hasselblads Livs på kvällen",
    caption: "Upplyst kvällsöppet med utsikt mot torget",
  },
];

const visitDetails = [
  {
    title: "Direktleveranser varje morgon",
    description:
      "Vi packar upp frukt, grönt och delikatesser innan öppning – frågar du så delar vi gärna smakprover och recept.",
  },
  {
    title: "Parkering & cykelställ",
    description: "Gratis parkering precis utanför och gott om plats för cyklar och lastcyklar.",
  },
  {
    title: "Hjälp med bärhjälp eller leverans",
    description: "Lämna kassan med färdiga kassar eller boka hemleverans direkt från disken.",
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
            `${origin}/Bilder%20frukt/Butik1-frukt.jpg`,
            `${origin}/Bilder%20frukt/Butik3-frukt.jpg`,
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
    ogImage: `${origin}/Bilder%20frukt/Butik1-frukt.jpg`,
    structuredData,
  });

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        eyebrow="Hasselblads Livs"
        title="Butiken på Frejagatan"
        description="Sedan 2003 har vi förvandlat Frejagatan 9 till Mölndals gröna vardagsrum. Titta in, provsmaka och få hjälp av vårt team."
        backgroundImage="/Bilder%20frukt/Butik1-frukt.jpg"
        imageAlt="Butiksmiljö med frukt och grönsaker"
      />

      <section className="py-16">
        <div className="container mx-auto px-4 space-y-16">
          <SectionHeader
            align="left"
            eyebrow="Sedan 2003"
            eyebrowIcon={<StoreIcon className="h-4 w-4" aria-hidden="true" />}
            title="Din lokala frukt- och gröntoas"
            description="Butiken är hjärtat i Hasselblads Livs. Här möter du oss, smakar på nyheter och tar del av vår kunskap om säsongens bästa varor."
          />

          <TextBlock>
            <p>
              Varje morgon fyller vi diskarna med frukt, grönsaker och handplockade delikatesser. Vi jobbar nära odlare i Västsverige och kompletterar med specialiteter från odlare vi känner personligen ute i Europa.
            </p>
            <p>
              I butiken hittar du både vardagsfavoriter och udda råvaror – fråga oss så guidar vi dig till rätt smak, lagring eller tillagning. Vi låter dig gärna provsmaka och tipsar om hur du får ut det mesta av säsongen.
            </p>
            <p>
              Sortimentet på hyllorna speglar huset: ost och chark, stenugnsbakat bröd, must, kryddor och presenter. Allt ska smaka gott och ha en tydlig berättelse.
            </p>
          </TextBlock>

          <div>
            <SectionHeader
              align="left"
              eyebrow="Inför besöket"
              eyebrowIcon={<MapPin className="h-4 w-4" aria-hidden="true" />}
              title="När du kliver in genom dörren"
              description="Gör ett ärende, handla för veckan eller kom in för att snacka råvaror med oss."
              className="mb-8"
            />
            <div className="grid gap-6 md:grid-cols-3">
              {visitDetails.map((detail) => (
                <div
                  key={detail.title}
                  className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur"
                >
                  <h3 className="text-xl font-semibold">{detail.title}</h3>
                  <p className="mt-3 text-muted-foreground">{detail.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader
              align="left"
              eyebrow="Butiken i bilder"
              eyebrowIcon={<Camera className="h-4 w-4" aria-hidden="true" />}
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

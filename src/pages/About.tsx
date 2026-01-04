import { useMemo } from "react";
import { MapPin, Phone, Clock } from "lucide-react";
import usePageMetadata from "@/hooks/usePageMetadata";


// Gallery images from the store
const galleryImages = [
  "/Bilder%20frukt/Butik3-frukt.jpg",
  "/Bilder%20frukt/Butik4-frukt.jpg",
  "/Bilder%20frukt/Butik5-frukt.jpg",
  "/Bilder%20frukt/Butik7-frukt.jpg",
];

const About = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.hasselbladslivs.se";

  const structuredData = useMemo(
    () => [
      {
        id: "schema-localbusiness",
        data: {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Hasselblads Livs",
          image: [`${origin}/Bilder%20frukt/Butik1-frukt.jpg`],
          url: `${origin}/om-oss`,
          telephone: "+46-31-27-27-92",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Frejagatan 9",
            postalCode: "43145",
            addressLocality: "Mölndal",
            addressCountry: "SE",
          },
          openingHours: ["Mo-Fr 09:00-18:00", "Sa 09:00-14:00"],
        },
      },
    ],
    [origin],
  );

  usePageMetadata({
    title: "Om oss | Hasselblads Livs",
    description:
      "Lär känna Hasselblads Livs – ett familjeägt företag med 20 års erfarenhet av frukt och grönt på Frejagatan i Mölndal.",
    canonicalPath: "/om-oss",
    ogImage: "/Bilder%20frukt/Butik1-frukt.jpg",
    structuredData,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[650px] overflow-hidden">
        <img
          src="/Bilder%20frukt/Butik1-frukt.jpg"
          alt="Hasselblads Livs butik på Frejagatan"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />


      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-16">

            {/* Om oss text */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-primary">
                Hasselblads Livs
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-4">
                <p>
                  Hasselblads Livs är ett familjeägt företag. Axel som driver butiken dagligdags har 20 års erfarenhet av frukt och grönt. Vid hans sida finns Anette, som arbetat på Hasselblads i fyra år och dessförinnan 30 år på ICA.
                </p>
                <p>
                  Hasselblads Charkuteri, som var Axels pappas släktföretag startades 1878. På 1940-talet så var det en av Sveriges största charkuteriföretag och dessutom hade de fem mataffärer i Göteborgsområdet, en i Marstrand och två i Stockholm. De hade också fem restauranger. Företaget lades tyvärr ner på mitten av 60-talet. Men nu har Axel tagit upp stafettpinnen igen.
                </p>
              </div>
            </div>

            {/* Butiken text */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-primary">
                Butiken
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-4">
                <p>
                  2003 startade Solängens Frukt och grönt på Frejagatan 9 i Mölndal. 2018 tog Axel och hans familj över. Sedan dess har det fyllts på rejält med varor, så butiken blev till slut en liten mataffär, så därför byttes namnet till ett mer passande Hasselblads Livs.
                </p>
                <p>
                  Butiken har en skön lanthandelskänsla. Fokus ligger på fräsch frukt och grönt som har höga smaker, som man gärna kan smaka på. Vi har både vanliga och lite exklusivare varor. Vi har gedigen kunskap, som vi gärna delar med oss av om så önskas. Vi gillar människor som gör att många verkar trivas bra hos oss.
                </p>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="mt-16 md:mt-24 max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryImages.map((src, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-2xl overflow-hidden shadow-lg"
                >
                  <img
                    src={src}
                    alt={`Hasselblads Livs butik ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Map Section */}
          <div className="mt-16 md:mt-24 max-w-5xl mx-auto">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Contact Info */}
              <div className="rounded-3xl bg-primary/5 border border-primary/10 p-8 space-y-6">
                <h3 className="text-xl font-bold text-primary">Hitta till oss</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Adress</p>
                      <p className="text-muted-foreground">
                        Frejagatan 9<br />
                        431 45 Mölndal
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Telefon</p>
                      <a
                        href="tel:031272792"
                        className="text-primary hover:underline font-semibold"
                      >
                        031-27 27 92
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Öppettider</p>
                      <div className="text-muted-foreground space-y-1">
                        <p>Måndag – Fredag: 09.00–18.00</p>
                        <p>Lördag: 09.00–14.00</p>
                        <p>Söndag: Stängt</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-3xl overflow-hidden shadow-lg h-[300px] lg:h-auto">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2134.896549566366!2d12.015829876500205!3d57.655479281088294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x464ff36b92f4099f%3A0xd07cd27b006bb89e!2sFrejagatan%209%2C%20431%2045%20M%C3%B6lndal!5e0!3m2!1ssv!2sse!4v1700000000000"
                  title="Karta till Hasselblads Livs i Mölndal"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

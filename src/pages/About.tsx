import { useMemo } from "react";

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
        {/* <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" /> */}


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
                  Butiken har en skön lanthandelskänsla. Fokus ligger på fräsch frukt och grönt som har höga smaker, som man gärna kan smaka på. Vi har både vanliga och lite exklusivare varor. Vi har gedigen kunskap, som vi gärna delar med oss av om så önskas. Vi gillar människor och det gör att många verkar trivas bra hos oss.
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


        </div>
      </section>
    </div>
  );
};

export default About;

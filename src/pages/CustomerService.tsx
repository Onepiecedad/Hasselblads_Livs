import { useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import usePageMetadata from "@/hooks/usePageMetadata";

const faqItems = [
  {
    id: "order",
    question: "Hur gör jag en beställning i webbutiken?",
    answer:
      "Lägg varor i korgen, gå till kassan och välj mellan hemleverans i Malevik eller upphämtning i butiken. Du får en orderbekräftelse via e-post direkt efter genomförd betalning.",
  },
  {
    id: "delivery",
    question: "När levereras min order?",
    answer:
      "Vi levererar måndag till lördag mellan 16.00 och 20.00. Du väljer tidsfönster i kassan och får en SMS-avisering samma dag som leveransen sker.",
  },
  {
    id: "payment",
    question: "Vilka betalningsalternativ accepterar ni?",
    answer:
      "Du kan betala med kort (Visa, Mastercard), Swish samt faktura via Klarna. Alla betalningar hanteras säkert och krypterat.",
  },
  {
    id: "returns",
    question: "Kan jag returnera färskvaror?",
    answer:
      "Färskvaror omfattas inte av öppet köp, men kontakta oss direkt om något inte håller måttet så ordnar vi ersättning eller ny leverans.",
  },
  {
    id: "pickup",
    question: "Kan jag hämta min order i butiken?",
    answer:
      "Ja, välj \"Hämta i butik\" i kassan. Vi meddelar dig via SMS när dina varor är packade och klara för upphämtning.",
  },
  {
    id: "subscription",
    question: "Har ni prenumeration på fruktkorgar?",
    answer:
      "Absolut – vi skräddarsyr fruktkorgar för företag och privatpersoner. Kontakta oss så tar vi fram ett upplägg som passar dig.",
  },
  {
    id: "allergies",
    question: "Hur hanterar ni allergener?",
    answer:
      "Vi märker alla produkter med tydlig allergiinformation och packar varor med omsorg i separata påsar för att undvika korskontaminering.",
  },
  {
    id: "contact",
    question: "Hur når jag kundservice snabbast?",
    answer:
      "Ring oss på 031-27 27 92 eller skicka ett meddelande via formuläret längre ned på den här sidan. Vi svarar inom 24 timmar på vardagar.",
  },
  {
    id: "delivery-area",
    question: "Levererar ni utanför Malevik?",
    answer:
      "Just nu levererar vi inom Malevik. Vår ambition är att kunna leverera längs med hela 158:an, från Askim till Onsala. Hör av dig för mer info!",
  },
  {
    id: "order-change",
    question: "Kan jag ändra min order efter att den lagts?",
    answer:
      "Kontakta oss senast klockan 12.00 samma dag som leveransen så försöker vi justera din beställning innan den packas.",
  },
];

const CustomerService = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.hasselbladslivs.se";

  const structuredData = useMemo(
    () => [
      {
        id: "schema-faq-kundservice",
        data: {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        },
      },
      {
        id: "schema-contact-kundservice",
        data: {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Kundservice - Hasselblads Livs",
          url: `${origin}/kundservice`,
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+46-31-27-27-92",
            contactType: "customer service",
            areaServed: "SE",
            availableLanguage: ["sv"],
          },
        },
      },
    ],
    [origin],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // send to backend / form service
  };

  usePageMetadata({
    title: "Kundservice | Hasselblads Livs",
    description:
      "Vanliga frågor och svar om Hasselblads Livs. Hitta information om leverans, beställning och kundsupport.",
    canonicalPath: "/kundservice",
    ogImage: "/Bilder%20frukt/Butik1-frukt.jpg",
    structuredData,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - matching other pages */}
      <section className="relative h-[500px] md:h-[650px] overflow-hidden">
        <img
          src="/Bilder%20frukt/Butik1-frukt.jpg"
          alt="Hasselblads Livs kundservice"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <span className="uppercase tracking-[0.2em] text-sm text-white/80 block mb-4">
            Hasselblads Livs • Mölndal
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Frågor och svar
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl drop-shadow-md">
            Här samlar vi allt du behöver veta om beställningar, leverans och service.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <Accordion
            type="single"
            collapsible
            aria-label="Vanliga frågor"
            className="w-full bg-card rounded-3xl border border-border/60 px-6 shadow-lg"
          >
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left text-lg font-semibold">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Policy Cards */}
      <section className="pb-16">
        <div className="container mx-auto px-4 grid gap-8 md:grid-cols-2 max-w-4xl">
          <div className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-8 transition-all duration-300 hover:shadow-xl hover:border-primary/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <h2 className="text-2xl font-bold mb-4">Köpvillkor</h2>
              <p className="text-muted-foreground leading-relaxed">
                Alla priser anges i svenska kronor inklusive moms. Order bekräftas via e-post och kan avbokas kostnadsfritt fram till att paketering påbörjas. Vid hemleverans ingår bärhjälp till dörren.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Betalning sker säkert via våra partners. Eventuella reklamationer hanteras inom 48 timmar – kontakta oss om något inte lever upp till förväntningarna.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-8 transition-all duration-300 hover:shadow-xl hover:border-primary/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <h2 className="text-2xl font-bold mb-4">Leveranspolicy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vi levererar inom Malevik måndag–lördag. Välj tidsfönster i kassan och se till att någon kan ta emot leveransen. Om du inte är hemma kan vi lämna varorna vid dörren enligt överenskommelse.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Kylvaror packas i isolerade påsar. Vid extremt väder kan leveransfönstret justeras – vi kontaktar dig då per telefon eller SMS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pb-20" id="kontakt">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Hittar du inte svaret?</h2>
            <p className="text-lg text-muted-foreground">
              Hör av dig så återkommer vi inom 24 timmar på vardagar.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-8 transition-all duration-300 hover:shadow-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <h3 className="text-2xl font-bold mb-6">Skicka ett meddelande</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="contact-name">
                      Namn
                    </label>
                    <Input id="contact-name" type="text" placeholder="Ditt namn" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="contact-email">
                      E-post
                    </label>
                    <Input id="contact-email" type="email" placeholder="din@email.se" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="contact-phone">
                      Telefon
                    </label>
                    <Input id="contact-phone" type="tel" placeholder="070-123 45 67" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="contact-message">
                      Meddelande
                    </label>
                    <Textarea
                      id="contact-message"
                      placeholder="Beskriv hur vi kan hjälpa dig..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    Skicka meddelande
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Info Cards */}
            <div className="space-y-6">
              <div className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 transition-all duration-300 hover:shadow-xl hover:border-primary/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Hitta oss</h3>
                    <p className="text-muted-foreground">
                      Frejagatan 9
                      <br />
                      431 45 Mölndal
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 transition-all duration-300 hover:shadow-xl hover:border-primary/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Ring oss</h3>
                    <a href="tel:031272792" className="text-lg font-semibold text-primary hover:underline">
                      031-27 27 92
                    </a>
                    <p className="text-muted-foreground text-sm mt-1">Mån–Fre 09.00–18.00, Lör 09.00–14.00</p>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 transition-all duration-300 hover:shadow-xl hover:border-primary/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">E-post</h3>
                    <a href="mailto:info@hasselbladslivs.se" className="text-lg font-semibold text-primary hover:underline">
                      info@hasselbladslivs.se
                    </a>
                    <p className="text-muted-foreground text-sm mt-1">Vi svarar alltid inom 24 timmar.</p>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 transition-all duration-300 hover:shadow-xl hover:border-primary/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Öppettider i butiken</h3>
                    <div className="text-muted-foreground space-y-1">
                      <p>Måndag – Fredag: 09.00–18.00</p>
                      <p>Lördag: 09.00–14.00</p>
                      <p>Söndag: Stängt</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerService;

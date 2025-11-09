import { useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
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
      "Lägg varor i korgen, gå till kassan och välj mellan hemleverans i Mölndal eller upphämtning i butiken. Du får en orderbekräftelse via e-post direkt efter genomförd betalning.",
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
      "Absolut – vi skräddarsyr fruktkorgar för företag och privatpersoner i Mölndal. Kontakta oss så tar vi fram ett upplägg som passar dig.",
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
      "Ring oss på 031-123 45 67 eller skicka ett meddelande via formuläret längre ned på den här sidan. Vi svarar inom 24 timmar på vardagar.",
  },
  {
    id: "delivery-area",
    question: "Levererar ni utanför Mölndal?",
    answer:
      "Just nu levererar vi inom Mölndal med omnejd, men vi kan ibland ordna leverans till Göteborg efter överenskommelse. Hör av dig så hjälper vi dig!",
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
            telephone: "+46-31-123-45-67",
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
      "Vanliga frågor och svar om Hasselblads Livs. Hitta information om leverans, beställning och kundsupport i Mölndal.",
    canonicalPath: "/kundservice",
    ogImage: "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1200&q=80&fm=webp",
    structuredData,
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="uppercase tracking-[0.2em] text-sm text-muted-foreground block mb-4">
            Hasselblads Livs • Mölndal
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Frågor och svar</h1>
          <p className="text-lg text-muted-foreground">
            Här samlar vi allt du behöver veta om beställningar, leverans och service. Hittar du inte svaret? Hör av dig så hjälper vi dig direkt.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Accordion
            type="single"
            collapsible
            aria-label="Vanliga frågor"
            className="w-full bg-card rounded-2xl border border-border/60 px-6"
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

      <section className="pb-16">
        <div className="container mx-auto px-4 grid gap-6 md:grid-cols-2 max-w-4xl">
          <Card className="border border-border/60">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Köpvillkor</h2>
              <p className="text-muted-foreground leading-relaxed">
                Alla priser anges i svenska kronor inklusive moms. Order bekräftas via e-post och kan avbokas kostnadsfritt fram till att paketering påbörjas. Vid hemleverans ingår bärhjälp till dörren.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Betalning sker säkert via våra partners. Eventuella reklamationer hanteras inom 48 timmar – kontakta oss om något inte lever upp till förväntningarna.
              </p>
            </CardContent>
          </Card>
          <Card className="border border-border/60">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Leveranspolicy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vi levererar inom Mölndal måndag–lördag. Välj tidsfönster i kassan och se till att någon kan ta emot leveransen. Om du inte är hemma kan vi lämna varorna vid dörren enligt överenskommelse.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Kylvaror packas i isolerade påsar. Vid extremt väder kan leveransfönstret justeras – vi kontaktar dig då per telefon eller SMS.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pb-20" id="kontakt">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Hittar du inte svaret?</h2>
            <p className="text-lg text-muted-foreground">
              Hör av dig så återkommer vi inom 24 timmar på vardagar. Telefonen är bemannad 08.00–18.00 och du kan alltid lämna ett meddelande via formuläret.
            </p>
          </div>
          <div className="grid gap-10 lg:grid-cols-2">
            <Card className="border border-border/60 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-6">Skicka ett meddelande</h3>
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
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border border-border/60">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Hitta oss</h3>
                    <p className="text-muted-foreground">
                      Frejagatan 9
                      <br />
                      431 45 Mölndal
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/60">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Ring oss</h3>
                    <a href="tel:0311234567" className="text-lg font-semibold text-primary hover:underline">
                      031-123 45 67
                    </a>
                    <p className="text-muted-foreground text-sm mt-1">Vardagar 08.00–18.00</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/60">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">E-post</h3>
                    <a href="mailto:info@hasselbladslivs.se" className="text-lg font-semibold text-primary hover:underline">
                      info@hasselbladslivs.se
                    </a>
                    <p className="text-muted-foreground text-sm mt-1">Vi svarar alltid inom 24 timmar.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/60">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Öppettider i butiken</h3>
                    <div className="text-muted-foreground space-y-1">
                      <p>Måndag – Fredag: 08.00–18.00</p>
                      <p>Lördag: 09.00–15.00</p>
                      <p>Söndag: Stängt</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerService;

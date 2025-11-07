import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Phone } from "lucide-react";
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
      "Ring oss på 031-123 45 67 eller skicka ett meddelande via formuläret på kontaktsidan. Vi svarar inom 24 timmar på vardagar.",
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
  const faqStructuredData = useMemo(
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
    ],
    [],
  );

  usePageMetadata({
    title: "Kundservice | Hasselblads Livs",
    description:
      "Vanliga frågor och svar om Hasselblads Livs. Hitta information om leverans, beställning och kundsupport i Mölndal.",
    canonicalPath: "/kundservice",
    ogImage: "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1200&q=80&fm=webp",
    structuredData: faqStructuredData,
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

      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="rounded-3xl bg-primary text-primary-foreground p-10 text-center space-y-6">
            <h2 className="text-3xl font-semibold">Hittar du inte svaret? Kontakta oss.</h2>
            <p className="text-primary-foreground/90 text-lg">
              Vårt team finns här för dig – ring, mejla eller använd formuläret så återkommer vi inom ett dygn.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="secondary" className="gap-2" asChild>
                <a href="tel:0311234567">
                  <Phone className="h-4 w-4" />
                  031-123 45 67
                </a>
              </Button>
              <Button variant="secondary" className="gap-2" asChild>
                <a href="mailto:info@hasselbladslivs.se">
                  <Mail className="h-4 w-4" />
                  info@hasselbladslivs.se
                </a>
              </Button>
              <Button variant="outline" className="gap-2 text-primary" asChild>
                <Link to="/kontakt">
                  <MessageCircle className="h-4 w-4" />
                  Kontakta oss
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerService;

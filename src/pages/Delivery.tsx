import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, MapPinCheck, NotebookPen, Truck, Leaf } from "lucide-react";
import HeroSection from "@/components/sections/HeroSection";
import AddressLookup, { DeliveryStatus } from "@/components/sections/AddressLookup";
import Steps, { StepItem } from "@/components/sections/Steps";
import DeliveryWindow, { DeliverySlot } from "@/components/sections/DeliveryWindow";
import SectionHeader from "@/components/sections/SectionHeader";
import TextBlock from "@/components/sections/TextBlock";
import CTAButtons from "@/components/sections/CTAButtons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import usePageMetadata from "@/hooks/usePageMetadata";

const deliveryAreas = [
  { label: "Centrum / Frejagatan", value: "431 45 Mölndal", postalCode: "43145" },
  { label: "Åby", value: "431 35 Mölndal", postalCode: "43135" },
  { label: "Bifrost", value: "431 32 Mölndal", postalCode: "43132" },
  { label: "Enerbacken", value: "431 37 Mölndal", postalCode: "43137" },
  { label: "Kvarnbyn", value: "431 33 Mölndal", postalCode: "43133" },
  { label: "Åby Park", value: "431 63 Mölndal", postalCode: "43163" },
];

const steps: StepItem[] = [
  {
    title: "Handla",
    description: "Välj dina favoriter i webbutiken eller ring in beställningen till butiken.",
    icon: ShoppingCart,
  },
  {
    title: "Välj hemleverans",
    description: "I kassan väljer du hemleverans och fyller i eventuell portkod eller instruktion.",
    icon: MapPinCheck,
  },
  {
    title: "Ange adress & tid",
    description: "Bekräfta adress och välj leveransfönster som passar dig bäst.",
    icon: NotebookPen,
  },
  {
    title: "Vi kör hem",
    description: "Våra chaufförer packar samma morgon och levererar kyligt och säkert.",
    icon: Truck,
  },
];

const deliverySlots: DeliverySlot[] = [
  {
    id: "weekday",
    day: "Mån – Fre",
    window: "16.00 – 20.00",
    minOrder: "400 kr",
    fee: "39 kr",
    note: "Fri frakt över 600 kr",
  },
  {
    id: "saturday",
    day: "Lördag",
    window: "10.00 – 14.00",
    minOrder: "400 kr",
    fee: "59 kr",
    note: "Perfekt för helgkassen",
  },
  {
    id: "express",
    day: "Express",
    window: "Beställ före 11.00 för samma dag",
    minOrder: "600 kr",
    fee: "119 kr",
    note: "Ring oss för bekräftelse",
  },
  {
    id: "company",
    day: "Företag",
    window: "08.00 – 12.00",
    minOrder: "750 kr",
    fee: "0 kr",
    note: "Gäller fasta abonnemang",
  },
];

const faqs = [
  {
    value: "how-to-order",
    question: "Hur långt i förväg behöver jag beställa?",
    answer:
      "Beställ senast kl. 11.00 för leverans samma dag på vardagar. För lördagsleverans räcker det att beställa kvällen innan.",
  },
  {
    value: "delivery-area",
    question: "Levererar ni utanför Mölndal?",
    answer:
      "I dagsläget levererar vi inom Mölndal med omnejd. Kontakta oss om du bor i Göteborg så ser vi om vi kan hjälpa dig vid större beställning.",
  },
  {
    value: "packing",
    question: "Hur packas mina varor?",
    answer:
      "Alla kylvaror packas i isolerade påsar och transporteras i kylbil. Ömtåliga produkter läggs överst och skyddas med extra papper.",
  },
  {
    value: "returns",
    question: "Vad händer om jag inte kan ta emot leveransen?",
    answer:
      "Hör av dig till oss så snart som möjligt. Vi kan lämna varorna vid dörren enligt överenskommelse eller boka om leveransen till ett nytt tillfälle.",
  },
];

const Delivery = () => {
  const [status, setStatus] = useState<DeliveryStatus>("idle");
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot>(deliverySlots[0]);
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.hasselbladslivs.se";

  const structuredData = useMemo(
    () => [
      {
        id: "schema-service-hemleverans",
        data: {
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Hemleverans av frukt och grönt",
          provider: {
            "@type": "LocalBusiness",
            name: "Hasselblads Livs",
            url: `${origin}/hemleverans`,
            telephone: "+46-31-123-45-67",
            areaServed: {
              "@type": "City",
              name: "Mölndal",
            },
          },
        },
      },
    ],
    [origin],
  );

  usePageMetadata({
    title: "Hemleverans i Mölndal | Hasselblads Livs",
    description:
      "Beställ hemleverans av färska varor från Hasselblads Livs i Mölndal. Kontrollera adress, välj leveransfönster och få dina råvaror samma dag.",
    canonicalPath: "/hemleverans",
    ogImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80&fm=webp",
    structuredData,
  });

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        eyebrow="Hasselblads Livs • Mölndal"
        title="Hemleverans från Mölndal – enkelt, snabbt och färskt"
        description="Beställ innan lunch och få färska råvaror levererade till din dörr samma kväll. Vi packar direkt från vår butik på Frejagatan."
        backgroundImage="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80&fm=webp"
        imageAlt="Färska grönsaker packas för hemleverans"
        overlayClassName="from-black/70 via-black/60 to-black/40"
        className="mb-12"
      />

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="space-y-12">
              <AddressLookup areas={deliveryAreas} onStatusChange={setStatus} />

              <div>
                <SectionHeader
                  align="left"
                  title="Så enkelt är hemleveransen"
                  description="Fyra steg från varukorg till dörren – hela vägen med Hasselblads kvalitet."
                />
                <Steps steps={steps} />
              </div>

              <div>
                <SectionHeader
                  align="left"
                  title="Välj leveransfönster"
                  description="Alla leveranser sker med kylbil. Vi skickar sms samma dag när bilen är på väg."
                />
                <DeliveryWindow slots={deliverySlots} onSelect={setSelectedSlot} />
              </div>

              <div>
                <SectionHeader align="left" title="Vanliga frågor" />
                <Accordion
                  type="single"
                  collapsible
                  aria-label="Frågor om hemleverans"
                  className="rounded-3xl border border-border/70 bg-card px-6"
                >
                  {faqs.map((faq) => (
                    <AccordionItem key={faq.value} value={faq.value}>
                      <AccordionTrigger className="text-left text-lg font-semibold">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>

            <aside className="space-y-6">
              <TextBlock title="Det här ingår">
                <p>
                  Vi packar alltid dina varor samma morgon och levererar i återanvändbara kylväskor. För återkommande kunder samlar vi dina väskor vid nästa leverans.
                </p>
                <p>
                  Våra chaufförer når dig via telefon om vi behöver mer information. Du kan ange portkod, hissinstruktion eller annan notering i kassan.
                </p>
              </TextBlock>

              <div className="rounded-3xl border border-primary/50 bg-primary/10 p-6 text-sm leading-relaxed text-muted-foreground">
                <p className="font-semibold text-primary">
                  {status === "available"
                    ? "Adress inom leveransområdet"
                    : status === "out-of-area"
                    ? "Adress utanför leveransområdet"
                    : "Leveransinformation"
                  }
                </p>
                {status === "available" && (
                  <p>
                    Välj tidsfönster och slutför ordern så skickar vi en bekräftelse inom kort.
                  </p>
                )}
                {status === "out-of-area" && (
                  <p>
                    Kontakta oss på <a href="tel:0311234567" className="font-semibold text-primary underline">031-123 45 67</a> så ser vi över alternativa lösningar.
                  </p>
                )}
                {status === "idle" && (
                  <p>
                    Fri hemleverans i Mölndal för order över 600 kr. Under denna gräns tillkommer en låg fraktavgift beroende på valt tidsfönster.
                  </p>
                )}
                <div className="mt-4 rounded-2xl bg-white/70 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-foreground">Valt leveransfönster</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedSlot.day} · {selectedSlot.window}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Minsta order {selectedSlot.minOrder} · Avgift {selectedSlot.fee}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Leaf className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Redo att beställa?</h3>
                </div>
                <p className="text-muted-foreground">
                  Du kan alltid lägga till en kommentar i kassan om du behöver kontaktfri leverans eller vill lämna återvinningsbara kassar.
                </p>
                <CTAButtons
                  primary={{ label: "Gå till kassan", href: "/kassa" }}
                  secondary={{ label: "Handla i webbutik", href: "/webbutik" }}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Delivery;

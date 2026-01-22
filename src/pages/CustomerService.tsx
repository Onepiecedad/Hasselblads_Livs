import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import usePageMetadata from "@/hooks/usePageMetadata";

const CustomerService = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.hasselbladslivs.se";

  const structuredData = useMemo(
    () => [
      {
        id: "schema-contact-kundservice",
        data: {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Kontakt - Hasselblads Livs",
          url: `${origin}/kundservice`,
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+46-31-87-63-50",
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
    // Form handling here
  };

  usePageMetadata({
    title: "Kontakt | Hasselblads Livs",
    description:
      "Kontakta Hasselblads Livs – ring oss på 031-87 63 50 eller besök butiken på Frejagatan 9 i Mölndal.",
    canonicalPath: "/kundservice",
    ogImage: "/Bilder%20frukt/Butik1-frukt.jpg",
    structuredData,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[650px] overflow-hidden">
        <img
          src="/Bilder%20frukt/Fasad-by-night-1536x1152.jpg"
          alt="Hasselblads Livs butiksfasad"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" /> */}
      </section>

      {/* Main Contact Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">

              {/* Contact Info */}
              <div className="space-y-10">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-8">
                    Hör av dig
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Har du frågor om våra produkter eller vill lägga en beställning?
                    Ring oss eller skicka ett meddelande – vi återkommer alltid inom 24 timmar.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Phone */}
                  <a
                    href="tel:031876350"
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ring oss</p>
                      <p className="text-xl font-semibold text-primary">031-87 63 50</p>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:info@hasselbladslivs.se"
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">E-post</p>
                      <p className="text-lg font-semibold text-primary">info@hasselbladslivs.se</p>
                    </div>
                  </a>

                  {/* Address */}
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Besök oss</p>
                      <p className="font-semibold">Frejagatan 9</p>
                      <p className="text-muted-foreground">431 44 Mölndal</p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4 p-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Öppettider</p>
                      <div className="space-y-0.5">
                        <p className="font-medium">Mån – Fre: 09.00–18.00</p>
                        <p className="font-medium">Lördag: 09.00–14.00</p>
                        <p className="text-muted-foreground">Söndag: Stängt</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:pl-8">
                <div className="rounded-3xl bg-card border border-border/60 p-8 shadow-sm">
                  <h3 className="text-xl font-bold mb-6">Skicka ett meddelande</h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="contact-name">
                        Namn
                      </label>
                      <Input
                        id="contact-name"
                        type="text"
                        placeholder="Ditt namn"
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="contact-email">
                        E-post
                      </label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="din@email.se"
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="contact-phone">
                        Telefon <span className="text-muted-foreground font-normal">(valfritt)</span>
                      </label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        placeholder="070-123 45 67"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="contact-message">
                        Meddelande
                      </label>
                      <Textarea
                        id="contact-message"
                        placeholder="Hur kan vi hjälpa dig?"
                        rows={4}
                        required
                        className="resize-none"
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full h-12 text-base">
                      Skicka meddelande
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-3xl overflow-hidden shadow-lg h-[350px] md:h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2134.896549566366!2d12.015829876500205!3d57.655479281088294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x464ff36b92f4099f%3A0xd07cd27b006bb89e!2sFrejagatan%209%2C%20431%2045%20M%C3%B6lndal!5e0!3m2!1ssv!2sse!4v1700000000000"
                title="Karta till Hasselblads Livs"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerService;

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import usePageMetadata from "@/hooks/usePageMetadata";

const Contact = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.hasselbladslivs.se";

  const structuredData = useMemo(
    () => [
      {
        id: "schema-contact-page",
        data: {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Kontakt - Hasselblads Livs",
          url: `${origin}/kontakt`,
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

  usePageMetadata({
    title: "Kontakta oss | Hasselblads Livs",
    description: "Kontakta Hasselblads Livs i Mölndal för frågor om beställningar, leverans och samarbeten.",
    canonicalPath: "/kontakt",
    ogImage: "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80&fm=webp",
    structuredData,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Kontakta oss</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Vi finns här för att hjälpa dig. Hör av dig så svarar vi så snart vi kan!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Skicka meddelande</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Namn</label>
                    <Input type="text" placeholder="Ditt namn" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">E-post</label>
                    <Input type="email" placeholder="din@email.se" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefon</label>
                    <Input type="tel" placeholder="070-123 45 67" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Meddelande</label>
                    <Textarea
                      placeholder="Skriv ditt meddelande här..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Skicka meddelande
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Adress</h3>
                  <p className="text-muted-foreground">
                    Hasselblads Livs
                    <br />
                    Frejagatan 9<br />
                    431 45 Mölndal
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Telefon</h3>
                  <p className="text-muted-foreground">031-123 45 67</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">E-post</h3>
                  <p className="text-muted-foreground">info@hasselbladslivs.se</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-peach rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Öppettider</h3>
                  <div className="text-muted-foreground space-y-1">
                    <p>Måndag - Fredag: 08:00 - 18:00</p>
                    <p>Lördag: 09:00 - 15:00</p>
                    <p>Söndag: Stängt</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

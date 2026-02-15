import { useMemo } from "react";
import { Truck, MapPin, ArrowRight, Clock } from "lucide-react";
import usePageMetadata from "@/hooks/usePageMetadata";
import AddressLookup from "@/components/sections/AddressLookup";

const Delivery = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.hasselbladslivs.se";

  const structuredData = useMemo(
    () => [
      {
        id: "schema-service-leverans",
        data: {
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Leverans av frukt och grönt",
          provider: {
            "@type": "LocalBusiness",
            name: "Hasselblads Livs",
            url: `${origin}/hemleverans`,
            telephone: "+46-31-123-45-67",
            areaServed: [
              { "@type": "Place", name: "Solängen" },
              { "@type": "Place", name: "Malevik" },
            ],
          },
        },
      },
    ],
    [origin],
  );

  usePageMetadata({
    title: "Leverans | Hasselblads Livs",
    description:
      "Beställ leverans av färska varor från Hasselblads Livs. Vi levererar till Malevik eller så hämtar du gratis i butiken.",
    canonicalPath: "/hemleverans",
    structuredData,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - matching Home and About pages */}
      <section className="relative h-[500px] md:h-[650px] overflow-hidden">
        <img
          src="/Bilder%20frukt/Leverans1-frukt.jpg"
          alt="Hasselblads Livs leverans"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

        {/* Hemleverans Badge – upper-left, elegantly balanced */}
        <div className="absolute inset-0 flex items-start justify-start pt-10 pl-6 md:pt-14 md:pl-10 lg:pt-16 lg:pl-12">
          <img
            src="/Hemleverans.png"
            alt="Hemleverans – Hasselblads Livs"
            className="w-36 h-36 md:w-52 md:h-52 lg:w-60 lg:h-60 drop-shadow-2xl"
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">

          {/* Delivery Options Grid */}
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto mb-20">

            {/* Hemleverans Card */}
            <div className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-8 transition-all duration-300 hover:shadow-xl hover:border-primary/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Truck className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-bold">Hemleverans</h2>
                </div>

                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  Vi levererar hem till dig i områdena Solängen och Malevik.
                  Vill du veta om vi kan leverera till just din adress?
                </p>

                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Beställ innan klockan 19:00, så får du dina varor redan dagen efter.
                </p>

                <div className="space-y-2 mb-5 text-sm">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Solängen</strong> – leverans kl 12–15 (eller hämta i butiken från kl 12)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Malevik</strong> – leverans kl 15–18 (eller hämta på Gamla Särövägen 153A från kl 15)
                    </span>
                  </div>
                </div>

                <AddressLookup
                  areas={[
                    { label: "Solängen", value: "solängen" },
                    { label: "Malevik", value: "malevik" },
                  ]}
                  className="mb-5 border-0 p-0 shadow-none"
                />

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold text-primary">49</span>
                  <span className="text-xl text-muted-foreground">kr</span>
                  <span className="text-muted-foreground">/ leverans</span>
                </div>

                <a
                  href="/webbutik"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300"
                >
                  Handla nu
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Hämtställe Card */}
            <div className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-8 transition-all duration-300 hover:shadow-xl hover:border-primary/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MapPin className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-bold">Hämtställe</h2>
                </div>

                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  Välkommen att hämta dina varor kostnadsfritt på ett av våra upphämtningsställen:
                </p>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold mt-0.5">1</span>
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Vår butik</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold mt-0.5">2</span>
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Gamla Särövägen 153</strong>
                      <br />
                      <span className="text-sm">(mittemot Nilssons Plantskola)</span>
                    </span>
                  </li>
                </ul>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold text-primary">Gratis</span>
                </div>

                <a
                  href="/webbutik"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300"
                >
                  Handla nu
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Delivery Area Info */}
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <MapPin className="h-4 w-4" />
              Leveransområden
            </div>

            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Solängen & Malevik
            </h3>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Nu startar vi med hemleverans i Solängen och Malevik. Vi utökar successivt vårt leveransområde med ambitionen att nå hela vägen längs Säröleden – från Askim till Särö.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Delivery;

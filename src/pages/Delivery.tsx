import { useMemo } from "react";
import { MapPin, ArrowRight, Clock } from "lucide-react";
import usePageMetadata from "@/hooks/usePageMetadata";
import AddressLookup from "@/components/sections/AddressLookup";

/** Cargo-bike icon matching Hasselblads Livs brand – filled style */
const CargoBikeIcon = ({ className = "h-7 w-7" }: { className?: string }) => (
  <svg
    viewBox="0 0 64 64"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    {/* Awning roof */}
    <rect x="3" y="8" width="28" height="3" rx="1" />
    {/* Awning support posts */}
    <rect x="5" y="11" width="2.5" height="10" />
    <rect x="26" y="11" width="2.5" height="10" />
    {/* Awning scallops */}
    <path d="M3 11 Q6.5 17 10 11 Q13.5 17 17 11 Q20.5 17 24 11 Q27.5 17 31 11 L31 14 Q27.5 20 24 14 Q20.5 20 17 14 Q13.5 20 10 14 Q6.5 20 3 14 Z" opacity="0.25" />
    {/* Cart body */}
    <path d="M3 21 L3 40 Q3 42 5 42 L28 42 Q30 42 30 40 L30 21 Z" />
    {/* Cart wheel left */}
    <circle cx="10" cy="48" r="5.5" />
    <circle cx="10" cy="48" r="2" fill="white" />
    {/* Cart wheel right */}
    <circle cx="24" cy="48" r="5.5" />
    <circle cx="24" cy="48" r="2" fill="white" />
    {/* Axle bar */}
    <rect x="3" y="42" width="27" height="2" />
    {/* Connection bar from cart to bike */}
    <rect x="30" y="33" width="10" height="2.5" rx="1" />
    {/* Bike frame – diagonal to rear wheel */}
    <path d="M40 35.5 L50.5 47 L48 48.5 L38 37 Z" />
    {/* Bike frame – seat tube */}
    <rect x="41" y="24" width="2.5" height="12" />
    {/* Seat */}
    <rect x="38" y="23" width="9" height="2.5" rx="1" />
    {/* Handlebars */}
    <path d="M42.5 28 L38 24 L39.5 22.5 L43.5 26 Z" />
    <path d="M42.5 28 L47 24 L45.5 22.5 L41.5 26 Z" />
    {/* Rear bicycle wheel */}
    <circle cx="52" cy="48" r="7.5" />
    <circle cx="52" cy="48" r="4.5" fill="white" />
    <circle cx="52" cy="48" r="2.5" />
    {/* Pedal crank */}
    <circle cx="42" cy="40" r="3" />
    <circle cx="42" cy="40" r="1.2" fill="white" />
  </svg>
);

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

          {/* Ordering Info Banner */}
          <div className="max-w-3xl mx-auto mb-16 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 text-center">
            <p className="text-xl md:text-2xl font-semibold text-foreground mb-3">
              Beställ idag – få dina varor redan nästa dag.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Beställer du två eller fler dagar i förväg kan tillgång och pris förändras.
              För att vara säker rekommenderar vi att du beställer dagen innan leverans.
            </p>
          </div>

          {/* Delivery Options Grid */}
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto mb-20">

            {/* Hemleverans Card */}
            <div className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-8 transition-all duration-300 hover:shadow-xl hover:border-primary/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CargoBikeIcon className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-bold">Hemleverans</h2>
                </div>

                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  Vi levererar till din dörr i området Malevik och i butikens omedelbara närområde.
                </p>

                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Beställ innan klockan 19:00, så får du dina varor redan dagen efter.
                </p>

                <div className="space-y-2 mb-5 text-sm">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Butikens närområde</strong> – leverans vid lunch
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Malevik</strong> – leverans efter kl 16
                    </span>
                  </div>
                </div>

                <AddressLookup
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
                      <strong className="text-foreground">I butiken på Frejagatan 9</strong>
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

import { Card, CardContent } from "@/components/ui/card";
import { Heart, Leaf, Truck, Award } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Passion för kvalitet",
      description:
        "Vi väljer noggrant ut varje produkt för att säkerställa högsta kvalitet till våra kunder.",
      color: "bg-accent",
    },
    {
      icon: Leaf,
      title: "Hållbarhet",
      description:
        "Miljön är viktig för oss. Vi satsar på ekologiska och lokalt producerade varor när det är möjligt.",
      color: "bg-primary",
    },
    {
      icon: Truck,
      title: "Snabb leverans",
      description:
        "Din beställning levereras snabbt och säkert direkt till din dörr, alltid fräsch och färsk.",
      color: "bg-secondary",
    },
    {
      icon: Award,
      title: "Många års erfarenhet",
      description:
        "Med decennier av erfarenhet vet vi vad som krävs för att leverera de bästa produkterna.",
      color: "bg-peach",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-muted/50 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Om Hasselblads Livs</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Sedan starten har vi haft en passion för färska råvaror av högsta kvalitet. Vår mission
            är att göra det enkelt för dig att få tillgång till de godaste och fräschaste
            produkterna.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Vår historia</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Hasselblads Livs grundades med en enkel men kraftfull vision: att erbjuda
                Göteborgs invånare tillgång till färska, kvalitetsgranskade frukt och grönsaker
                med enkel och snabb leverans.
              </p>
              <p>
                Genom åren har vi vuxit från en liten lokal butik till en modern webbutik som
                betjänar hela regionen. Men våra värderingar förblir desamma – kvalitet,
                fräschhet och kundnöjdhet kommer alltid först.
              </p>
              <p>
                Idag arbetar vi med noggrant utvalda leverantörer både lokalt och internationellt
                för att kunna erbjuda ett brett sortiment året runt, samtidigt som vi alltid
                prioriterar säsongens produkter och ekologiska alternativ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Våra värderingar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 ${value.color} rounded-2xl flex items-center justify-center mb-4`}
                  >
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Redo att handla?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upptäck vårt sortiment av färska produkter och upplev skillnaden med Hasselblads Livs.
          </p>
          <a href="/webbutik">
            <button className="bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors">
              Till webbutiken
            </button>
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;

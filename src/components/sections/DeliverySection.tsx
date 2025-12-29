import { Leaf, Heart, Sparkles } from "lucide-react";

const DeliverySection = () => {
  const values = [
    {
      icon: Leaf,
      title: "Kunskap",
      description: "Vi vet var maten kommer ifrån och känner våra producenter personligen.",
    },
    {
      icon: Heart,
      title: "Omsorg",
      description: "Varje produkt handplockas med kärlek och noggrannhet.",
    },
    {
      icon: Sparkles,
      title: "Glädje",
      description: "Mat ska vara en fest – vi delar vår passion med dig.",
    },
  ];

  return (
    <section className="py-12 pb-20 bg-cream/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {values.map((value) => (
            <div key={value.title} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <value.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {value.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DeliverySection;

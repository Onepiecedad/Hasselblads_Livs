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
    <section className="py-20 md:py-32 bg-cream/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24 max-w-6xl mx-auto">
          {values.map((value) => (
            <div key={value.title} className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white soft-shadow mb-10 transition-transform duration-500 group-hover:scale-110">
                <value.icon className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-6 tracking-tight uppercase">
                {value.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-xl text-balance font-medium">
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

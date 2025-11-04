import { Card, CardContent } from "@/components/ui/card";
import { Apple, Carrot, Cookie, Milk, Beef, Flower2 } from "lucide-react";
import { Link } from "react-router-dom";

const Categories = () => {
  const categories = [
    {
      name: "Frukt",
      icon: Apple,
      description: "Färsk frukt från världens hörn",
      count: "45+ produkter",
      color: "bg-accent",
    },
    {
      name: "Grönsaker",
      icon: Carrot,
      description: "Ekologiska och lokala grönsaker",
      count: "60+ produkter",
      color: "bg-primary",
    },
    {
      name: "Mejeri",
      icon: Milk,
      description: "Mjölk, ost och mejeriprodukter",
      count: "30+ produkter",
      color: "bg-secondary",
    },
    {
      name: "Bröd & Bakverk",
      icon: Cookie,
      description: "Nybakat varje dag",
      count: "25+ produkter",
      color: "bg-peach",
    },
    {
      name: "Kött & Fisk",
      icon: Beef,
      description: "Kvalitetskött och färsk fisk",
      count: "35+ produkter",
      color: "bg-yellow",
    },
    {
      name: "Blommor",
      icon: Flower2,
      description: "Färska snittblommor",
      count: "20+ produkter",
      color: "bg-accent",
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Kategorier</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Utforska vårt breda sortiment av färska produkter, noggrant utvalda för bästa kvalitet
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link key={index} to="/webbutik">
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer h-full border-2 hover:border-primary">
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <category.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                  <span className="text-sm font-medium text-primary">{category.count}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;

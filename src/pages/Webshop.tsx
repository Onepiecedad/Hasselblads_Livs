import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";

const Webshop = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const products = [
    { id: 1, name: "Ekologiska äpplen", price: 39, category: "Frukt", unit: "kg" },
    { id: 2, name: "Tomater", price: 29, category: "Grönsaker", unit: "kg" },
    { id: 3, name: "Bananer", price: 25, category: "Frukt", unit: "kg" },
    { id: 4, name: "Gurka", price: 15, category: "Grönsaker", unit: "st" },
    { id: 5, name: "Apelsiner", price: 35, category: "Frukt", unit: "kg" },
    { id: 6, name: "Sallad", price: 22, category: "Grönsaker", unit: "st" },
    { id: 7, name: "Citroner", price: 30, category: "Frukt", unit: "kg" },
    { id: 8, name: "Paprika", price: 45, category: "Grönsaker", unit: "kg" },
  ];

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Webbutik</h1>
          <p className="text-lg text-muted-foreground">
            Handla färska varor online med snabb leverans
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Sök efter produkter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-secondary/10 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 right-2">
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-primary">
                    {product.price} kr
                  </span>
                  <span className="text-sm text-muted-foreground">/{product.unit}</span>
                </div>
                <Button className="w-full group-hover:bg-accent transition-colors">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Lägg till
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Inga produkter hittades</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Webshop;

import { Link } from "react-router-dom";
import fruktGront from "@/assets/category-frukt-gront.jpg";
import mejeriAgg from "@/assets/category-mejeri-agg.png";
import skafferi from "@/assets/category-skafferi.jpg";
import sottGott from "@/assets/category-sott-gott.jpg";
import ostChark from "@/assets/category-ost-chark.jpg";
import brod from "@/assets/category-brod.jpg";
import notterTorkad from "@/assets/category-notter-torkad.jpg";
import snacksDryck from "@/assets/category-snacks-dryck.jpg";

const Categories = () => {
  const categories = [
    {
      name: "Frukt & Grönt",
      image: fruktGront,
      count: "45+ produkter",
    },
    {
      name: "Mejeri & Ägg",
      image: mejeriAgg,
      count: "30+ produkter",
    },
    {
      name: "Skafferi",
      image: skafferi,
      count: "50+ produkter",
    },
    {
      name: "Sött & Gott",
      image: sottGott,
      count: "25+ produkter",
    },
    {
      name: "Ost & Chark",
      image: ostChark,
      count: "35+ produkter",
    },
    {
      name: "Bröd",
      image: brod,
      count: "20+ produkter",
    },
    {
      name: "Nötter & Torkad frukt",
      image: notterTorkad,
      count: "15+ produkter",
    },
    {
      name: "Snacks & Dryck",
      image: snacksDryck,
      count: "40+ produkter",
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link key={index} to="/webbutik">
              <div className="group cursor-pointer h-full">
                <div className="relative aspect-square overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                  <span className="text-sm text-muted-foreground">{category.count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;

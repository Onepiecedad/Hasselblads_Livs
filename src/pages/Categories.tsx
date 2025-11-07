import { Link } from "react-router-dom";
import usePageMetadata from "@/hooks/usePageMetadata";
import { categoryCards } from "@/lib/categoryCards";

const Categories = () => {
  usePageMetadata({
    title: "Kategorier | Hasselblads Livs",
    description: "Utforska kategorierna i Hasselblads Livs webbutik: frukt, grönt, mejeri, skafferi och mer.",
    canonicalPath: "/kategorier",
    ogImage: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1200&q=80&fm=webp",
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Kategorier</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Utforska vårt breda sortiment av färska produkter, noggrant utvalda för bästa kvalitet
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {categoryCards.map((category, index) => (
            <Link
              key={index}
              to={category.href}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-[24px]"
              aria-label={category.name}
              title={category.name}
            >
              <div className="relative overflow-hidden rounded-[24px] shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span className="sr-only">
                  {category.name}. {category.description}. Utforska kategorin.
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;

import cardFruktGront from "@/assets/category-cards/final/category-frukt-gront.webp";
import cardMejeriAgg from "@/assets/category-cards/final/category-mejeri-agg.webp";
import cardSkafferi from "@/assets/category-cards/final/category-skafferi.webp";
import cardSottGott from "@/assets/category-cards/final/category-sott-gott.webp";
import cardOstChark from "@/assets/category-cards/final/category-ost-chark.webp";
import cardBrod from "@/assets/category-cards/final/category-brod.webp";
import cardNotter from "@/assets/category-cards/final/category-notter.webp";
import cardSnacksDryck from "@/assets/category-cards/final/category-snacks-dryck.webp";

export type CategoryCardData = {
  name: string;
  description: string;
  image: string;
  href: string;
  filterValue?: string;
};

export const categoryCards: CategoryCardData[] = [
  {
    name: "Frukt & Grönt",
    description: "Svenskodlade favoriter och exotiska nyheter",
    image: cardFruktGront,
    href: "/webbutik?kategori=frukt",
    filterValue: "frukt",
  },
  {
    name: "Mejeri & Ägg",
    description: "Närproducerade mejerier och gårdsfärska ägg",
    image: cardMejeriAgg,
    href: "/webbutik?kategori=mejeri",
    filterValue: "mejeri",
  },
  {
    name: "Skafferi",
    description: "Skafferifavoriter och ekologiska basvaror",
    image: cardSkafferi,
    href: "/webbutik?kategori=skafferi",
    filterValue: "skafferi",
  },
  {
    name: "Sött & Gott",
    description: "Fika, desserter och godsaker för alla tillfällen",
    image: cardSottGott,
    href: "/webbutik",
  },
  {
    name: "Ost & Chark",
    description: "Delikatesser från lokala gårdar och saluhallar",
    image: cardOstChark,
    href: "/webbutik",
  },
  {
    name: "Bröd",
    description: "Handbakat bröd, frallor och fikafavoriter",
    image: cardBrod,
    href: "/webbutik",
  },
  {
    name: "Nötter & Torkad frukt",
    description: "Krispiga snacks och energirika mellanmål",
    image: cardNotter,
    href: "/webbutik",
  },
  {
    name: "Snacks & Dryck",
    description: "Juicer, smoothies och allt för fredagsmyset",
    image: cardSnacksDryck,
    href: "/webbutik",
  },
];

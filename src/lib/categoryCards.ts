import cardFruktGront from "@/assets/category-cards/alt1-final/category-frukt-gront.webp";
import cardMejeriAgg from "@/assets/category-cards/alt1-final/category-mejeri-agg.webp";
import cardSkafferi from "@/assets/category-cards/alt1-final/category-skafferi.webp";
import cardSottGott from "@/assets/category-cards/alt1-final/category-sott-gott.webp";
import cardOstChark from "@/assets/category-cards/alt1-final/category-ost-chark.webp";
import cardBrod from "@/assets/category-cards/alt1-final/category-brod.webp";
import cardNotter from "@/assets/category-cards/alt1-final/category-notter.webp";
import cardSnacksDryck from "@/assets/category-cards/alt1-final/category-snacks-dryck.webp";
import cardKott from "@/assets/category-cards/alt1-final/category-kott.png";

export type CategoryCardData = {
  name: string;
  description: string;
  image: string;
  href: string;
  filterValue?: string;
  titleLines: string[];
};

export const categoryCards: CategoryCardData[] = [
  {
    name: "FRUKT GRÖNT",
    description: "Svenskodlade favoriter och exotiska nyheter",
    image: cardFruktGront,
    href: "/webbutik?kategori=frukt",
    filterValue: "frukt",
    titleLines: ["FRUKT", "GRÖNT"],
  },
  {
    name: "OST & CHARK",
    description: "Delikatesser från lokala gårdar och saluhallar",
    image: cardMejeriAgg,
    href: "/webbutik",
    titleLines: ["OST", "CHARK"],
  },
  {
    name: "BRÖD",
    description: "Handbakat bröd, frallor och fikafavoriter",
    image: cardSkafferi,
    href: "/webbutik",
    titleLines: ["BRÖD"],
  },
  {
    name: "MEJERI & ÄGG",
    description: "Närproducerade mejerier och gårdsfärska ägg",
    image: cardSottGott,
    href: "/webbutik?kategori=mejeri",
    filterValue: "mejeri",
    titleLines: ["MEJERI", "ÄGG"],
  },
  {
    name: "SKAFFERI",
    description: "Skafferifavoriter och ekologiska basvaror",
    image: cardOstChark,
    href: "/webbutik?kategori=skafferi",
    filterValue: "skafferi",
    titleLines: ["SKAFFERI"],
  },
  {
    name: "SÖTT & GOTT",
    description: "Fika, desserter och godsaker för alla tillfällen",
    image: cardBrod,
    href: "/webbutik",
    titleLines: ["SÖTT", "GOTT"],
  },
  {
    name: "NÖTTER TORKAD FRUKT",
    description: "Krispiga snacks och energirika mellanmål",
    image: cardNotter,
    href: "/webbutik",
    titleLines: ["NÖTTER", "TORKAD", "FRUKT"],
  },
  {
    name: "SNACKS DRYCK",
    description: "Juicer, smoothies och allt för fredagsmyset",
    image: cardSnacksDryck,
    href: "/webbutik",
    titleLines: ["SNACKS", "DRYCK"],
  },
  {
    name: "KÖTT",
    description: "Kvalitetskött från lokala gårdar och producenter",
    image: cardKott,
    href: "/webbutik?kategori=kott",
    filterValue: "kott",
    titleLines: ["KÖTT"],
  },
];

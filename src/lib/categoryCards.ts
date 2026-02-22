import cardFruktGront from "@/assets/category-cards/alt1-final/category-frukt-gront.webp";
import cardMejeriAgg from "@/assets/category-cards/alt1-final/category-mejeri-agg.webp";
import cardSkafferi from "@/assets/category-cards/alt1-final/category-skafferi.webp";
import cardOstChark from "@/assets/category-cards/alt1-final/category-ost-chark.webp";
import cardBrod from "@/assets/category-cards/alt1-final/category-brod.webp";
import cardNotter from "@/assets/category-cards/alt1-final/category-notter.webp";
import cardSnacksDryck from "@/assets/category-cards/alt1-final/category-snacks-dryck.webp";
import cardSottGott from "@/assets/category-cards/alt1-final/category-sott-gott.webp";
import cardKott from "@/assets/category-cards/alt1-final/category-kott.webp";

export type CategoryCardData = {
  name: string;
  description: string;
  image: string | null;
  href: string;
  filterValue?: string;
  titleLines: string[];
  /** Bakgrundsfärg för kort utan illustration */
  bgColor?: string;
};

export const categoryCards: CategoryCardData[] = [
  {
    name: "FRUKT GRÖNT",
    description: "Svenskodlade favoriter och exotiska nyheter",
    image: cardFruktGront,
    href: "/webbutik?kategori=frukt-gront",
    filterValue: "frukt-gront",
    titleLines: ["FRUKT", "GRÖNT"],
  },
  {
    name: "ÄGG & MEJERI",
    description: "Närproducerade mejerier och gårdsfärska ägg",
    image: cardSottGott,
    href: "/webbutik?kategori=agg-mejeri",
    filterValue: "agg-mejeri",
    titleLines: ["ÄGG", "MEJERI"],
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
    name: "OST & CHARK",
    description: "Delikatesser från lokala gårdar och saluhallar",
    image: cardMejeriAgg,
    href: "/webbutik?kategori=ost-chark",
    filterValue: "ost-chark",
    titleLines: ["OST", "CHARK"],
  },
  {
    name: "KONFEKTYR",
    description: "Choklad, lakrits och sötsaker för alla tillfällen",
    image: cardBrod,
    href: "/webbutik?kategori=konfektyr",
    filterValue: "konfektyr",
    titleLines: ["KONFEKTYR"],
  },
  {
    name: "BRÖD",
    description: "Handbakat bröd, frallor och fikafavoriter",
    image: cardSkafferi,
    href: "/webbutik?kategori=brod",
    filterValue: "brod",
    titleLines: ["BRÖD"],
  },
  {
    name: "SNACKS & DRYCK",
    description: "Juicer, smoothies och allt för fredagsmyset",
    image: cardSnacksDryck,
    href: "/webbutik?kategori=snacks-dryck",
    filterValue: "snacks-dryck",
    titleLines: ["SNACKS", "DRYCK"],
  },
  {
    name: "NÖTTER & TORKAD FRUKT",
    description: "Krispiga snacks och energirika mellanmål",
    image: cardNotter,
    href: "/webbutik?kategori=notter-torkad-frukt",
    filterValue: "notter-torkad-frukt",
    titleLines: ["NÖTTER", "TORKAD", "FRUKT"],
  },
];

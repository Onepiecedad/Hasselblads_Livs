// Focus/Handplockat cards - used for tag filtering in webshop
// Images match the homepage "Handplockat ur sortimentet" section
// 
// filterValue: Matches Firebase FeatureCardId (godast, nyheter, isasong, erbjudanden)
// fallbackTag: Used when no products are selected in PIM for this card

import type { FeatureCardId } from "@/hooks/useFeaturedContent";

export type FocusCardData = {
    name: string;
    filterValue: FeatureCardId; // Matches Firebase FeatureCardId
    fallbackTag: string; // Fallback ProductTag when no PIM products selected
    image: string;
    textPosition: "left" | "right" | "center"; // Where text should be positioned
};

export const focusCards: FocusCardData[] = [
    {
        name: "Godast\njust nu",
        filterValue: "godast",
        fallbackTag: "godast",
        image: "/Puffar_startsida_Stora_Rityta%201.jpg",
        textPosition: "right", // Illustration is on left
    },
    {
        name: "Säsongs-\npremiärer\n& nyheter",
        filterValue: "nyheter",
        fallbackTag: "nyhet",
        image: "/Puffar_startsida_Stora-02.jpg",
        textPosition: "left", // Illustration is on right
    },
    {
        name: "Varor i\nsäsong",
        filterValue: "isasong",
        fallbackTag: "sasong",
        image: "/Puffar_startsida_Stora-03.jpg",
        textPosition: "right", // Illustration is on left
    },
    {
        name: "Erbjudanden",
        filterValue: "erbjudanden",
        fallbackTag: "erbjudande",
        image: "/Puffar_startsida_Stora-04.jpg",
        textPosition: "left", // Illustration is on right
    },
];

// Helper to get fallback tag for a card ID
export const getFallbackTag = (cardId: FeatureCardId): string => {
    const card = focusCards.find(c => c.filterValue === cardId);
    return card?.fallbackTag || "";
};

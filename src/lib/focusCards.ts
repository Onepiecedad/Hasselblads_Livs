// Focus/Handplockat cards - used for tag filtering in webshop
// Images match the homepage "Handplockat ur sortimentet" section

export type FocusCardData = {
    name: string;
    tag: string; // Matches ProductTag from products.ts
    image: string;
    filterValue: string;
    textPosition: "left" | "right" | "center"; // Where text should be positioned
};

export const focusCards: FocusCardData[] = [
    {
        name: "Godast just nu",
        tag: "sasong",
        image: "/Puffar_startsida_Stora_Rityta%201.jpg",
        filterValue: "sasong",
        textPosition: "right", // Illustration is on left
    },
    {
        name: "Erbjudanden",
        tag: "erbjudande",
        image: "/Puffar_startsida_Stora-04.jpg",
        filterValue: "erbjudande",
        textPosition: "left", // Illustration is on right
    },
    {
        name: "Nyheter",
        tag: "nyhet",
        image: "/Puffar_startsida_Stora-02.jpg",
        filterValue: "nyhet",
        textPosition: "center", // Centered text
    },
    {
        name: "Klassiker",
        tag: "klassiker",
        image: "/Puffar_startsida_Stora-03.jpg",
        filterValue: "klassiker",
        textPosition: "center", // Centered text
    },
];



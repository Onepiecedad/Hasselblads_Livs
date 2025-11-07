import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import usePageMetadata from "@/hooks/usePageMetadata";

const DEFAULT_TAB = "godast-just-nu" as const;

const tabOrder = [
  "godast-just-nu",
  "nyheter",
  "i-sasong",
  "erbjudanden",
] as const;

type TabKey = (typeof tabOrder)[number];

type Product = {
  id: string;
  name: string;
  price: string;
  unit: string;
  description: string;
  badge?: "Nyhet" | "Säsong" | "Kampanj";
  image: string;
};

type TabConfig = {
  label: string;
  description: string;
  pages: Product[][];
};

const tabConfig: Record<TabKey, TabConfig> = {
  "godast-just-nu": {
    label: "Godast just nu",
    description: "Handplockade favoriter som är extra goda den här veckan.",
    pages: [
      [
        {
          id: "jordgubbar-gbg",
          name: "Svenska jordgubbar",
          price: "49 kr",
          unit: "/500 g",
          description: "Söta jordgubbar från gårdar kring Halland – plockade i gryningen.",
          badge: "Säsong",
          image:
            "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "sparris-primor",
          name: "Grön sparris",
          price: "55 kr",
          unit: "/bunt",
          description: "Krispig primör från Skåne, perfekt att grilla eller ugnsrosta.",
          badge: "Säsong",
          image:
            "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "basilika-bunt",
          name: "Färsk basilika",
          price: "25 kr",
          unit: "/kruka",
          description: "Aromatisk basilika odlade i Mölndal – klippas samma dag du handlar.",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "vattenmelon-mini",
          name: "Mini-vattenmelon",
          price: "39 kr",
          unit: "/st",
          description: "Saftiga minivattenmeloner – lagom stora för picknicken i Slottskogen.",
          badge: "Säsong",
          image:
            "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "broccoli-eko",
          name: "Ekologisk broccoli",
          price: "28 kr",
          unit: "/st",
          description: "Riktigt krispig och smakrik broccoli från ekologiska odlingar.",
          image:
            "https://images.unsplash.com/photo-1506801310323-534be5e7b71a?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "hallon-farska",
          name: "Färska hallon",
          price: "59 kr",
          unit: "/250 g",
          description: "Solmogna hallon med intensiv smak, levererade på morgonen.",
          image:
            "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "morot-bunt",
          name: "Nypotatis",
          price: "35 kr",
          unit: "/kg",
          description: "Små, nyupptagna potatisar – bara att koka och servera med dill.",
          badge: "Säsong",
          image:
            "https://images.unsplash.com/photo-1439127989242-c3749a012eac?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "sallad-mix",
          name: "Salladsmix",
          price: "29 kr",
          unit: "/påse",
          description: "Krispig blandning av späda blad och örter, skördad dagen innan leverans.",
          image:
            "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
      ],
      [
        {
          id: "persika-spanien",
          name: "Persikor",
          price: "45 kr",
          unit: "/kg",
          description: "Solmogna persikor med honungssöt smak.",
          image:
            "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "tomat-heritage",
          name: "Heritage-tomater",
          price: "39 kr",
          unit: "/500 g",
          description: "Handblandade tomater i olika färger – perfekta i sallad.",
          image:
            "https://images.unsplash.com/photo-1429552077091-836152271555?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "mangold-farsk",
          name: "Färsk mangold",
          price: "25 kr",
          unit: "/bunt",
          description: "Färgglada blad med mild smak, skördad i Västra Götaland.",
          image:
            "https://images.unsplash.com/photo-1506800910361-5f3b6c84b905?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "sockerarter",
          name: "Sockerärter",
          price: "32 kr",
          unit: "/150 g",
          description: "Knapriga och söta sockerärter – ät dem som snacks eller i sallader.",
          image:
            "https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "raddisor-primor",
          name: "Rädisor",
          price: "19 kr",
          unit: "/knippe",
          description: "Peppriga rädisor i knippe, tvättade och klara att servera.",
          image:
            "https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "aprikoser",
          name: "Aprikoser",
          price: "55 kr",
          unit: "/kg",
          description: "Söta aprikoser med mjukt fruktkött – utmärkta till dessert.",
          image:
            "https://images.unsplash.com/photo-1628510133151-34c0390cf838?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "pakchoi",
          name: "Pak choi",
          price: "24 kr",
          unit: "/st",
          description: "Mild pak choi som passar både i wok och sallader.",
          image:
            "https://images.unsplash.com/photo-1603034001776-9bbf2ea640a7?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "brod-smulan",
          name: "Levainbröd",
          price: "49 kr",
          unit: "/st",
          description: "Stenugnsbakt levain från vårt samarbete med Smulan Bageri.",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1504309250225-0f60034a9d9e?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
      ],
    ],
  },
  nyheter: {
    label: "Nyheter",
    description: "Färska tillskott i sortimentet – direkt från våra leverantörer.",
    pages: [
      [
        {
          id: "jordgubbstarta-kit",
          name: "Jordgubbstårta-kit",
          price: "129 kr",
          unit: "/kit",
          description: "Allt du behöver för att montera en tårta hemma. Koka, vispa, njut!",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "kombucha-ginger",
          name: "Kombucha Ingefära",
          price: "39 kr",
          unit: "/flaska",
          description: "Småskalig kombucha bryggd i Göteborg med frisk ingefärssmak.",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1513558161293-c67e61f0de3b?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "vegoolja",
          name: "Kallpressad rapsolja",
          price: "69 kr",
          unit: "/500 ml",
          description: "Gyllene rapsolja från Västergötland med smörig ton.",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1604908815110-a9f60f2fc33b?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "veganskt-smor",
          name: "Veganskt smör",
          price: "45 kr",
          unit: "/250 g",
          description: "Len och bredbar smörersättning från lokala Vegoköket.",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1613078530828-ec10261ab550?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "halloumi-chili",
          name: "Halloumi med chili",
          price: "49 kr",
          unit: "/250 g",
          description: "Krämig halloumi med mild chilitingling, perfekt på grillen.",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "granola-bakad",
          name: "Rostad granola",
          price: "65 kr",
          unit: "/påse",
          description: "Handgjord granola med hasselnötter från Alingsås.",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "jordnotssmor-kakao",
          name: "Jordnötssmör med kakao",
          price: "59 kr",
          unit: "/burk",
          description: "Krämigt jordnötssmör med kakao och havssalt.",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1613477852425-41efd0d9e6b0?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "glass-pistasch",
          name: "Gelato Pistage",
          price: "89 kr",
          unit: "/500 ml",
          description: "Äkta italiensk gelato från samarbetet med Gelateria Gothia.",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
      ],
      [
        {
          id: "guldkiwi",
          name: "Guldkiwi",
          price: "39 kr",
          unit: "/ask",
          description: "Extra söt kiwi med guldgul fruktkött – ny favorit i fruktdisken.",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1587049352842-4a222e784d38?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "kimchi-sesam",
          name: "Kimchi Sesam",
          price: "75 kr",
          unit: "/burk",
          description: "Lätt kryddig kimchi med rostad sesam – småskalig produktion i Majorna.",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "limonad-rabarber",
          name: "Limonad Rabarber",
          price: "35 kr",
          unit: "/flaska",
          description: "Frisk limonad gjord på rabarber från vår lokala odlare.",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "falafel-molndal",
          name: "Falafel Mölndal",
          price: "55 kr",
          unit: "/6 st",
          description: "Färsk falafel gjord på kikärtor och örter, redo att värmas.",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1598214886806-141765ccadcd?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "ost-eldost",
          name: "Eldost Grill",
          price: "59 kr",
          unit: "/200 g",
          description: "Svensk eldost som inte smälter – fantastisk på grillen.",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "glass-citron",
          name: "Sorbet Citron",
          price: "79 kr",
          unit: "/500 ml",
          description: "Handgjord sorbet med syrlig citron och zest.",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1488903809927-48c9b4e437b8?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "brygga-kaffe",
          name: "Bryggkaffe Frånda",
          price: "89 kr",
          unit: "/250 g",
          description: "Specialrostad böna från mikrorosteri i Gamlestan.",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "soppa-gazpacho",
          name: "Gazpacho",
          price: "45 kr",
          unit: "/glasflaska",
          description: "Kall soppa på tomat och paprika – serveras bäst riktigt kylskåpskall.",
          badge: "Nyhet",
          image:
            "https://images.unsplash.com/photo-1510626176961-4b37d0ae3ef2?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
      ],
    ],
  },
  "i-sasong": {
    label: "I säsong",
    description: "Varor som smakar allra bäst just nu i Mölndal med omnejd.",
    pages: [
      [
        {
          id: "sparris-vit",
          name: "Vit sparris",
          price: "65 kr",
          unit: "/bunt",
          description: "Mild vit sparris, skördad i gryningen och levererad samma dag.",
          badge: "Säsong",
          image:
            "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "jordgubbar-hog",
          name: "Jordgubbar Högsäter",
          price: "59 kr",
          unit: "/500 g",
          description: "Solmogna bär från Högsäter – endast under sommarsäsong.",
          badge: "Säsong",
          image:
            "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "rabarber",
          name: "Rabarber",
          price: "32 kr",
          unit: "/knippe",
          description: "Syrlig rabarber för paj, saft eller kompott.",
          badge: "Säsong",
          image:
            "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "farsk-lok",
          name: "Färsk lök",
          price: "18 kr",
          unit: "/bunt",
          description: "Mild lök med tunna gröna stjälkar, passar rå i sallad.",
          badge: "Säsong",
          image:
            "https://images.unsplash.com/photo-1597305877032-81bac8a7155e?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "blomkal",
          name: "Blomkål",
          price: "35 kr",
          unit: "/st",
          description: "Kokas, rostas eller mixas – blomkål i säsong är alltid ett säkert kort.",
          image:
            "https://images.unsplash.com/photo-1582515073490-dc08c1a8a799?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "spenat-baby",
          name: "Babyspenat",
          price: "24 kr",
          unit: "/påse",
          description: "Mjuka blad med mild smak, handskördad i Alingsås.",
          badge: "Säsong",
          image:
            "https://images.unsplash.com/photo-1582510003495-d5a4f4f316e6?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "blabar-vilda",
          name: "Vildplockade blåbär",
          price: "69 kr",
          unit: "/500 g",
          description: "Från skogarna runt Bohuslän – blåbär med fin syra.",
          badge: "Säsong",
          image:
            "https://images.unsplash.com/photo-1564463836391-5d7c1e7e2e50?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "koriander",
          name: "Färsk koriander",
          price: "19 kr",
          unit: "/kruka",
          description: "Odlad i växthus i Mölndal – levereras fortfarande med rötter.",
          image:
            "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
      ],
      [
        {
          id: "bjornbar",
          name: "Björnbar",
          price: "59 kr",
          unit: "/250 g",
          description: "Fyllda med antioxidanter – perfekta till dessert och bakning.",
          badge: "Säsong",
          image:
            "https://images.unsplash.com/photo-1457400126652-10c2b08e2176?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "kantarell",
          name: "Kantareller",
          price: "89 kr",
          unit: "/250 g",
          description: "Nyskördade kantareller från Västkusten – dags att steka i smör!",
          badge: "Säsong",
          image:
            "https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "ajvar",
          name: "Rostad paprikaröra",
          price: "49 kr",
          unit: "/burk",
          description: "Ajvar på ekologiska paprikor, långsamt rostad till perfekt sötma.",
          badge: "Säsong",
          image:
            "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "vindruvor",
          name: "Vindruvor röda",
          price: "39 kr",
          unit: "/500 g",
          description: "Krispiga kärnfria druvor, skördade i säsong.",
          image:
            "https://images.unsplash.com/photo-1514516401255-232c9531e1d2?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "aubergine",
          name: "Aubergine",
          price: "24 kr",
          unit: "/st",
          description: "Blank aubergine, redo för ratatouille eller grill.",
          image:
            "https://images.unsplash.com/photo-1514517627514-a2322b6b6c15?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "zucchini",
          name: "Zucchini",
          price: "19 kr",
          unit: "/st",
          description: "Mjuk zucchini med tunt skal – fungerar rå, grillad eller picklad.",
          image:
            "https://images.unsplash.com/photo-1441057206919-63d19fac2754?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "tomat-romantica",
          name: "Romantica-tomater",
          price: "34 kr",
          unit: "/ask",
          description: "Små söta tomater, perfekta att ha i sallader.",
          badge: "Säsong",
          image:
            "https://images.unsplash.com/photo-1461009683693-342af2f2d6ce?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "purjolok",
          name: "Purjolök",
          price: "22 kr",
          unit: "/st",
          description: "Purjolök med mild smak – en stapelvara när hösten närmar sig.",
          image:
            "https://images.unsplash.com/photo-1457530378978-8bac673b8062?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
      ],
    ],
  },
  erbjudanden: {
    label: "Erbjudanden",
    description: "Kampanjpriser på utvalda favoriter – gäller så långt lagret räcker.",
    pages: [
      [
        {
          id: "avokado",
          name: "Avokado 3-pack",
          price: "29 kr",
          unit: "/förpackning",
          description: "Krämiga avokados, plocka hem tre och spara 20%.",
          badge: "Kampanj",
          image:
            "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "apelsin",
          name: "Apelsiner",
          price: "25 kr",
          unit: "/kg",
          description: "Söta apelsiner från Spanien, perfekt till morgonjuice.",
          badge: "Kampanj",
          image:
            "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "morot",
          name: "Ekologiska morötter",
          price: "19 kr",
          unit: "/kg",
          description: "Svenska morötter – fina att rosta med honung.",
          badge: "Kampanj",
          image:
            "https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "paprika-mix",
          name: "Paprikamix",
          price: "29 kr",
          unit: "/3-pack",
          description: "Tre färger för samma pris som en – passa på!",
          badge: "Kampanj",
          image:
            "https://images.unsplash.com/photo-1585325701954-8685ddb50920?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "banan-ekologisk",
          name: "Ekologiska bananer",
          price: "24 kr",
          unit: "/kg",
          description: "Fairtrade-certifierade bananer till veckans bästa pris.",
          badge: "Kampanj",
          image:
            "https://images.unsplash.com/photo-1502741126161-b048400d8d76?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "potatis-fast",
          name: "Fast potatis",
          price: "15 kr",
          unit: "/kg",
          description: "Fast säsongspotatis, ät som den är eller gör potatissallad.",
          badge: "Kampanj",
          image:
            "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "kale",
          name: "Grönkål",
          price: "19 kr",
          unit: "/bunt",
          description: "Krispig grönkål – gör chips eller servera i sallad.",
          badge: "Kampanj",
          image:
            "https://images.unsplash.com/photo-1457296898342-cdd24585d095?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "juice-apelsin",
          name: "Färskpressad juice",
          price: "49 kr",
          unit: "/1 l",
          description: "Nypressad apelsinjuice varje morgon i butiken.",
          badge: "Kampanj",
          image:
            "https://images.unsplash.com/photo-1570158268183-d296b2892211?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
      ],
      [
        {
          id: "mandariner",
          name: "Mandariner",
          price: "22 kr",
          unit: "/kg",
          description: "Söta och kärnfria – perfekt mellanmål för hela familjen.",
          badge: "Kampanj",
          image:
            "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "granatapple",
          name: "Granatäpplen",
          price: "19 kr",
          unit: "/st",
          description: "Juicy granatäpplen fulla av antioxidanter.",
          badge: "Kampanj",
          image:
            "https://images.unsplash.com/photo-1518831959642-bf4c3f5d7a4a?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "citron",
          name: "Citroner",
          price: "18 kr",
          unit: "/kg",
          description: "Ekologiska citroner – pressa över fisk eller i te.",
          badge: "Kampanj",
          image:
            "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "broccoli-tv",
          name: "Broccoli 2 för 1",
          price: "29 kr",
          unit: "/2 st",
          description: "Dubbelbroccoli till rabatterat pris – bara den här veckan.",
          badge: "Kampanj",
          image:
            "https://images.unsplash.com/photo-1545952510-74916b2bf507?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "jordnotter",
          name: "Rostade jordnötter",
          price: "15 kr",
          unit: "/påse",
          description: "Lättsaltade jordnötter i praktisk portionspåse.",
          badge: "Kampanj",
          image:
            "https://images.unsplash.com/photo-1506968430777-96745270c89b?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "havremjolk",
          name: "Havredryck",
          price: "19 kr",
          unit: "/1 l",
          description: "Krämig havredryck för kaffe eller frukostflingor.",
          badge: "Kampanj",
          image:
            "https://images.unsplash.com/photo-1604908177571-808a9fcaa823?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "ostbricka",
          name: "Ostbricka",
          price: "129 kr",
          unit: "/kit",
          description: "Tre utvalda ostar med marmelad och kex – perfekt fredagsmys.",
          badge: "Kampanj",
          image:
            "https://images.unsplash.com/photo-1566393028639-39d4a7f64331?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
        {
          id: "kaffebonor",
          name: "Kaffebönor",
          price: "79 kr",
          unit: "/250 g",
          description: "Nyrostade bönor från vårt rosteri – 20% rabatt den här veckan.",
          badge: "Kampanj",
          image:
            "https://images.unsplash.com/photo-1459755486867-b55449bb39ff?auto=format&fit=crop&w=400&h=400&q=80&fm=webp",
        },
      ],
    ],
  },
};

const Season = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as TabKey | null;
  const sanitizedTab = tabOrder.includes((tabParam ?? "") as TabKey) ? (tabParam as TabKey) : DEFAULT_TAB;
  const activeTab = sanitizedTab;
  const [pagesShown, setPagesShown] = useState<Record<TabKey, number>>(() => ({
    "godast-just-nu": 1,
    nyheter: 1,
    "i-sasong": 1,
    erbjudanden: 1,
  }));

  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.hasselbladslivs.se";
  const canonicalPath = `/säsong?tab=${activeTab}`;
  const descriptionContent = useMemo(
    () =>
      `Utforska ${tabConfig[activeTab].label.toLowerCase()} hos Hasselblads Livs i Mölndal – säsongens bästa råvaror, nyheter och kampanjer.`,
    [activeTab],
  );

  const collectionStructuredData = useMemo(
    () => [
      {
        id: "schema-collection-page",
        data: {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Säsong & erbjudanden",
          url: `${origin}${canonicalPath}`,
          description: descriptionContent,
        },
      },
    ],
    [origin, canonicalPath, descriptionContent],
  );

  usePageMetadata({
    title: "Säsong & erbjudanden | Hasselblads Livs",
    description: descriptionContent,
    canonicalPath,
    ogImage: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1200&q=80&fm=webp",
    structuredData: collectionStructuredData,
  });

  useEffect(() => {
    setPagesShown((prev) => {
      if (prev[activeTab] !== undefined) {
        return prev;
      }
      return { ...prev, [activeTab]: 1 };
    });
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    if (!tabOrder.includes(value as TabKey)) return;
    const nextTab = value as TabKey;
    setPagesShown((prev) => ({ ...prev, [nextTab]: 1 }));
    setSearchParams({ tab: nextTab });
  };

  const handleLoadMore = (tab: TabKey) => {
    setPagesShown((prev) => {
      const current = prev[tab];
      const total = tabConfig[tab].pages.length;
      if (current >= total) return prev;
      return { ...prev, [tab]: current + 1 };
    });
  };

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-sm tracking-[0.2em] uppercase text-muted-foreground">
            Hasselblads Livs • Mölndal
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold">Säsong & erbjudanden</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Upptäck vad som smakar bäst just nu, senaste nyheterna i sortimentet och veckans bästa
            kampanjer – allt samlat på ett ställe.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full grid-cols-2 gap-2 md:grid-cols-4 md:max-w-3xl">
              {tabOrder.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="text-sm md:text-base"
                >
                  {tabConfig[tab].label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabOrder.map((tab) => {
            const visiblePages = tabConfig[tab].pages.slice(0, pagesShown[tab]);
            const visibleProducts = visiblePages.flat();
            const hasMore = pagesShown[tab] < tabConfig[tab].pages.length;

            return (
              <TabsContent key={tab} value={tab} className="focus-visible:outline-none">
                <div className="max-w-4xl mx-auto text-center mb-10">
                  <p className="text-muted-foreground">{tabConfig[tab].description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {visibleProducts.map((product) => (
                    <Card
                      key={`${tab}-${product.id}`}
                      className="group overflow-hidden border border-border/60 bg-card transition-all"
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                        {product.badge && (
                          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground uppercase tracking-wide">
                            {product.badge}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold leading-tight line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-primary">{product.price}</span>
                            <span className="text-sm text-muted-foreground">{product.unit}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-10 text-center">
                    <Button onClick={() => handleLoadMore(tab)} variant="outline" size="lg">
                      Visa fler produkter
                    </Button>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        <div className="mt-16 rounded-3xl bg-primary/5 p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">
            Vill du se ännu fler favoriter?
          </h2>
          <p className="text-muted-foreground mb-6">
            Utforska hela sortimentet i vår webbutik eller besök oss på Frejagatan i Mölndal.
          </p>
          <Button asChild size="lg">
            <a href="/webbutik">Till webbutiken</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Season;

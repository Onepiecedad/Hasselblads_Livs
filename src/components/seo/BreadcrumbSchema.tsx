import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const LABEL_MAP: Record<string, string> = {
  "": "Hem",
  webbutik: "Webbutik",
  "säsong": "Säsong & Erbjudanden",
  hemleverans: "Hemleverans",
  butiken: "Butiken",
  "om-oss": "Om oss",
  kundservice: "Kundservice",
  kassa: "Kassa",
};

const BreadcrumbSchema = () => {
  const location = useLocation();

  useEffect(() => {
    const origin = window.location?.origin ?? "";
    const segments = location.pathname.split("/").filter(Boolean);

    const itemListElement = [
      {
        "@type": "ListItem",
        position: 1,
        name: LABEL_MAP[""] ?? "Hem",
        item: `${origin}/`,
      },
    ];

    let pathAccumulator = "";
    segments.forEach((segment, index) => {
      pathAccumulator += `/${segment}`;
      const decodedSegment = decodeURIComponent(segment);
      const name = LABEL_MAP[decodedSegment] ?? decodedSegment;
      itemListElement.push({
        "@type": "ListItem",
        position: index + 2,
        name,
        item: `${origin}${pathAccumulator}`,
      });
    });

    const data = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement,
    };

    const scriptId = "schema-breadcrumb-list";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = scriptId;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);

    return () => {
      if (script) {
        script.remove();
      }
    };
  }, [location.pathname]);

  return null;
};

export default BreadcrumbSchema;

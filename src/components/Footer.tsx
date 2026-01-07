import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";

const Footer = () => {
  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.hasselbladslivs.se";
    const scriptId = "schema-localbusiness-footer";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = scriptId;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Hasselblads Livs",
      url: `${origin}/butiken`,
      telephone: "+46-31-123-45-67",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Frejagatan 9",
        postalCode: "43145",
        addressLocality: "Mölndal",
        addressCountry: "SE",
      },
      openingHours: ["Mo-Fr 08:00-18:00", "Sa 09:00-15:00"],
      sameAs: ["https://www.facebook.com/", "https://www.instagram.com/"],
    });

    return () => {
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <footer className="bg-primary">
      <div className="w-full px-4 md:px-8 py-6 md:py-8">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center group" aria-label="Hasselblads Livs startsida">
            <img
              src="/logo-horizontal-green.png"
              alt="Hasselblads Livs logotyp"
              className="h-14 md:h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-110 invert brightness-0"
              decoding="async"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";
import hasselbladsSymbol from "@/assets/logo-hasselblads-symbol.png";

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
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-6">
          {/* Logo centered on mobile */}
          <Link to="/" className="group" aria-label="Hasselblads Livs startsida">
            <img
              src={hasselbladsSymbol}
              alt="Hasselblads Livs logotyp"
              className="h-12 w-12 md:h-16 md:w-16 rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
              style={{ filter: 'brightness(0) invert(1)' }}
              decoding="async"
            />
          </Link>

          {/* Contact info */}
          <div className="flex flex-col items-center gap-1 text-center md:flex-row md:gap-2">
            <span className="text-sm text-white/80">Frejagatan 9, Mölndal</span>
            <span className="hidden md:inline text-white/30">•</span>
            <span className="text-sm text-white/80">031-123 45 67</span>
          </div>

          {/* Social icons with larger touch targets */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/hasselbladslivs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 md:w-10 md:h-10 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:border-white active:scale-95 transition-all duration-300"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://www.instagram.com/hasselbladslivs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 md:w-10 md:h-10 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:border-white active:scale-95 transition-all duration-300"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

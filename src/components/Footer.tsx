import { useEffect } from "react";
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
      <div className="w-full px-4 md:px-8 py-4 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
          {/* Brand & Info */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-center md:text-left">
            <span className="text-base md:text-lg font-serif italic text-white">
              Hasselblads Livs
            </span>
            <span className="hidden md:inline text-white/30">|</span>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-xs md:text-sm text-white/70">
              <span>Frejagatan 9, Mölndal</span>
              <span className="opacity-50">•</span>
              <span>031-123 45 67</span>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/hasselbladslivs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-all duration-300"
              aria-label="Facebook"
            >
              <Facebook className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </a>
            <a
              href="https://www.instagram.com/hasselbladslivs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-all duration-300"
              aria-label="Instagram"
            >
              <Instagram className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

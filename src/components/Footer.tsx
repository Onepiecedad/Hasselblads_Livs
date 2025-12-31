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
    <footer className="bg-background border-t border-border/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Info */}
          <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
            <span className="text-lg font-serif italic text-primary">
              Hasselblads Livs
            </span>
            <span className="hidden md:inline text-muted-foreground/30">|</span>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>Frejagatan 9, Mölndal</span>
              <span className="opacity-30">•</span>
              <span>031-123 45 67</span>
              <span className="opacity-30">•</span>
              <a href="mailto:info@hasselbladslivs.se" className="hover:text-primary transition-colors">info@hasselbladslivs.se</a>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/hasselbladslivs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://www.instagram.com/hasselbladslivs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-border/20 text-center text-xs text-muted-foreground/70">
          <p>&copy; {new Date().getFullYear()} Hasselblads Livs</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

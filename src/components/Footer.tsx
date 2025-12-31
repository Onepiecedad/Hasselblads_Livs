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
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Brand & Info */}
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <h2 className="text-2xl font-serif italic text-primary">
              Hasselblads Livs
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-x-3 gap-y-2 text-muted-foreground font-medium">
              <span>Frejagatan 9, Mölndal</span>
              <span className="hidden md:inline opacity-30">•</span>
              <span>031-123 45 67</span>
              <span className="hidden md:inline opacity-30">•</span>
              <a href="mailto:info@hasselbladslivs.se" className="hover:text-primary transition-colors">info@hasselbladslivs.se</a>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-6">
            <a
              href="https://www.facebook.com/hasselbladslivs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:scale-110 transition-all duration-300 shadow-sm"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/hasselbladslivs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:scale-110 transition-all duration-300 shadow-sm"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-border/30 text-center text-sm text-muted-foreground uppercase tracking-widest font-medium">
          <p>&copy; {new Date().getFullYear()} Hasselblads Livs</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

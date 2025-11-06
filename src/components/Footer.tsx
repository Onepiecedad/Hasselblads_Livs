import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hasselblads Livs</h3>
            <p className="text-sm opacity-90">
              Färsk frukt och grönt av högsta kvalité med snabb leverans direkt till din dörr.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Snabblänkar</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/om-oss" className="hover:opacity-80 transition-opacity">
                  Om oss
                </Link>
              </li>
              <li>
                <Link to="/kundservice" className="hover:opacity-80 transition-opacity">
                  Frågor & Svar
                </Link>
              </li>
              <li>
                <Link to="/kopvillkor" className="hover:opacity-80 transition-opacity">
                  Köpvillkor
                </Link>
              </li>
              <li>
                <Link to="/hemleverans" className="hover:opacity-80 transition-opacity">
                  Leverans
                </Link>
              </li>
              <li>
                <Link to="/hallbarhet" className="hover:opacity-80 transition-opacity">
                  Hållbarhet
                </Link>
              </li>
              <li>
                <Link to="/kontakt" className="hover:opacity-80 transition-opacity">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>031-123 45 67</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@hasselbladslivs.se</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Frejagatan 12<br />Mölndal, Sverige</span>
              </li>
            </ul>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Öppettider</h4>
              <p className="text-sm opacity-90">Mån-Fre: 08:00-18:00</p>
              <p className="text-sm opacity-90">Lör: 09:00-15:00</p>
              <p className="text-sm opacity-90">Sön: Stängt</p>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Följ oss</h3>
            <div className="flex gap-4">
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm opacity-90">
          <p>&copy; {new Date().getFullYear()} Hasselblads Livs. Alla rättigheter förbehållna.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

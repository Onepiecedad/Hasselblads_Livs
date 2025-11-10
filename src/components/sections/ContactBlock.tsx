import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface OpeningHour {
  label: string;
  value: string;
}

interface ContactBlockProps {
  addressLines: string[];
  phone: string;
  email: string;
  openingHours: OpeningHour[];
  className?: string;
}

const ContactBlock = ({ addressLines, phone, email, openingHours, className }: ContactBlockProps) => (
  <div
    className={cn(
      "rounded-3xl border border-white/60 bg-white/85 p-8 shadow-[0_30px_70px_rgba(15,23,42,0.12)] backdrop-blur supports-[backdrop-filter]:bg-white/75",
      className,
    )}
  >
    <h2 className="text-3xl font-bold mb-6">Kontakt</h2>
    <div className="space-y-4 text-muted-foreground">
      <div className="flex items-start gap-3">
        <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
        <div>
          <p className="font-semibold text-foreground">Frejagatan 9</p>
          {addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
        <a href={`tel:${phone.replaceAll(" ", "")}`} className="font-medium text-foreground hover:underline">
          {phone}
        </a>
      </div>
      <div className="flex items-center gap-3">
        <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
        <a href={`mailto:${email}`} className="font-medium text-foreground hover:underline">
          {email}
        </a>
      </div>
      <div className="flex items-start gap-3">
        <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
        <div>
          {openingHours.map((item) => (
            <p key={item.label} className="flex gap-2">
              <span className="min-w-[100px] font-semibold text-foreground">{item.label}:</span>
              <span>{item.value}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ContactBlock;

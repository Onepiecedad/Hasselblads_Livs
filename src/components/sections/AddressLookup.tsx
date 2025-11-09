import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DeliveryStatus = "idle" | "available" | "out-of-area";

interface DeliveryArea {
  label: string;
  value: string;
  postalCode?: string;
}

interface AddressLookupProps {
  areas: DeliveryArea[];
  onStatusChange?: (status: DeliveryStatus) => void;
  className?: string;
}

const AddressLookup = ({ areas, onStatusChange, className }: AddressLookupProps) => {
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<DeliveryStatus>("idle");
  const [selectedArea, setSelectedArea] = useState<DeliveryArea | null>(null);

  const updateStatus = (next: DeliveryStatus, area: DeliveryArea | null) => {
    setStatus(next);
    setSelectedArea(area);
    onStatusChange?.(next);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = inputValue.trim().toLowerCase();
    if (!query) {
      updateStatus("idle", null);
      return;
    }

    const match = areas.find((area) => {
      const haystack = `${area.label} ${area.value} ${area.postalCode ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });

    if (match) {
      updateStatus("available", match);
    } else {
      updateStatus("out-of-area", null);
    }
  };

  return (
    <div className={cn("rounded-3xl border border-border/70 bg-card p-6 shadow-sm", className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="address" className="text-sm font-medium text-muted-foreground">
            Ange din adress i Mölndal för att kontrollera hemleverans
          </label>
          <Input
            id="address"
            type="text"
            placeholder="Ex. Frejagatan 9, 431 45 Mölndal"
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              if (status !== "idle") {
                updateStatus("idle", null);
              }
            }}
            className="mt-2"
            autoComplete="street-address"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Leverans inom Mölndal måndag–lördag kl. 16.00–20.00
          </div>
          <Button type="submit">Kontrollera adress</Button>
        </div>
      </form>

      <div className="mt-4 space-y-2" aria-live="polite">
        {status === "available" && selectedArea && (
          <div className="rounded-xl border border-primary/50 bg-primary/10 px-4 py-3 text-sm">
            <p className="font-semibold text-primary">Leverans möjlig!</p>
            <p className="text-muted-foreground">
              Vi levererar till {selectedArea.label}. Välj leveransdag och tid nedan.
            </p>
          </div>
        )}
        {status === "available" && !selectedArea && (
          <div className="rounded-xl border border-primary/50 bg-primary/10 px-4 py-3 text-sm">
            <p className="font-semibold text-primary">Leverans möjlig!</p>
            <p className="text-muted-foreground">Vi levererar till din adress. Välj leveransdag och tid nedan.</p>
          </div>
        )}

        {status === "out-of-area" && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm">
            <p className="font-semibold text-destructive">Utanför leveransområdet</p>
            <p className="text-muted-foreground">
              Kontakta oss så undersöker vi möjligheten till leverans eller upphämtning i butiken.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressLookup;

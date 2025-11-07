import { useState } from "react";
import { cn } from "@/lib/utils";

export interface DeliverySlot {
  id: string;
  day: string;
  window: string;
  minOrder: string;
  fee: string;
  note?: string;
}

interface DeliveryWindowProps {
  slots: DeliverySlot[];
  onSelect?: (slot: DeliverySlot) => void;
  className?: string;
}

const DeliveryWindow = ({ slots, onSelect, className }: DeliveryWindowProps) => {
  const [activeSlotId, setActiveSlotId] = useState(slots[0]?.id ?? "");

  const activeSlot = slots.find((slot) => slot.id === activeSlotId) ?? slots[0];

  const handleClick = (slot: DeliverySlot) => {
    setActiveSlotId(slot.id);
    onSelect?.(slot);
  };

  return (
    <div className={cn("rounded-3xl border border-border/70 bg-card p-6 shadow-sm", className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        {slots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            onClick={() => handleClick(slot)}
            className={cn(
              "rounded-2xl border px-5 py-4 text-left transition-all",
              "border-border/60 bg-muted/30 hover:border-primary/60 hover:bg-primary/5",
              activeSlotId === slot.id && "border-primary bg-primary/10 shadow-sm",
            )}
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {slot.day}
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">{slot.window}</p>
            <p className="mt-3 text-sm text-muted-foreground">Minsta order: {slot.minOrder}</p>
            <p className="text-sm text-muted-foreground">Leveransavgift: {slot.fee}</p>
            {slot.note && <p className="mt-2 text-xs text-muted-foreground/80">{slot.note}</p>}
          </button>
        ))}
      </div>

      {activeSlot && (
        <div className="mt-6 rounded-2xl bg-muted/40 p-4 text-sm text-muted-foreground">
          <p>
            Vald leverans: <span className="font-semibold text-foreground">{activeSlot.day}</span> mellan {activeSlot.window}. Vi skickar SMS samma dag med exakt leveranstid.
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliveryWindow;

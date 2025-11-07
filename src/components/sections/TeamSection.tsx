import { cn } from "@/lib/utils";

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  image: string;
}

interface TeamSectionProps {
  title?: string;
  members: TeamMember[];
  className?: string;
}

const TeamSection = ({ title = "Teamet", members, className }: TeamSectionProps) => (
  <section className={cn("space-y-8", className)}>
    <div className="text-left">
      <h2 className="text-3xl font-bold">{title}</h2>
      <p className="mt-2 text-lg text-muted-foreground">Personerna bakom disken i Mölndal</p>
    </div>
    <div className="grid gap-6 md:grid-cols-3">
      {members.map((member) => (
        <div key={member.name} className="flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
          <div className="relative overflow-hidden">
            <img
              src={member.image}
              alt={`${member.name}, ${member.role}`}
              loading="lazy"
              className="h-64 w-full object-cover"
            />
          </div>
          <div className="p-5">
            <h3 className="text-xl font-semibold">{member.name}</h3>
            <p className="text-sm text-primary uppercase tracking-wide">{member.role}</p>
            {member.bio && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{member.bio}</p>}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default TeamSection;

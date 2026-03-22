import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";

const experiments = [
  {
    title: "UI Motion Lab",
    description:
      "A sandbox for small interface ideas, transitions and interaction patterns worth reusing later.",
  },
  {
    title: "Data Widgets",
    description:
      "Small product experiments that help profile pages feel alive once Supabase-backed data lands.",
  },
  {
    title: "Mini mechanics",
    description:
      "Quick game prototypes that can graduate into full modules if players respond well.",
  },
];

export default function ExperimentsPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Experiments"
        title="A place for fast ideas and polished prototypes."
        description="This section protects momentum: not every concept needs to be a full product before it has a home in the platform."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {experiments.map((experiment) => (
          <Card className="space-y-4" key={experiment.title}>
            <h2 className="text-xl font-semibold text-white">{experiment.title}</h2>
            <p className="text-sm leading-7 text-slate-300">
              {experiment.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

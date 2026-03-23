import { Badge } from "@/components/ui/badge";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl space-y-4">
      <Badge>{eyebrow}</Badge>
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
          {title}
        </h1>
        <p className="text-lg leading-8 text-[#F7F3EB]/78">{description}</p>
      </div>
    </div>
  );
}

import { ItemCard } from "@/components/item-card";
import { SectionHeading } from "@/components/section-heading";
import { catalogItems } from "@/lib/catalog";

export default function GamesPage() {
  const games = catalogItems.filter((item) => item.category === "game");

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Games"
        title="Polished browser games with clean logic."
        description="This section is where casual play meets better engineering practices, starting with a reboot of the original blackjack project."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {games.map((item) => (
          <ItemCard item={item} key={item.slug} />
        ))}
      </div>
    </div>
  );
}

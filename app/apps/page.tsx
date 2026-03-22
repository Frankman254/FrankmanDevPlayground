import { ItemCard } from "@/components/item-card";
import { SectionHeading } from "@/components/section-heading";
import { catalogItems } from "@/lib/catalog";

export default function AppsPage() {
  const apps = catalogItems.filter((item) => item.category === "app");

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Apps"
        title="Useful tools that can grow with user data."
        description="The apps side of the playground focuses on practical utilities that work instantly for guests and become even better when profiles and sync are enabled."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {apps.map((item) => (
          <ItemCard item={item} key={item.slug} />
        ))}
      </div>
    </div>
  );
}

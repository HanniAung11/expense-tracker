import { CATEGORIES } from "@/types";
import { Badge } from "@/components/ui/badge";

interface CategoryBadgeProps {
  category: string;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const categoryData = CATEGORIES.find((c) => c.name === category);

  if (!categoryData) {
    return <Badge>{category}</Badge>;
  }

  return (
    <Badge
      className={`${categoryData.color} text-white border-0`}
      variant="default"
    >
      <span className="mr-1">{categoryData.icon}</span>
      {categoryData.name}
    </Badge>
  );
}


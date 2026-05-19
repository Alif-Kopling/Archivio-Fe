import { Button, Card } from "@heroui/react";
import { FC, ReactNode } from "react";

export interface SettingCategory {
  id: string;
  label: string;
  icon: ReactNode;
  description: string;
}

interface CategorySidebarProps {
  categories: SettingCategory[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export const CategorySidebar: FC<CategorySidebarProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <Card className="w-60 flex-shrink-0 p-2 h-fit">
      <nav className="space-y-0.5">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            className={`w-full flex items-center gap-3 px-3 py-2.5 justify-start text-left ${
              activeCategory === cat.id
                ? "bg-primary/10 text-primary"
                : "hover:bg-default-50 text-default-600"
            }`}
            variant="ghost"
            onPress={() => onCategoryChange(cat.id)}
          >
            <div className={activeCategory === cat.id ? "text-primary" : ""}>
              {cat.icon}
            </div>
            <span className="font-medium text-sm">{cat.label}</span>
          </Button>
        ))}
      </nav>
    </Card>
  );
};

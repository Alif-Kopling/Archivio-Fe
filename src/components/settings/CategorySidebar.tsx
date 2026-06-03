import { Button } from "@heroui/react";
import { FC, ReactNode } from "react";
import { motion } from "framer-motion";

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
    <nav className="w-72 flex-shrink-0 p-3 rounded-[32px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col gap-2 h-fit">
      <div className="px-4 py-2">
        <h2 className="text-xs font-black text-default-400 uppercase tracking-widest">
          Configuration
        </h2>
      </div>

      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;

        return (
          <Button
            key={cat.id}
            className={`group w-full flex items-center gap-4 px-5 py-4 justify-start transition-all duration-500 font-bold rounded-2xl ${
              isActive
                ? "bg-primary text-white shadow-xl shadow-primary/30 dark:bg-primary dark:text-white"
                : "bg-transparent text-default-600 hover:bg-black/10 hover:text-black dark:text-default-500 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
            variant="flat"
            onPress={() => onCategoryChange(cat.id)}
          >
            <div
              className={`transition-transform duration-500 group-hover:scale-110 ${isActive ? "text-white" : "text-primary dark:text-primary"}`}
            >
              {cat.icon}
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-sm tracking-tight">{cat.label}</span>
              {isActive && (
                <motion.span
                  animate={{ opacity: 0.8, x: 0 }}
                  className="text-[10px] font-medium"
                  initial={{ opacity: 0, x: -5 }}
                >
                  {cat.description}
                </motion.span>
              )}
            </div>
          </Button>
        );
      })}
    </nav>
  );
};

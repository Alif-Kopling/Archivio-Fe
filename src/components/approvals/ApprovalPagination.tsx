import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FC } from "react";

interface ApprovalPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const ApprovalPagination: FC<ApprovalPaginationProps> = ({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
}) => (
  <div className="flex flex-col gap-3 border-t border-divider px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-xs text-default-500">
      Showing{" "}
      <span className="font-semibold text-foreground">
        {total === 0 ? 0 : (currentPage - 1) * pageSize + 1}
      </span>{" "}
      to{" "}
      <span className="font-semibold text-foreground">
        {Math.min(currentPage * pageSize, total)}
      </span>{" "}
      of <span className="font-semibold text-foreground">{total}</span> pending
      documents
    </p>
    {totalPages > 1 ? (
      <div className="flex items-center gap-2">
        <Button
          isDisabled={currentPage <= 1}
          size="sm"
          variant="ghost"
          className="h-8 text-xs font-semibold"
          onPress={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={14} />
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {(() => {
            const start = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
            const end = Math.min(totalPages, start + 2);
            const pages = [];
            for (let i = start; i <= end; i++) pages.push(i);
            return pages.map((p) => (
              <button
                key={p}
                className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all duration-150 ${
                  p === currentPage
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-default-400 hover:bg-default-100"
                }`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            ));
          })()}
        </div>
        <Button
          isDisabled={currentPage >= totalPages}
          size="sm"
          variant="ghost"
          className="h-8 text-xs font-semibold"
          onPress={() => onPageChange(currentPage + 1)}
        >
          Next
          <ChevronRight size={14} />
        </Button>
      </div>
    ) : null}
  </div>
);
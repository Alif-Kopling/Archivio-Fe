import { Button } from "@heroui/react";
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
          onPress={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          isDisabled={currentPage >= totalPages}
          size="sm"
          variant="ghost"
          onPress={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    ) : null}
  </div>
);

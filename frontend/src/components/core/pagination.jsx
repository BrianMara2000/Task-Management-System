import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function DataTablePagination({ setPagination, pagination }) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className={
              pagination.page === 1 ? "text-gray-500 cursor-not-allowed" : ""
            }
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page - 1 })
            }
            disabled={pagination.page === 1}
          />
        </PaginationItem>
        <PaginationItem className="gap-1 flex">
          {pagination.links
            ?.filter(
              (link) =>
                !link.label.includes("Previous") && !link.label.includes("Next")
            )
            .map((link, index) => (
              <PaginationLink
                key={index}
                onClick={() => {
                  if (link.url) {
                    const page = new URL(link.url).searchParams.get("page");
                    setPagination({ ...pagination, page });
                  }
                }}
                isActive={link.active}
              >
                {link.label}
              </PaginationLink>
            ))}
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            className={
              pagination.page ===
              Math.ceil(pagination.total / pagination.pageSize)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page - 1 })
            }
            disabled={
              pagination.page ===
              Math.ceil(pagination.total / pagination.pageSize)
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

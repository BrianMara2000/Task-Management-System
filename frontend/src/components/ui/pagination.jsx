import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export function DataTablePagination({ table, setPagination, pagination }) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {pagination.page} of{" "}
          {Math.ceil(pagination.total / pagination.pageSize)}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPagination({ ...pagination, page: 1 })}
            disabled={pagination.page === 1}
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page - 1 })
            }
            disabled={pagination.page === 1}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page + 1 })
            }
            disabled={
              pagination.page ===
              Math.ceil(pagination.total / pagination.pageSize)
            }
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setPagination({
                ...pagination,
                page: Math.ceil(pagination.total / pagination.pageSize),
              })
            }
            disabled={
              pagination.page ===
              Math.ceil(pagination.total / pagination.pageSize)
            }
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

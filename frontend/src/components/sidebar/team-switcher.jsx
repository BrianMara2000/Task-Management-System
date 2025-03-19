import * as React from "react";

import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

export function TeamSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex gap-2 mt-2 border-b-2 py-2"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <div className="size-4 bg-amber-700 w-5 h-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight items-center">
            <span className="truncate font-medium">Active team</span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

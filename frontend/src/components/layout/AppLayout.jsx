import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { AppSidebar } from "./AppSideBar";

const AppLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
      <div className="flex flex-col flex-1">
        {/* Top Bar */}
        <TopBar />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;

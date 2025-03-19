import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "./AppSideBar";
import { TopBar } from "./TopBar";

const AppLayout = ({ children }) => {
  return (
    <div className=" flex h-screen">
      <SidebarProvider>
        <AppSidebar />
        <div className="w-full">
          <SidebarInset className="py-20 relative ">
            <TopBar />

            <header className="flex h-16 bg-white shrink-0 z-10 border-b-0 w-full items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 fixed top-14 py-10">
              <div className="flex items-center gap-2 px-4">
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">
                        Building Your Application
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
          </SidebarInset>

          <main className="relative z-0 flex flex-1 px-12 py-5 overflow-y-auto gap-10 h-screen">
            {/* <SidebarTrigger className="absolute cursor-pointer z-50 left-5 top-7" /> */}

            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AppLayout;

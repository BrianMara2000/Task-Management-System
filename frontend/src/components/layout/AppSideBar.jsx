import { Calendar, Home, Inbox, Search, Settings, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { axiosClient } from "@/axios";
import { logout } from "@/features/auth/authSlice";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/app/home",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "/app/inbox",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "/app/calendar",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "/app/search",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/app/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosClient.post("/logout");
      localStorage.removeItem("token");
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Sidebar className="w-64 h-full bg-gray-900 text-gray-900">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <item.icon size={20} />
                      <span className="text-sm">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Logout Button */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <LogOut size={20} />
                    <span className="text-sm">Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

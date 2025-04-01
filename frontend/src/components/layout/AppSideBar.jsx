"use client";

import * as React from "react";
import { CircleCheck, Home, Inbox, Users } from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavPinnedProjects } from "../sidebar/nav-pinned-projects";
import { useEffect } from "react";
import { axiosClient } from "@/axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useMemo } from "react";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/app/home",
      icon: Home,
      isActive: true,
    },
    {
      title: "My Tasks",
      url: "/app/tasks",
      icon: CircleCheck,
    },
    {
      title: "Inbox",
      url: "/app/inbox",
      icon: Inbox,
    },
    {
      title: "Users",
      url: "/app/users",
      icon: Users,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const [pinnedProjects, setPinnedProjects] = useState([]);
  const projects = useSelector((state) => state.project.projects);

  const projectDependencies = useMemo(
    () =>
      projects?.map(({ pinned }) => ({
        pinned,
      })),
    [projects]
  );

  const fetchPinnedProjects = async () => {
    try {
      const response = await axiosClient.get("projects/pinned-projects");

      setPinnedProjects(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPinnedProjects();
  }, [projectDependencies]);

  return (
    <Sidebar className="z-50 fixed" collapsible="icon" {...props}>
      <SidebarTrigger className="absolute -right-14 top-5 z-20" />
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavPinnedProjects pinnedProjects={pinnedProjects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

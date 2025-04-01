import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { axiosClient } from "@/axios";
import { Pencil } from "lucide-react";
import { setProject } from "../projectSlice";
import { useDispatch, useSelector } from "react-redux";
import { getColorFromName } from "@/constants/constants";

const View = () => {
  const { projectId } = useParams(); // Get project ID from URL
  // const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const project = useSelector((state) => state.project.project);

  const dispatch = useDispatch();

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/projects/${projectId}`);
      dispatch(setProject(response.data));
    } catch (error) {
      if (error.response?.status === 404) {
        dispatch(setProject(null)); // Handle "Project not found"
      }
      console.error("Failed to load project details:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  useEffect(() => {
    if (!project) {
      setLoading(false); // Ensure loading is false if the project is deleted
    }
  }, [project]);

  if (loading) return <div>Loading...</div>;

  if (!project) return <h1>Project not Found</h1>;

  return (
    <>
      {}
      <div className="w-full flex-col p-6 gap-5">
        {/* Project Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="rounded w-14 h-10">
              <AvatarImage
                src={project.image_path}
                alt={project.name}
                className="w-full h-full object-cover"
              />
              <AvatarFallback
                className={`rounded w-14 h-10 ${getColorFromName(
                  project.name
                )} text-white font-bold`}
              >
                {project.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-xl font-semibold">{project.name}</h1>
          </div>
          <Button variant="outline">
            <Pencil size={16} className="mr-2" /> Edit Project
          </Button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex justify-center items-center mb-10">
          <Tabs defaultValue="table" className="w-full flex justify-center">
            <TabsList className="w-[50%] mx-auto">
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="board">Board</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
            <TabsContent value="table">table</TabsContent>
            <TabsContent value="board">Board</TabsContent>
            <TabsContent value="calendar">Calendar</TabsContent>
          </Tabs>
        </div>

        {/* Filters & New Task Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <Button variant="outline">All Statuses</Button>
            <Button variant="outline">All Assignees</Button>
            <Button variant="outline">All Projects</Button>
            <Button variant="outline">Due Date</Button>
          </div>
          <Button variant="default" className="bg-blue-500">
            + New
          </Button>
        </div>
      </div>
    </>
  );
};

export default View;

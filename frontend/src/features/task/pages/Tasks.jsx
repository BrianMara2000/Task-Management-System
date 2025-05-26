import { columns } from "@/features/task/components/columns";
import { DataTable } from "@/features/task/components/data-table";
import Board from "@/features/dnd/components/Board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTasks } from "@/hooks/useTasks";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setPagination } from "../taskSlice";

export default function Tasks({ projectId }) {
  const [view, setView] = useState("table");
  const dispatch = useDispatch();

  const {
    tasks,
    allTasks,
    users,
    pagination,
    filters,
    loading,
    error,
    moveTask,
  } = useTasks(projectId, view);

  return (
    <div className="flex justify-center items-center mb-10">
      <Tabs defaultValue="table" className="w-full flex justify-center">
        <TabsList className="w-[50%] mx-auto">
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="table" onClick={() => setView("table")}>
          <div className="container mx-auto w-full py-10">
            <DataTable
              columns={columns}
              filters={filters}
              data={tasks}
              pagination={pagination}
              setPagination={(newPagination) =>
                dispatch(setPagination(newPagination))
              }
              error={error}
              loading={loading}
              users={users}
              projectId={projectId}
            />
          </div>
        </TabsContent>
        <TabsContent value="board" onClick={() => setView("board")}>
          <div className="container mx-auto w-full py-10">
            <Board
              projectId={projectId}
              users={users}
              tasks={allTasks}
              moveTask={moveTask}
            />
          </div>
        </TabsContent>
        <TabsContent value="calendar">Calendar</TabsContent>
      </Tabs>
    </div>
  );
}

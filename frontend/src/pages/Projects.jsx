import { useCallback, useEffect, useState } from "react";
import { columns } from "@/features/project/components/columns";
import { DataTable } from "@/features/project/components/data-table";
import { axiosClient } from "@/axios";
import { useDispatch, useSelector } from "react-redux";
import { setPagination, setProjects } from "@/features/project/projectSlice";

export default function Projects() {
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.project.projects);
  const pagination = useSelector((state) => state.project.pagination);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get(`/projects`, {
        params: {
          page: pagination.page,
          per_page: pagination.pageSize,
        },
      });

      dispatch(setProjects(response.data.data));
      dispatch(
        setPagination({
          page: response.data.meta.current_page,
          pageSize: response.data.meta.per_page,
          total: response.data.meta.total,
          links: response.data.meta.links,
        })
      );
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [dispatch, pagination.page, pagination.pageSize]); // Dependencies inside useCallback

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="container mx-auto w-full py-10">
      {loading ? (
        <div>Loading...</div> // Replace this with a Skeleton Loader or Spinner
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <DataTable
          columns={columns}
          data={projects}
          pagination={pagination}
          setPagination={(newPagination) =>
            dispatch(setPagination(newPagination))
          }
        />
      )}
    </div>
  );
}

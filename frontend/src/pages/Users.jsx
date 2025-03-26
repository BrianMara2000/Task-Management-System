import { useCallback, useEffect, useState } from "react";
import { columns } from "@/features/user/components/columns";
import { DataTable } from "@/features/user/components/data-table";
import { axiosClient } from "@/axios";
import { useDispatch, useSelector } from "react-redux";
import { setPagination, setUsers } from "@/features/user/userSlice";

export default function Users() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.user.users);
  const pagination = useSelector((state) => state.user.pagination);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get(`/users`, {
        params: {
          page: pagination.page,
          per_page: pagination.pageSize,
        },
      });

      dispatch(setUsers(response.data.users.data));
      dispatch(
        setPagination({
          page: response.data.users.current_page,
          pageSize: response.data.users.per_page,
          total: response.data.users.total,
          links: response.data.users.links,
        })
      );
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [dispatch, pagination.page, pagination.pageSize]); // Dependencies inside useCallback

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="container mx-auto max-w-3xl py-10">
      {loading ? (
        <div>Loading...</div> // Replace this with a Skeleton Loader or Spinner
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          pagination={pagination}
          setPagination={(newPagination) =>
            dispatch(setPagination(newPagination))
          }
        />
      )}
    </div>
  );
}

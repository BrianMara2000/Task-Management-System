import { useEffect, useState } from "react";
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

  const fetchUsers = async () => {
    try {
      const response = await axiosClient.get(`/users`, {
        params: {
          page: pagination.page,
          per_page: pagination.pageSize,
        },
      });

      setLoading(false);
      dispatch(setUsers(response.data.users.data));
      dispatch(
        setPagination({
          page: response.data.users.current_page,
          pageSize: response.data.users.per_page,
          total: response.data.users.total,
        })
      );
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.page, pagination.pageSize);
  }, [pagination.page, pagination.pageSize]);

  return (
    <div className="container mx-auto max-w-3xl py-10">
      {loading ? (
        <div>Loading...</div>
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

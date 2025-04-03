import { axiosClient } from "@/axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CircleCheck, Clock, Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateTask } from "../taskSlice";
import { useState } from "react";

const StatusUpdate = ({ task }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      const response = await axiosClient.patch(`/tasks/${task.id}`, {
        status: newStatus,
      });

      dispatch(updateTask({ ...response.data.task, status: newStatus }));
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      <Select value={task.status} onValueChange={handleStatusChange}>
        <SelectTrigger
          className={`w-[170px] transition-colors ${
            loading ? "text-gray-500" : "text-black"
          }`}
        >
          <SelectValue placeholder="Select Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="in_progress" className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-blue-500" />
            In Progress
          </SelectItem>
          <SelectItem value="completed" className="flex items-center gap-2">
            <CircleCheck className="w-4 h-4 text-green-500" />
            Completed
          </SelectItem>
          <SelectItem value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            Pending
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default StatusUpdate;

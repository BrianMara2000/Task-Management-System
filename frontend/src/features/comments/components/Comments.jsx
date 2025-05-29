import { axiosClient } from "@/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setComments } from "../commentSlice";
import { useCallback } from "react";

const Comments = ({ taskId }) => {
  const dispatch = useDispatch();
  const comments = useSelector((state) => state.comment.comments);

  const getComments = useCallback(async () => {
    try {
      const response = await axiosClient.get(`/tasks/${taskId}/comments`);
      dispatch(setComments(response.data));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [dispatch, taskId]);

  useEffect(() => {
    getComments();
  }, [getComments]);

  useEffect(() => {
    console.log("Comments fetched for task:", comments);
  }, [comments]);

  return (
    <ScrollArea className="h-[300px] w-full p-3">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3 mb-4">
          <Avatar className="">
            <AvatarImage
              className="rounded w-14 h-10"
              src={comment.user.profile_image}
              alt="Project Image"
            />
            <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <p className="font-semibold text-sm">{comment.user.name}</p>
              <p className="text-[12px] text-gray-500">5 seconds ago</p>
            </div>
            <p className="text-sm text-gray-700">{comment.comment}</p>
          </div>
        </div>
      ))}
    </ScrollArea>
  );
};

export default Comments;

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Textarea } from "@/components/ui/textarea";
import { Image, SendHorizonal, SmileIcon, Sticker } from "lucide-react";
import { Button } from "@/components/ui/button";
import { axiosClient } from "@/axios";
import { addComment, removeComment } from "../commentSlice";
import { CommentSkeleton } from "./CommentSkeleton";
import Spinner from "@/components/ui/spinner";

const Comments = ({ comments, taskId, commentLoading }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddComment = async (e) => {
    e.preventDefault();
    console.log(comment);
    setIsLoading(true);

    // const tempComment = {
    //   id: Date.now(), // temporary ID
    //   comment,
    //   pending: true, // optional: flag for loading state
    //   user: user,
    // };

    // dispatch(addComment({ comment: tempComment }));

    try {
      const response = await axiosClient.post(`/tasks/${taskId}/comments`, {
        content: comment,
      });

      dispatch(addComment(response.data));
      setComment("");
    } catch (error) {
      dispatch(removeComment(comment.id)); // Roll back
      console.error("Error adding comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex w-full space-x-3 sticky -bottom-36 left-0 bg-white p-2">
        <Avatar>
          <AvatarImage
            className="rounded-full w-8 h-8 object-cover"
            src={user.profile_image}
            alt="User Avatar"
          />
          <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col border-2 p-3 rounded-xl w-full ">
          <Textarea
            className="bg-transparent resize-none border-none placeholder:text-gray-400 flex-1 p-0"
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={1}
          />

          <div className="flex items-center justify-between">
            <div className="flex space-x-2 text-gray-400 ">
              <button className="hover:text-blue-500 cursor-pointer">
                <SmileIcon size={18} />
              </button>
              <button className="hover:text-blue-500 cursor-pointer">
                <Image size={18} />
              </button>
              <button className="text-xs font-semibold hover:text-blue-500 cursor-pointer ">
                GIF
              </button>
              <button className="hover:text-blue-500 cursor-pointer">
                <Sticker size={18} />
              </button>
            </div>

            <Button
              onClick={handleAddComment}
              className="text-gray-400 hover:text-blue-500 bg-transparent hover:bg-transparent cursor-pointer"
            >
              {isLoading ? (
                <Spinner className="w-4 h-4 border-2 border-t-white border-gray-300 rounded-full animate-spin mr-2" />
              ) : (
                <SendHorizonal size={18} />
              )}
            </Button>
          </div>
        </div>
      </div>
      <ScrollArea className="flex flex-col h-[300px] w-full p-3">
        {commentLoading ? (
          <>
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 mb-4">
              <Avatar>
                <AvatarImage
                  className="rounded-full w-8 h-8 object-cover"
                  src={comment.user?.profile_image}
                  alt="Project Image"
                />
                <AvatarFallback>{comment.user?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col">
                  <p className="font-semibold text-sm">{comment.user?.name}</p>
                  <p className="text-[12px] text-gray-500">5 seconds ago</p>
                </div>
                <p className="text-sm text-gray-700">{comment.comment}</p>
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </>
  );
};

export default Comments;

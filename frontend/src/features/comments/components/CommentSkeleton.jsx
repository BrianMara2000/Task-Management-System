// components/CommentSkeleton.jsx
export const CommentSkeleton = () => {
  return (
    <div className="flex gap-3 mb-4 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-gray-300" />
      <div className="flex flex-col gap-2 w-full">
        <div className="w-1/3 h-4 bg-gray-300 rounded" />
        <div className="w-2/3 h-3 bg-gray-200 rounded" />
      </div>
    </div>
  );
};

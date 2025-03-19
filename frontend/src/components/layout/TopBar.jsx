import { Button } from "@/components/ui/button";

export const TopBar = () => {
  return (
    <div className=" fixed z-20 bg-white top-0 right-0 left-0 flex items-center justify-end p-3 border-b">
      <div className="flex items-center gap-4">
        <Button size="sm">+ Create</Button>
        <div className="w-10 h-10 rounded-full bg-gray-300" />
      </div>
    </div>
  );
};

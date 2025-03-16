import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export const TopBar = () => {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost">
          <Menu />
        </Button>
        <h1 className="text-lg font-semibold">My Tasks</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
          + Create
        </Button>
        <div className="w-10 h-10 rounded-full bg-gray-300" />
      </div>
    </div>
  );
};

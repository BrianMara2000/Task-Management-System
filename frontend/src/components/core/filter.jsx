import { getColorFromName, getTaskFilters } from "@/constants/constants";
import { useSelector } from "react-redux";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { FilterIcon } from "lucide-react";

export function Filters({ filters, toggleFilter }) {
  const users = useSelector((state) => state.user.users);
  const taskFilters = getTaskFilters(users);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="px-3 py-2 flex items-center gap-2 border-2 rounded-md font-poppins hover:bg-gray-200 font-semibold text-sm text-gray-700 transition duration-200 cursor-pointer">
          <FilterIcon className="w-5 h-5" />
          <span>Filter</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {Object.entries(taskFilters).map(([category, filterOptions]) => (
          <DropdownMenuSub key={category}>
            <DropdownMenuSubTrigger>{category}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {filterOptions.map((filter) => (
                <DropdownMenuCheckboxItem
                  key={filter.value}
                  checked={filters[category.toLowerCase()]?.includes(
                    filter.value
                  )}
                  onCheckedChange={() =>
                    toggleFilter(category.toLowerCase(), filter.value)
                  }
                  className="flex items-center gap-2"
                >
                  <span className="flex-shrink-0">
                    {category === "Assignee" ? (
                      <Avatar>
                        <AvatarImage
                          src={filter.icon}
                          alt={filter.name}
                          className="rounded-full w-full h-full object-cover"
                        />
                        <AvatarFallback
                          className={`w-full h-full flex items-center justify-center rounded-full ${getColorFromName(
                            filter.name
                          )} text-white font-bold`}
                        >
                          {filter.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <filter.icon
                        className={filter.className}
                        {...(filter.fill && { fill: filter.fill })}
                      />
                    )}
                  </span>
                  <span>{filter.name}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

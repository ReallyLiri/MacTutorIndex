import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ReligionFilterProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}

const ReligionFilter = ({ value, options, onChange }: ReligionFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter((option) =>
    option && option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (religion: string) => {
    if (value.includes(religion)) {
      onChange(value.filter((item) => item !== religion));
    } else {
      onChange([...value, religion]);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="Search religions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-8"
      />
      <ScrollArea className="h-32">
        <div className="space-y-2">
          {filteredOptions.map((religion) => (
            <div key={religion} className="flex items-center space-x-2 h-5">
              <Checkbox
                id={`religion-${religion}`}
                checked={value.includes(religion)}
                onCheckedChange={() => handleToggle(religion)}
                className="h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <label
                htmlFor={`religion-${religion}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {religion}
              </label>
            </div>
          ))}
          {filteredOptions.length === 0 && (
            <div className="text-sm text-muted-foreground py-2">
              No religions found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ReligionFilter;
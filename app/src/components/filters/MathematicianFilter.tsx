import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface MathematicianFilterProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}

const MathematicianFilter = ({ value, options, onChange }: MathematicianFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter((option) =>
    option && option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (mathematician: string) => {
    if (value.includes(mathematician)) {
      onChange(value.filter((item) => item !== mathematician));
    } else {
      onChange([...value, mathematician]);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="Search mathematicians..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-8"
      />
      <ScrollArea className="h-32">
        <div className="space-y-2">
          {filteredOptions.map((mathematician) => (
            <div key={mathematician} className="flex items-center space-x-2 h-5">
              <Checkbox
                id={`mathematician-${mathematician}`}
                checked={value.includes(mathematician)}
                onCheckedChange={() => handleToggle(mathematician)}
                className="h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <label
                htmlFor={`mathematician-${mathematician}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {mathematician}
              </label>
            </div>
          ))}
          {filteredOptions.length === 0 && (
            <div className="text-sm text-muted-foreground py-2">
              No mathematicians found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MathematicianFilter;
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface InstitutionFilterProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}

const InstitutionFilter = ({ value, options, onChange }: InstitutionFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter((option) =>
    option && option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (institution: string) => {
    if (value.includes(institution)) {
      onChange(value.filter((item) => item !== institution));
    } else {
      onChange([...value, institution]);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="Search institutions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-8"
      />
      <ScrollArea className="h-32">
        <div className="space-y-2">
          {filteredOptions.map((institution) => (
            <div key={institution} className="flex items-center space-x-2 h-5">
              <Checkbox
                id={`institution-${institution}`}
                checked={value.includes(institution)}
                onCheckedChange={() => handleToggle(institution)}
                className="h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <label
                htmlFor={`institution-${institution}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {institution}
              </label>
            </div>
          ))}
          {filteredOptions.length === 0 && (
            <div className="text-sm text-muted-foreground py-2">
              No institutions found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default InstitutionFilter;
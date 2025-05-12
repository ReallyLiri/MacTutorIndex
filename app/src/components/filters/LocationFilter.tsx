import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface LocationFilterProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}

const LocationFilter = ({ value, options, onChange }: LocationFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter((option) =>
    option && option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (location: string) => {
    if (value.includes(location)) {
      onChange(value.filter((item) => item !== location));
    } else {
      onChange([...value, location]);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="Search locations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-8"
      />
      <ScrollArea className="h-32">
        <div className="space-y-2">
          {filteredOptions.map((location) => (
            <div key={location} className="flex items-center space-x-2 h-5">
              <Checkbox
                id={`location-${location}`}
                checked={value.includes(location)}
                onCheckedChange={() => handleToggle(location)}
                className="h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <label
                htmlFor={`location-${location}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {location}
              </label>
            </div>
          ))}
          {filteredOptions.length === 0 && (
            <div className="text-sm text-muted-foreground py-2">
              No locations found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default LocationFilter;
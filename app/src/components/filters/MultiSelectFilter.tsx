import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MultiSelectFilterProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  type: string;
  emptyMessage: string;
  title: string;
}

const MultiSelectFilter = ({
  value,
  options,
  onChange,
  placeholder,
  type,
  emptyMessage,
  title,
}: MultiSelectFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredOptions = options.filter(
    (option) =>
      option && option.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const selectedCount = value.length;

  return (
    <div className="space-y-2">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <span className="font-medium text-sm">{title}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} selected` : "All"}
        </span>
      </div>

      {isExpanded && (
        <>
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {filteredOptions.map((option) => (
                <div
                  key={option}
                  className="flex items-start space-x-2 min-h-6"
                >
                  <Checkbox
                    id={`${type}-${option}`}
                    checked={value.includes(option)}
                    onCheckedChange={() => handleToggle(option)}
                    className="h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground mt-[0.2em]"
                  />
                  <label
                    htmlFor={`${type}-${option}`}
                    className="text-sm leading-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option}
                  </label>
                </div>
              ))}
              {filteredOptions.length === 0 && (
                <div className="text-sm text-muted-foreground py-2">
                  {emptyMessage}
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
};

export default MultiSelectFilter;

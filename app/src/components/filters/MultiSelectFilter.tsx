import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toTitleCase, normalizeText } from "@/lib/textUtils";

interface MultiSelectFilterProps {
  className?: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  type: string;
  emptyMessage: string;
  title: string;
}

const MultiSelectFilter = ({
  className,
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

  const dedupedFormattedOptions = useMemo(() => {
    const normalizedMap = new Map<string, string>();

    options.forEach((option) => {
      if (!option) return;
      const normalized = normalizeText(option);
      const formatted = toTitleCase(option);

      normalizedMap.set(normalized, formatted);
    });

    return Array.from(normalizedMap.values()).sort();
  }, [options]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);

    return dedupedFormattedOptions.filter((option) =>
      normalizeText(option).includes(normalizedQuery),
    );
  }, [dedupedFormattedOptions, searchQuery]);

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
    <div className={`space-y-2 ${className}`}>
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
          <span className="font-medium text-sm text-blue-500">{title}</span>
          <span className="text-sm text-gray-500">({options.length})</span>
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
          <div className="flex justify-start gap-3 mt-1 mb-1">
            <button
              className="text-xs  hover:underline"
              onClick={() => onChange(filteredOptions)}
            >
              Select all
            </button>
            <button
              className="text-xs hover:underline"
              onClick={() => onChange([])}
            >
              Clear all
            </button>
          </div>
          <ScrollArea className="h-32">
            <div className="space-y-1 mt-1">
              {filteredOptions.map((option) => (
                <div
                  key={option}
                  className="flex items-start space-x-2 min-h-6 ml-1"
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

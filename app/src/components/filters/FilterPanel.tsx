import { useState, useEffect, useRef } from "react";
import { Filters } from "@/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import YearRangeFilter from "./YearRangeFilter";
import LocationFilter from "./LocationFilter";
import ReligionFilter from "./ReligionFilter";
import InstitutionFilter from "./InstitutionFilter";
import MathematicianFilter from "./MathematicianFilter";
import { Checkbox } from "@/components/ui/checkbox.tsx";

const MIN_YEAR = -1680;
const MAX_YEAR = new Date().getFullYear();

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  allMathematicians: string[];
  allLocations: string[];
  allReligions: string[];
  allInstitutions: string[];
}

const FilterPanel = ({
  filters,
  onFiltersChange,
  allMathematicians,
  allLocations,
  allReligions,
  allInstitutions,
}: FilterPanelProps) => {
  const defaultFilters = useRef({ ...filters });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [draftFilters, setDraftFilters] = useState<Filters>(filters);
  const [includeBC, setIncludeBC] = useState(false);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const updateDraftFilters = (newDraftFilters: Filters) => {
    setDraftFilters(newDraftFilters);
  };

  const applyFilters = () => {
    onFiltersChange(draftFilters);
  };

  const resetFilters = () => {
    const resetValues = { ...defaultFilters.current };
    setDraftFilters(resetValues);
    onFiltersChange(resetValues);
  };

  return (
    <div
      className={`transition-all duration-300 ${isCollapsed ? "w-12" : "w-80"} h-full flex flex-col bg-background border-r`}
    >
      {isCollapsed ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="w-12 h-12 flex items-center justify-center"
        >
          <Filter className="w-4 h-4" />
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      ) : (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              <h2 className="text-lg font-medium">Filters</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="w-8 h-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
          <Separator />
          <div className="px-4 py-2 space-y-2">
            <Button
              variant="default"
              onClick={applyFilters}
              className="w-full"
              disabled={
                JSON.stringify(draftFilters) === JSON.stringify(filters)
              }
            >
              Apply Filters
            </Button>
            <Button variant="outline" onClick={resetFilters} className="w-full">
              Reset Filters
            </Button>
          </div>
          <Separator />
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <div className="flex items-center justify-between cursor-pointer mb-2">
                <span className="font-medium text-sm">Time Period</span>
              </div>
              <YearRangeFilter
                value={draftFilters.yearRange}
                min={includeBC ? MIN_YEAR : 0}
                max={MAX_YEAR}
                onChange={(yearRange) =>
                  updateDraftFilters({ ...draftFilters, yearRange })
                }
              />
              <div className="flex flex-row items-center gap-2 mt-2">
                <Checkbox
                  checked={includeBC}
                  onCheckedChange={() => setIncludeBC((b) => !b)}
                />
                <label className="text-sm">Include BC</label>
              </div>
            </div>
            
            <Separator />
            
            <LocationFilter
              value={draftFilters.locations}
              options={allLocations}
              onChange={(locations) =>
                updateDraftFilters({ ...draftFilters, locations })
              }
            />
            
            <Separator />
            
            <ReligionFilter
              value={draftFilters.religions}
              options={allReligions}
              onChange={(religions) =>
                updateDraftFilters({ ...draftFilters, religions })
              }
            />
            
            <Separator />
            
            <InstitutionFilter
              value={draftFilters.institutions}
              options={allInstitutions}
              onChange={(institutions) =>
                updateDraftFilters({ ...draftFilters, institutions })
              }
            />
            
            <Separator />
            
            <MathematicianFilter
              value={draftFilters.mathematicians}
              options={allMathematicians}
              onChange={(mathematicians) =>
                updateDraftFilters({ ...draftFilters, mathematicians })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;

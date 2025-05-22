import { useState, useEffect, useRef } from "react";
import { Filters } from "@/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import YearRangeFilter from "./YearRangeFilter";
import LocationTreeFilter from "./LocationTreeFilter";
import ReligionFilter from "./ReligionFilter";
import InstitutionFilter from "./InstitutionFilter";
import WorkedInFilter from "./WorkedInFilter";
import ProfessionFilter from "./ProfessionFilter";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { LocationNode } from "@/lib/locationUtils";

// ref https://mathshistory.st-andrews.ac.uk/Biographies/chronological/
const MIN_YEAR = -1680;
const MAX_YEAR = 1984;

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  locationTree: LocationNode[];
  allReligions: string[];
  allInstitutions: string[];
  allWorkedIn: string[];
  allProfessions: string[];
  onReset?: () => void;
}

const FilterPanel = ({
  filters,
  onFiltersChange,
  locationTree,
  allReligions,
  allInstitutions,
  allWorkedIn,
  allProfessions,
  onReset,
}: FilterPanelProps) => {
  const defaultFilters = useRef({ ...filters });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [draftFilters, setDraftFilters] = useState<Filters>(filters);
  const [includeBC, setIncludeBC] = useState(false);
  const [includeUnknown, setIncludeUnknown] = useState(filters.includeUnknown || false);

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
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background border-r">
      {isCollapsed ? (
        <div className="p-4">
          <Button
            variant="ghost"
            onClick={toggleCollapse}
            className="w-12 h-12 flex flex-col items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full w-[32rem]">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              <h2 className="text-lg font-medium">Filters</h2>
            </div>
            <Button
              variant="ghost"
              onClick={toggleCollapse}
              className="w-12 h-12 flex flex-col items-center justify-center"
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
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 scroll-stable">
            <div>
              <div className="flex items-center justify-between cursor-pointer mb-2">
                <span className="font-medium text-sm text-blue-500">
                  Time Period
                </span>
              </div>
              <YearRangeFilter
                value={draftFilters.yearRange}
                min={includeBC ? MIN_YEAR : 0}
                max={MAX_YEAR}
                onChange={(yearRange) =>
                  updateDraftFilters({ ...draftFilters, yearRange })
                }
              />
              <div className="flex flex-row items-center gap-2 mt-3">
                <Checkbox
                  className="w-4 h-4 ml-1"
                  checked={includeBC}
                  onCheckedChange={() => setIncludeBC((b) => !b)}
                />
                <label className="text-sm text-gray-500">Include BC</label>
              </div>
            </div>

            <Separator />

            <LocationTreeFilter
              value={draftFilters.locations}
              locationTree={locationTree}
              onChange={(locations) =>
                updateDraftFilters({ ...draftFilters, locations })
              }
              title="Locations"
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

            <WorkedInFilter
              value={draftFilters.worked_in}
              options={allWorkedIn}
              onChange={(worked_in) =>
                updateDraftFilters({ ...draftFilters, worked_in })
              }
            />

            <Separator />

            <ProfessionFilter
              value={draftFilters.profession}
              options={allProfessions}
              onChange={(profession) =>
                updateDraftFilters({ ...draftFilters, profession })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;

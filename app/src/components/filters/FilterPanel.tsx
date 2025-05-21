import { useState, useEffect } from 'react';
import { Filters } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import YearRangeFilter from './YearRangeFilter';
import LocationFilter from './LocationFilter';
import ReligionFilter from './ReligionFilter';
import InstitutionFilter from './InstitutionFilter';
import MathematicianFilter from './MathematicianFilter';

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  allMathematicians: string[];
  allLocations: string[];
  allReligions: string[];
  allInstitutions: string[];
  minYear: number;
  maxYear: number;
}

const FilterPanel = ({
  filters,
  onFiltersChange,
  allMathematicians,
  allLocations,
  allReligions,
  allInstitutions,
  minYear,
  maxYear
}: FilterPanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [draftFilters, setDraftFilters] = useState<Filters>(filters);
  
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
    const resetValues = {
      yearRange: [minYear, maxYear],
      locations: [],
      religions: [],
      institutions: [],
      mathematicians: []
    };
    
    setDraftFilters(resetValues);
    onFiltersChange(resetValues);
  };

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-80'} h-full flex flex-col bg-background border-r`}>
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
              disabled={JSON.stringify(draftFilters) === JSON.stringify(filters)}
            >
              Apply Filters
            </Button>
            <Button variant="outline" onClick={resetFilters} className="w-full">
              Reset Filters
            </Button>
          </div>
          <Separator />
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Time Period</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <YearRangeFilter
                  value={draftFilters.yearRange}
                  min={minYear}
                  max={maxYear}
                  onChange={(yearRange) => updateDraftFilters({ ...draftFilters, yearRange })}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Locations</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <LocationFilter
                  value={draftFilters.locations}
                  options={allLocations}
                  onChange={(locations) => updateDraftFilters({ ...draftFilters, locations })}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Religions</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ReligionFilter
                  value={draftFilters.religions}
                  options={allReligions}
                  onChange={(religions) => updateDraftFilters({ ...draftFilters, religions })}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Institutions</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <InstitutionFilter
                  value={draftFilters.institutions}
                  options={allInstitutions}
                  onChange={(institutions) => updateDraftFilters({ ...draftFilters, institutions })}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Mathematicians</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <MathematicianFilter
                  value={draftFilters.mathematicians}
                  options={allMathematicians}
                  onChange={(mathematicians) => updateDraftFilters({ ...draftFilters, mathematicians })}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
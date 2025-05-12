import {useMemo, useState} from 'react';
import {useFirestore} from '@/hooks/useFirestore';
import {useGraph} from '@/hooks/useGraph';
import {Filters, GraphLink, GraphNode, Mathematician} from '@/types';
import Graph from '@/components/graph/Graph';
import FilterPanel from '@/components/filters/FilterPanel';
import IdentityCard from '@/components/details/IdentityCard';
import ConnectionDetails from '@/components/details/ConnectionDetails';
import {Loader2} from 'lucide-react';

const DEFAULT_YEAR_RANGE: [number, number] = [1750, 1800];

const Home = () => {
  // Initialize filters with default year range
  const [filters, setFilters] = useState<Filters>({
    yearRange: DEFAULT_YEAR_RANGE,
    locations: [],
    religions: [],
    institutions: [],
    mathematicians: []
  });
  
  // Use firestore hook with filters
  const { mathematicians, loading, error } = useFirestore(filters);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null);
  
  // Create a map of mathematicians by id for easy lookup
  const mathematiciansMap = useMemo(() => {
    const map: Record<string, Mathematician> = {};
    mathematicians.forEach(mathematician => {
      map[mathematician.id] = mathematician;
    });
    return map;
  }, [mathematicians]);
  
  // Extract all unique values for filters from the current dataset
  const [allLocations, allReligions, allInstitutions, allMathematicians, yearRange] = useMemo(() => {
    const locations = new Set<string>();
    const religions = new Set<string>();
    const institutions = new Set<string>();
    const mathematicianNames: string[] = [];
    let minYear = 940; // Absolute minimum year in the database
    let maxYear = new Date().getFullYear(); // Absolute maximum year
    
    mathematicians.forEach(mathematician => {
      // Locations
      mathematician.lived_in?.forEach(place => locations.add(place));
      mathematician.worked_in?.forEach(place => locations.add(place));
      if (mathematician.born?.place) locations.add(mathematician.born.place);
      if (mathematician.died?.place) locations.add(mathematician.died.place);
      
      // Religions
      mathematician.religions?.forEach(religion => religions.add(religion));
      
      // Institutions
      mathematician.institution_affiliation?.forEach(institution => 
        institutions.add(institution)
      );
      
      // Mathematician names
      mathematicianNames.push(mathematician.name);
      
      // Years - we no longer need to calculate this from data as we're using fixed range
      if (mathematician.died?.year !== null && (mathematician.died?.year || 0) > maxYear) {
        maxYear = mathematician.died?.year || new Date().getFullYear();
      }
    });
    
    return [
      Array.from(locations).sort(),
      Array.from(religions).sort(),
      Array.from(institutions).sort(),
      mathematicianNames.sort(),
      [minYear, maxYear] as [number, number]
    ];
  }, [mathematicians]);
  
  // Generate graph data from filtered results
  const graphData = useGraph(mathematicians, filters);
  
  // Handle node click
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    setSelectedLink(null);
  };
  
  // Handle link click
  const handleLinkClick = (link: GraphLink) => {
    setSelectedLink(link);
    setSelectedNode(null);
  };
  
  // Close details panels
  const handleCloseDetails = () => {
    setSelectedNode(null);
    setSelectedLink(null);
  };
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error loading data</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading mathematician data...</h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        allMathematicians={allMathematicians}
        allLocations={allLocations}
        allReligions={allReligions}
        allInstitutions={allInstitutions}
        minYear={yearRange[0]}
        maxYear={yearRange[1]}
      />
      
      <div className="flex-1 relative">
        <Graph 
          data={graphData}
          onNodeClick={handleNodeClick}
          onLinkClick={handleLinkClick}
        />
        
        <div className="absolute bottom-4 right-4 z-10 w-full max-w-md">
          {selectedNode && (
            <IdentityCard 
              mathematician={selectedNode.data}
              onClose={handleCloseDetails}
            />
          )}
          
          {selectedLink && (
            <ConnectionDetails 
              link={selectedLink}
              mathematicians={mathematiciansMap}
              onClose={handleCloseDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
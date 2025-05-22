import { useMemo, useState } from "react";
import { useFirestore } from "@/hooks/useFirestore";
import { useGraph } from "@/hooks/useGraph";
import { Filters, GraphLink, GraphNode, Mathematician } from "@/types";
import Graph from "@/components/graph/Graph";
import FilterPanel from "@/components/filters/FilterPanel";
import IdentityCard from "@/components/details/IdentityCard";
import ConnectionDetails from "@/components/details/ConnectionDetails";
import { Loader2 } from "lucide-react";

const DEFAULT_YEAR_RANGE: [number, number] = [1750, 1800];

const Home = () => {
  const [filters, setFilters] = useState<Filters>({
    yearRange: DEFAULT_YEAR_RANGE,
    locations: [],
    religions: [],
    institutions: [],
    worked_in: [],
    profession: [],
  });

  const { mathematicians, loading, error } = useFirestore(filters);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null);

  const mathematiciansMap = useMemo(() => {
    const map: Record<string, Mathematician> = {};
    mathematicians.forEach((mathematician) => {
      map[mathematician.id] = mathematician;
    });
    return map;
  }, [mathematicians]);

  const [
    allLocations,
    allReligions,
    allInstitutions,
    allWorkedIn,
    allProfessions,
  ] = useMemo(() => {
    const locations = new Set<string>();
    const religions = new Set<string>();
    const institutions = new Set<string>();
    const workedIn = new Set<string>();
    const professions = new Set<string>();

    mathematicians.forEach((mathematician) => {
      mathematician.lived_in?.forEach((place) => locations.add(place));
      mathematician.worked_in?.forEach((place) => workedIn.add(place));
      if (mathematician.born?.place) locations.add(mathematician.born.place);
      if (mathematician.died?.place) locations.add(mathematician.died.place);

      mathematician.religions?.forEach((religion) => religions.add(religion));

      mathematician.institution_affiliation?.forEach((institution) =>
        institutions.add(institution),
      );

      mathematician.profession?.forEach((prof) => professions.add(prof));
    });

    return [
      Array.from(locations).sort(),
      Array.from(religions).sort(),
      Array.from(institutions).sort(),
      Array.from(workedIn).sort(),
      Array.from(professions).sort(),
    ];
  }, [mathematicians]);

  const graphData = useGraph(mathematicians, filters);

  const handleNodeClick = (node: GraphNode) => {
    const existingNode = node.id
      ? (graphData.nodes.find(
          (n) => typeof n === "object" && n.id === node.id,
        ) as GraphNode)
      : null;

    setSelectedNode(existingNode || node);
    setSelectedLink(null);
  };

  const handleLinkClick = (link: GraphLink) => {
    setSelectedLink(link);
    setSelectedNode(null);
  };

  const handleCloseDetails = () => {
    setSelectedNode(null);
    setSelectedLink(null);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] w-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error loading data</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-screen">
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        allLocations={allLocations}
        allReligions={allReligions}
        allInstitutions={allInstitutions}
        allWorkedIn={allWorkedIn}
        allProfessions={allProfessions}
      />

      <div className="flex-1">
        {loading ? (
          <div className="inset-0 flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold">Loading data...</h2>
            </div>
          </div>
        ) : (
          <>
            <Graph
              data={graphData}
              onNodeClick={handleNodeClick}
              onLinkClick={handleLinkClick}
              selectedNodeId={selectedNode?.id}
              selectedLink={selectedLink}
            />

            <div className="absolute bottom-4 right-4 z-10 w-full max-w-md">
              {selectedNode && (
                <IdentityCard
                  mathematician={selectedNode.data}
                  onClose={handleCloseDetails}
                  onPersonClick={handleNodeClick}
                  availableNodes={
                    graphData.nodes.filter(
                      (node) => typeof node !== "string",
                    ) as GraphNode[]
                  }
                />
              )}
            </div>

            <div className="absolute bottom-4 right-4 z-10 w-full max-w-2xl">
              {selectedLink && (
                <ConnectionDetails
                  link={selectedLink}
                  mathematicians={mathematiciansMap}
                  onClose={handleCloseDetails}
                  onPersonClick={(id) => {
                    const nodeInGraph = graphData.nodes.find(
                      (node) => typeof node === "object" && node.id === id,
                    ) as GraphNode;

                    if (nodeInGraph) {
                      handleNodeClick(nodeInGraph);
                    } else if (mathematiciansMap[id]) {
                      handleNodeClick({
                        id: id,
                        name: mathematiciansMap[id].name,
                        val: 5,
                        data: mathematiciansMap[id],
                      });
                    }
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;

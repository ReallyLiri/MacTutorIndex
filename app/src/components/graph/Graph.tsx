import { useState, useRef, useCallback, useEffect } from "react";
import ForceGraph2D, {
  ForceGraphMethods,
  LinkObject,
  NodeObject,
} from "react-force-graph-2d";
import { GraphData, GraphNode, GraphLink, GraphNodeWithCoords } from "@/types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { renderNode } from "@/lib/graphUtils";

type NodeReference = string | NodeObject<GraphNode>;
type ForceGraphLink = LinkObject<NodeObject<GraphNode>, GraphLink>;

interface NormalizedLink {
  sourceId: string;
  sourceName: string;
  sourceX?: number;
  sourceY?: number;
  targetId: string;
  targetName: string;
  targetX?: number;
  targetY?: number;
  type: string;
  color?: string;
}

interface GraphProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  onLinkClick: (link: GraphLink) => void;
  selectedNodeId?: string;
}

const Graph = ({ data, onNodeClick, onLinkClick, selectedNodeId }: GraphProps) => {
  const graphRef =
    useRef<
      ForceGraphMethods<
        NodeObject<GraphNode & string>,
        LinkObject<GraphNode & string, GraphLink>
      >
    >(undefined);
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<string>());
  const [hoverNode, setHoverNode] = useState<GraphNodeWithCoords | null>(null);
  const [hoverLink, setHoverLink] = useState<NormalizedLink | null>(null);
  const imgCache = useRef<Record<string, HTMLImageElement>>({});

  const normalizeNodeReference = useCallback(
    (
      nodeRef: NodeReference,
    ): { id: string; name: string; x?: number; y?: number } => {
      if (typeof nodeRef === "object" && nodeRef !== null) {
        return {
          id: nodeRef.id,
          name: nodeRef.name || "",
          x: nodeRef.x,
          y: nodeRef.y,
        };
      }

      return {
        id: nodeRef,
        name: "",
        x: undefined,
        y: undefined,
      };
    },
    [],
  );

  const normalizeLink = useCallback(
    (link: ForceGraphLink): NormalizedLink => {
      const source = normalizeNodeReference(link.source);
      const target = normalizeNodeReference(link.target);

      return {
        sourceId: source.id,
        sourceName: source.name,
        sourceX: source.x,
        sourceY: source.y,
        targetId: target.id,
        targetName: target.name,
        targetX: target.x,
        targetY: target.y,
        type: link.type || "",
        color: link.color,
      };
    },
    [normalizeNodeReference],
  );

  const handleNodeHover = useCallback(
    (node: NodeObject<GraphNode> | null) => {
      const nodes = new Set<string>();
      const links = new Set<string>();

      if (node) {
        setHoverNode(node as unknown as GraphNodeWithCoords);
        nodes.add(node.id);

        if (data.links) {
          data.links.forEach((link) => {
            const normalizedLink = normalizeLink(
              link as unknown as ForceGraphLink,
            );
            const { sourceId, targetId } = normalizedLink;

            if (sourceId === node.id || targetId === node.id) {
              links.add(`${sourceId}-${targetId}`);
              nodes.add(sourceId);
              nodes.add(targetId);
            }
          });
        }
      } else {
        setHoverNode(null);
      }

      setHighlightNodes(nodes);
      setHighlightLinks(links);
    },
    [data.links, normalizeLink],
  );

  const handleNodeClick = useCallback(
    (node: NodeObject<GraphNode>) => {
      if (graphRef.current) {
        graphRef.current.centerAt(node.x, node.y, 1000);
        graphRef.current.zoom(2.5, 1000);
      }

      onNodeClick(node);
    },
    [onNodeClick],
  );

  const handleLinkClick = useCallback(
    (link: ForceGraphLink) => {
      const normalizedLink = normalizeLink(link);

      const linkData: GraphLink = {
        source: normalizedLink.sourceId,
        target: normalizedLink.targetId,
        type: normalizedLink.type,
        color: normalizedLink.color,
      };

      onLinkClick(linkData);
    },
    [onLinkClick, normalizeLink],
  );

  const handleLinkHover = useCallback(
    (link: ForceGraphLink | null) => {
      const nodes = new Set<string>();
      const links = new Set<string>();

      if (link) {
        const normalizedLink = normalizeLink(link);
        setHoverLink(normalizedLink);

        const { sourceId, targetId } = normalizedLink;
        links.add(`${sourceId}-${targetId}`);
        nodes.add(sourceId);
        nodes.add(targetId);
      } else {
        setHoverLink(null);
      }

      setHighlightNodes(nodes);
      setHighlightLinks(links);
    },
    [normalizeLink],
  );

  const resetView = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.centerAt(0, 0);
      graphRef.current.zoom(1, 1000);
    }
  }, []);

  useEffect(() => {
    resetView();
  }, [resetView]);
  
  useEffect(() => {
    if (selectedNodeId && data.nodes) {
      const selectedNode = data.nodes.find(node => 
        (typeof node === 'object' && node.id === selectedNodeId)
      );
      if (selectedNode && typeof selectedNode === 'object' && selectedNode.x && selectedNode.y && graphRef.current) {
        graphRef.current.centerAt(selectedNode.x, selectedNode.y, 1000);
        graphRef.current.zoom(2.5, 1000);
      }
    }
  }, [selectedNodeId, data.nodes]);
  

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="absolute top-20 right-4 z-10"
        onClick={resetView}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Reset View
      </Button>
      <div className="w-full h-full relative">
        {hoverNode && !hoverLink && (
          <div
            className="absolute bg-background/90 border rounded-md p-2 z-50 shadow-lg backdrop-blur-sm"
            style={{
              left: `${hoverNode.x! + 10}px`,
              top: `${hoverNode.y! - 10}px`,
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
            }}
          >
            <p className="font-medium">{hoverNode.name}</p>
          </div>
        )}

        {hoverLink && (
          <div
            className="absolute bg-background/90 border rounded-md p-2 z-50 shadow-lg backdrop-blur-sm"
            style={{
              left: `${((hoverLink.sourceX || 0) + (hoverLink.targetX || 0)) / 2}px`,
              top: `${((hoverLink.sourceY || 0) + (hoverLink.targetY || 0)) / 2}px`,
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
            }}
          >
            <p className="text-sm">
              <span className="font-medium">{hoverLink.sourceName}</span>{" "}
              <span className="text-muted-foreground">{hoverLink.type}</span>{" "}
              <span className="font-medium">{hoverLink.targetName}</span>
            </p>
          </div>
        )}
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          nodeLabel="name"
          nodeRelSize={6}
          nodeAutoColorBy="id"
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.25}
          linkWidth={(link) => {
            const normalized = normalizeLink(link as unknown as ForceGraphLink);
            const linkId = `${normalized.sourceId}-${normalized.targetId}`;
            return highlightLinks.has(linkId) ? 3 : 1;
          }}
          linkColor={(link) => {
            const normalized = normalizeLink(link as unknown as ForceGraphLink);
            const linkId = `${normalized.sourceId}-${normalized.targetId}`;
            return highlightLinks.has(linkId)
              ? "#ff9900"
              : normalized.color || "#999";
          }}
          linkDirectionalParticles={(link) => {
            const normalized = normalizeLink(link as unknown as ForceGraphLink);
            const linkId = `${normalized.sourceId}-${normalized.targetId}`;
            return highlightLinks.has(linkId) ? 5 : 0;
          }}
          linkDirectionalParticleWidth={3}
          linkDirectionalParticleColor={() => "#ff9900"}
          onLinkHover={handleLinkHover}
          onLinkClick={handleLinkClick}
          extraRenderers={[
            // This renderer draws selected/hovered nodes on top of everything
            (canvas, ctx, globalScale) => {
              if (!selectedNodeId && !hoverNode) return false;
              
              // Find nodes to render on top
              const nodesToDraw = data.nodes.filter(node => {
                if (typeof node !== 'object') return false;
                return node.id === selectedNodeId || (hoverNode && node.id === hoverNode.id);
              }) as NodeObject<GraphNode>[];
              
              if (nodesToDraw.length === 0) return false;
              
              // Render these nodes on top
              nodesToDraw.forEach(node => {
                const isHovered = hoverNode && node.id === hoverNode.id;
                const isSelected = node.id === selectedNodeId;
                const isHighlighted = isHovered || isSelected;
                
                renderNode(
                  node,
                  ctx,
                  globalScale,
                  imgCache.current,
                  isHighlighted,
                  isSelected,
                  () => { if (graphRef.current) graphRef.current.refresh(); }
                );
              });
              
              return false; // Continue with standard rendering for everything else
            }
          ]}
          nodeCanvasObject={(node, ctx, globalScale) => {
            // Skip rendering selected/hovered nodes since they're handled in extraRenderers
            if (node.id === selectedNodeId || (hoverNode && node.id === hoverNode.id)) {
              return;
            }
            
            const isHighlighted = highlightNodes.has(node.id as string);
            const isSelected = false; // Regular nodes are never selected here
            
            renderNode(
              node,
              ctx,
              globalScale,
              imgCache.current,
              isHighlighted,
              isSelected,
              () => { if (graphRef.current) graphRef.current.refresh(); }
            );
          }}
          onNodeHover={handleNodeHover}
          onNodeClick={handleNodeClick}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />
      </div>
    </>
  );
};

export default Graph;

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
import { SearchBar } from "./SearchBar";

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
  selectedLink: GraphLink | null;
}

const Graph = ({
  data,
  onNodeClick,
  onLinkClick,
  selectedNodeId,
  selectedLink,
}: GraphProps) => {
  const focusOnPosition = useCallback((x: number, y: number) => {
    if (graphRef.current) {
      const windowWidth = window.innerWidth;
      const xOffset = windowWidth * 0.1;
      graphRef.current.centerAt(x + xOffset, y, 1000);
      graphRef.current.zoom(2.5, 1000);
    }
  }, []);
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
  const throttleRef = useRef(false);

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
      focusOnPosition(node.x, node.y);
      onNodeClick(node);
    },
    [onNodeClick, focusOnPosition],
  );

  const handleLinkClick = useCallback(
    (link: ForceGraphLink) => {
      const normalizedLink = normalizeLink(link);

      if (
        normalizedLink.sourceX !== undefined &&
        normalizedLink.sourceY !== undefined &&
        normalizedLink.targetX !== undefined &&
        normalizedLink.targetY !== undefined
      ) {
        const centerX = (normalizedLink.sourceX + normalizedLink.targetX) / 2;
        const centerY = (normalizedLink.sourceY + normalizedLink.targetY) / 2;

        focusOnPosition(centerX, centerY);
      }

      const linkData: GraphLink = {
        source: normalizedLink.sourceId,
        target: normalizedLink.targetId,
        type: normalizedLink.type,
        color: normalizedLink.color,
      };

      onLinkClick(linkData);
    },
    [onLinkClick, normalizeLink, focusOnPosition],
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
      const selectedNode = data.nodes.find(
        (node) => typeof node === "object" && node.id === selectedNodeId,
      );
      if (
        selectedNode &&
        typeof selectedNode === "object" &&
        selectedNode.x &&
        selectedNode.y
      ) {
        focusOnPosition(selectedNode.x, selectedNode.y);
      }
    }
  }, [selectedNodeId, data.nodes, focusOnPosition]);

  useEffect(() => {
    const preloadImages = () => {
      if (data.nodes) {
        data.nodes.forEach((node) => {
          if (typeof node === "object" && node.data?.picture) {
            const pictureUrl = node.data.picture;
            if (!imgCache.current[pictureUrl]) {
              const img = new Image();
              img.onload = () => {
                if (graphRef.current && !throttleRef.current) {
                  throttleRef.current = true;
                  setTimeout(() => {
                    graphRef.current?.refresh();
                    throttleRef.current = false;
                  }, 300);
                }
              };
              img.src = pictureUrl;
              imgCache.current[pictureUrl] = img;
            }
          }
        });
      }
    };

    preloadImages();
  }, [data.nodes]);

  const handleSearchNodeSelect = useCallback(
    (node: GraphNode) => {
      const graphNode = data.nodes.find(
        (n) => typeof n === "object" && n.id === node.id,
      ) as NodeObject<GraphNode>;

      if (graphNode && graphNode.x && graphNode.y) {
        focusOnPosition(graphNode.x, graphNode.y);
        onNodeClick(node);
      }
    },
    [data.nodes, focusOnPosition, onNodeClick],
  );

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

      <SearchBar
        nodes={data.nodes.filter(
          (node): node is GraphNode =>
            typeof node === "object" && node.name !== undefined,
        )}
        onSelectNode={handleSearchNodeSelect}
      />

      <div id="graph-container" className="w-full h-full relative">
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
            const isSelectedLink =
              selectedLink &&
              ((selectedLink.source === normalized.sourceId &&
                selectedLink.target === normalized.targetId) ||
                (selectedLink.source === normalized.targetId &&
                  selectedLink.target === normalized.sourceId));

            return highlightLinks.has(linkId) || isSelectedLink ? 3 : 1;
          }}
          linkColor={(link) => {
            const normalized = normalizeLink(link as unknown as ForceGraphLink);
            const linkId = `${normalized.sourceId}-${normalized.targetId}`;
            const isSelectedLink =
              selectedLink &&
              ((selectedLink.source === normalized.sourceId &&
                selectedLink.target === normalized.targetId) ||
                (selectedLink.source === normalized.targetId &&
                  selectedLink.target === normalized.sourceId));

            return highlightLinks.has(linkId) || isSelectedLink
              ? "#ff9900"
              : normalized.color || "#999";
          }}
          linkDirectionalParticles={(link) => {
            const normalized = normalizeLink(link as unknown as ForceGraphLink);
            const linkId = `${normalized.sourceId}-${normalized.targetId}`;
            const isSelectedLink =
              selectedLink &&
              ((selectedLink.source === normalized.sourceId &&
                selectedLink.target === normalized.targetId) ||
                (selectedLink.source === normalized.targetId &&
                  selectedLink.target === normalized.sourceId));

            return highlightLinks.has(linkId) || isSelectedLink ? 5 : 0;
          }}
          linkDirectionalParticleWidth={3}
          linkDirectionalParticleColor={() => "#ff9900"}
          onLinkHover={handleLinkHover}
          onLinkClick={handleLinkClick}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const isHighlighted =
              highlightNodes.has(node.id as string) ||
              node.id === selectedNodeId;
            const isSelected = node.id === selectedNodeId;

            renderNode(
              node,
              ctx,
              globalScale,
              imgCache.current,
              isHighlighted,
              isSelected,
              () => {
                if (graphRef.current && !throttleRef.current) {
                  throttleRef.current = true;
                  setTimeout(() => {
                    graphRef.current?.refresh();
                    throttleRef.current = false;
                  }, 300);
                }
              },
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

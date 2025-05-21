import { useState, useRef, useCallback } from "react";
import ForceGraph2D, {
  ForceGraphMethods,
  LinkObject,
  NodeObject,
} from "react-force-graph-2d";
import { GraphData, GraphNode, GraphLink } from "@/types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

type NodeReference = string | NodeObject<GraphNode>;
type ForceGraphLink = LinkObject<NodeObject<GraphNode>, GraphLink>;

interface GraphNodeWithCoords extends GraphNode {
  x?: number;
  y?: number;
}

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
}

const Graph = ({ data, onNodeClick, onLinkClick }: GraphProps) => {
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

  return (
    <div className="w-full h-full relative">
      <Button
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 z-10"
        onClick={resetView}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Reset View
      </Button>

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
        nodeCanvasObject={(node, ctx, globalScale) => {
          const { x, y, name, color, val } = node;
          const fontSize = val * 1.2;
          const isHighlighted = highlightNodes.has(node.id as string);

          ctx.beginPath();
          ctx.arc(x!, y!, val! * (isHighlighted ? 1.4 : 1), 0, 2 * Math.PI);
          ctx.fillStyle = color || "#3B82F6";
          ctx.fill();

          if (isHighlighted) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }

          if (globalScale > 1 || isHighlighted) {
            ctx.font = `${isHighlighted ? "bold " : ""}${fontSize}px Sans-Serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#fff";
            ctx.fillText(name as string, x!, y! + val! * 1.7);
          }
        }}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
    </div>
  );
};

export default Graph;

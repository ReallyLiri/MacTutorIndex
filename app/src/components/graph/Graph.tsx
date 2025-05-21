import { useState, useRef, useCallback } from "react";
import ForceGraph2D, {
  ForceGraphMethods,
  LinkObject,
  NodeObject,
} from "react-force-graph-2d";
import { GraphData, GraphNode, GraphLink } from "@/types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface GraphProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  onLinkClick: (link: GraphLink) => void;
}

const Graph = ({ data, onNodeClick, onLinkClick }: GraphProps) => {
  const graphRef =
    useRef<
      ForceGraphMethods<NodeObject<GraphNode>, LinkObject<GraphNode, GraphLink>>
    >(undefined);
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<string>());
  const [hoverNode, setHoverNode] = useState<NodeObject<GraphNode> | null>(
    null,
  );
  const [hoverLink, setHoverLink] = useState<LinkObject<
    NodeObject<GraphNode>,
    GraphLink
  > | null>(null);

  const handleNodeHover = useCallback(
    (node: GraphNode | null) => {
      const nodes = new Set<string>();
      const links = new Set<string>();

      if (node) {
        setHoverNode(node);
        nodes.add(node.id);

        if (data.links) {
          data.links.forEach((link) => {
            const sourceId =
              typeof link.source === "object" ? link.source.id : link.source;
            const targetId =
              typeof link.target === "object" ? link.target.id : link.target;

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
    [data.links],
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
    (link: LinkObject<GraphNode, GraphLink>) => {
      // Make sure we have the data we need for the connection details
      const linkData: GraphLink = {
        source: link.source.id || (link.source as string),
        target: link.target.id || (link.target as string),
        type: link.type || "",
      };

      onLinkClick(linkData);
    },
    [onLinkClick],
  );

  const handleLinkHover = useCallback(
    (link: LinkObject<GraphNode, GraphLink> | null) => {
      setHoverLink(link);

      const nodes = new Set<string>();
      const links = new Set<string>();

      if (link) {
        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;

        links.add(`${sourceId}-${targetId}`);

        nodes.add(sourceId as string);
        nodes.add(targetId as string);
      }

      setHighlightNodes(nodes);
      setHighlightLinks(links);
    },
    [],
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
            left: `${
              ((typeof hoverLink.source === "object"
                ? hoverLink.source.x!
                : 0) +
                (typeof hoverLink.target === "object"
                  ? hoverLink.target.x!
                  : 0)) /
              2
            }px`,
            top: `${
              ((typeof hoverLink.source === "object"
                ? hoverLink.source.y!
                : 0) +
                (typeof hoverLink.target === "object"
                  ? hoverLink.target.y!
                  : 0)) /
              2
            }px`,
            transform: "translate(-50%, -100%)",
            pointerEvents: "none",
          }}
        >
          <p className="text-sm">
            <span className="font-medium">
              {typeof hoverLink.source === "object"
                ? hoverLink.source.name
                : ""}
            </span>{" "}
            <span className="text-muted-foreground">{hoverLink.type}</span>{" "}
            <span className="font-medium">
              {typeof hoverLink.target === "object"
                ? hoverLink.target.name
                : ""}
            </span>
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
          const sourceId =
            typeof link.source === "object" ? link.source.id : link.source;
          const targetId =
            typeof link.target === "object" ? link.target.id : link.target;
          const linkId = `${sourceId}-${targetId}`;
          return highlightLinks.has(linkId) ? 3 : 1;
        }}
        linkColor={(link) => {
          const sourceId =
            typeof link.source === "object" ? link.source.id : link.source;
          const targetId =
            typeof link.target === "object" ? link.target.id : link.target;
          const linkId = `${sourceId}-${targetId}`;
          return highlightLinks.has(linkId) ? "#ff9900" : link.color || "#999";
        }}
        linkDirectionalParticles={(link) => {
          const sourceId =
            typeof link.source === "object" ? link.source.id : link.source;
          const targetId =
            typeof link.target === "object" ? link.target.id : link.target;
          const linkId = `${sourceId}-${targetId}`;
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

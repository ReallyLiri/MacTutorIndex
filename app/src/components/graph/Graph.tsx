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

  const updateHighlight = () => {
    setHighlightNodes(highlightNodes);
    setHighlightLinks(highlightLinks);
  };

  const handleNodeHover = useCallback(
    (node: GraphNode | null) => {
      highlightNodes.clear();
      highlightLinks.clear();

      if (node) {
        setHoverNode(node);
        highlightNodes.add(node.id);

        if (data.links) {
          data.links.forEach((link) => {
            const sourceId = link.source;
            const targetId = link.target;

            if (sourceId === node.id || targetId === node.id) {
              highlightLinks.add(`${sourceId}-${targetId}`);
              highlightNodes.add(sourceId);
              highlightNodes.add(targetId);
            }
          });
        }
      } else {
        setHoverNode(null);
      }

      updateHighlight();
    },
    [data.links, highlightLinks, highlightNodes, updateHighlight],
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
    (link: GraphLink) => {
      onLinkClick(link);
    },
    [onLinkClick],
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

      {hoverNode && (
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
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        nodeLabel="name"
        nodeRelSize={6}
        nodeAutoColorBy="id"
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        linkWidth={(link) =>
          highlightLinks.has(`${link.source}-${link.target}`) ? 2 : 1
        }
        linkColor={(link) => link.color || "#999"}
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
        onLinkClick={handleLinkClick}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
    </div>
  );
};

export default Graph;

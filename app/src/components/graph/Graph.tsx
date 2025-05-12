import { useState, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphData, GraphNode, GraphLink } from '@/types';

interface GraphProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  onLinkClick: (link: GraphLink) => void;
}

const Graph = ({ data, onNodeClick, onLinkClick }: GraphProps) => {
  const graphRef = useRef<any>();
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<string>());
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);

  const updateHighlight = () => {
    setHighlightNodes(highlightNodes);
    setHighlightLinks(highlightLinks);
  };

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    highlightNodes.clear();
    highlightLinks.clear();
    
    if (node) {
      setHoverNode(node);
      highlightNodes.add(node.id);
      
      // Get all connected links and nodes
      if (data.links) {
        data.links.forEach(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          
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
  }, [data.links]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    // Center the graph on the clicked node
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(2.5, 1000);
    }
    
    onNodeClick(node);
  }, [onNodeClick]);

  const handleLinkClick = useCallback((link: GraphLink) => {
    onLinkClick(link);
  }, [onLinkClick]);

  return (
    <div className="w-full h-full">
      {hoverNode && (
        <div 
          className="absolute bg-background/90 border rounded-md p-2 z-50 shadow-lg backdrop-blur-sm"
          style={{
            left: `${hoverNode.x! + 10}px`,
            top: `${hoverNode.y! - 10}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none'
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
        linkWidth={link => highlightLinks.has(`${link.source}-${link.target}`) ? 2 : 1}
        linkColor={link => link.color || '#999'}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const { x, y, name, color, val } = node as GraphNode;
          const fontSize = val * 1.2;
          const isHighlighted = highlightNodes.has(node.id as string);
          
          // Draw node circle
          ctx.beginPath();
          ctx.arc(x!, y!, val! * (isHighlighted ? 1.4 : 1), 0, 2 * Math.PI);
          ctx.fillStyle = color || '#3B82F6';
          ctx.fill();
          
          // Draw border for highlighted nodes
          if (isHighlighted) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
          
          // Draw node label if zoomed in or highlighted
          if (globalScale > 1 || isHighlighted) {
            ctx.font = `${isHighlighted ? 'bold ' : ''}${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
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
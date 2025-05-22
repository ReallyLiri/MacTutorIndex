import { NodeObject } from "react-force-graph-2d";
import { GraphNode, GraphNodeWithCoords } from "@/types";

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

export const renderNode = (
  node: NodeObject<GraphNode>,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  imgCache: Record<string, HTMLImageElement>,
  isHighlighted: boolean,
  isSelected: boolean,
  graphRefreshCallback: () => void
) => {
  const { x, y, name, color, val, data } = node;
  const fontSize = val * 1.2;
  const nodeRadius = val! * (isHighlighted ? 1.4 : 1);
  
  ctx.beginPath();
  ctx.arc(x!, y!, nodeRadius, 0, 2 * Math.PI);
  ctx.fillStyle = color || "#3B82F6";
  ctx.fill();
  
  const showImage = (globalScale > 0.7 || isHighlighted) && nodeRadius > 3;
  
  if (showImage && data?.picture) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x!, y!, nodeRadius - 1, 0, 2 * Math.PI);
    ctx.clip();
    
    const img = new Image();
    img.src = data.picture;
    
    try {
      if (img.complete && img.naturalHeight !== 0) {
        const imgWidth = img.naturalWidth || nodeRadius * 2;
        const imgHeight = img.naturalHeight || nodeRadius * 2;
        const scale = Math.max(
          (nodeRadius * 2) / imgWidth,
          (nodeRadius * 2) / imgHeight
        );
        
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;
        
        const imgX = x! - scaledWidth / 2;
        const imgY = y! - scaledHeight / 2;
        
        ctx.drawImage(img, imgX, imgY, scaledWidth, scaledHeight);
      } else {
        drawInitials();
        img.onload = graphRefreshCallback;
      }
    } catch (e) {
      drawInitials();
    }
    
    ctx.restore();
  } else {
    drawInitials();
  }
  
  if (isHighlighted) {
    ctx.strokeStyle = isSelected ? "#ffd700" : "#ffffff";
    ctx.lineWidth = isSelected ? 2 : 0.5;
    ctx.stroke();
  }
  
  if (globalScale > 1 || isHighlighted) {
    ctx.font = `${isHighlighted ? "bold " : ""}${fontSize}px Sans-Serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText(name as string, x!, y! + nodeRadius * 1.3);
  }
  
  function drawInitials() {
    if (name) {
      const initial = getInitials(name);
      const fontSize = Math.min(nodeRadius * 0.8, 12);
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.fillText(initial, x!, y!);
    }
  }
};
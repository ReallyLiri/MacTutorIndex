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
  graphRefreshCallback: () => void,
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

    drawInitials();

    const cachedImg = imgCache[data.picture];
    if (cachedImg && cachedImg.complete && cachedImg.naturalHeight !== 0) {
      try {
        const imgWidth = cachedImg.naturalWidth || nodeRadius * 2;
        const imgHeight = cachedImg.naturalHeight || nodeRadius * 2;
        const scale = Math.max(
          (nodeRadius * 2) / imgWidth,
          (nodeRadius * 2) / imgHeight,
        );

        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;

        const imgX = x! - scaledWidth / 2;
        const imgY = y! - scaledHeight / 2;

        ctx.drawImage(cachedImg, imgX, imgY, scaledWidth, scaledHeight);
      } catch (e) {}
    } else if (!cachedImg) {
      const img = new Image();
      img.onload = graphRefreshCallback;
      img.src = data.picture;
      imgCache[data.picture] = img;
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

  if (isHighlighted) {
    ctx.font = `bold ${fontSize}px Sans-Serif`;
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

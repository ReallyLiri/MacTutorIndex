import { useMemo } from "react";
import { GraphData, Mathematician } from "../types";

export const useGraph = (mathematicians: Mathematician[]) => {
  return useMemo(() => {
    if (!mathematicians.length) return { nodes: [], links: [] };

    const nodes = mathematicians.map((mathematician) => ({
      id: mathematician.id,
      name: mathematician.name,
      val: 1 + (mathematician.connections?.length || 0) * 0.5,
      img: mathematician.picture,
      color: getNodeColor(mathematician),
      data: mathematician,
    }));

    const mathematicianIds = new Set(nodes.map((node) => node.id));

    const links: GraphData["links"] = [];

    mathematicians.forEach((mathematician) => {
      if (mathematician.connections) {
        mathematician.connections.forEach((connection) => {
          if (mathematicianIds.has(connection.person)) {
            links.push({
              source: mathematician.id,
              target: connection.person,
              type: connection.connection_type,
              color: getLinkColor(connection.connection_type),
              data: {
                source: mathematician.id,
                target: connection.person,
                type: connection.connection_type,
              },
            });
          }
        });
      }
    });

    return { nodes, links };
  }, [mathematicians]);
};

const getNodeColor = (_mathematician: Mathematician): string => {
  return "#3B82F6";
};

export const getLinkColor = (connectionType: string): string => {
  switch (connectionType.toLowerCase()) {
    case "influenced by":
      return "#9333EA";
    case "collaborated with":
      return "#14B8A6";
    case "student of":
    case "studied":
      return "#22C55E";
    case "teacher of":
      return "#F97316";
    case "mentor":
    case "mentor of":
    case "advisor to":
    case "supervisor of":
      return "#EAB308";
    case "colleague of":
    case "colleague":
    case "contemporary of":
      return "#3B82F6";
    case "friend of":
      return "#EC4899";
    case "correspondent with":
      return "#8B5CF6";
    case "other":
    default:
      return "#94A3B8";
  }
};

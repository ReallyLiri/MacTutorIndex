import { useMemo } from 'react';
import { Mathematician, GraphData, Filters } from '../types';

export const useGraph = (mathematicians: Mathematician[], filters: Filters) => {
  return useMemo(() => {
    if (!mathematicians.length) return { nodes: [], links: [] };

    // Create nodes from mathematicians (already filtered by useFirestore)
    const nodes = mathematicians.map(mathematician => ({
      id: mathematician.id,
      name: mathematician.name,
      val: 1 + (mathematician.connections?.length || 0) * 0.5,
      img: mathematician.picture,
      color: getNodeColor(mathematician),
      data: mathematician
    }));

    // Create a set of mathematician IDs for quick lookup
    const mathematicianIds = new Set(nodes.map(node => node.id));

    // Create links between mathematicians
    const links: GraphData['links'] = [];
    
    mathematicians.forEach(mathematician => {
      if (mathematician.connections) {
        mathematician.connections.forEach(connection => {
          // Only add links if both source and target exist in filtered nodes
          if (mathematicianIds.has(connection.person)) {
            links.push({
              source: mathematician.id,
              target: connection.person,
              type: connection.connection_type,
              color: getLinkColor(connection.connection_type),
              data: {
                source: mathematician.id,
                target: connection.person,
                type: connection.connection_type
              }
            });
          }
        });
      }
    });

    return { nodes, links };
  }, [mathematicians]);
};

// Get a color for a node based on mathematician data
const getNodeColor = (mathematician: Mathematician): string => {
  return '#3B82F6';
};

// Get a color for a link based on connection type
const getLinkColor = (connectionType: string): string => {
  switch (connectionType.toLowerCase()) {
    case 'influenced by':
      return '#9333EA';
    case 'collaborator with':
      return '#14B8A6';
    case 'teacher of':
      return '#F97316';
    case 'student of':
      return '#22C55E';
    default:
      return '#94A3B8';
  }
};
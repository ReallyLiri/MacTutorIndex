export type Mathematician = {
  id: string;
  name: string;
  summary: string;
  born: {
    year: number | null;
    approx: boolean;
    place: string;
    link?: string;
  };
  died: {
    year: number | null;
    approx: boolean;
    place: string;
    link?: string;
  };
  picture?: string;
  connections: {
    person: string;
    connection_type: string;
    key: string;
  }[];
  lived_in: string[];
  worked_in: string[];
  religions: string[];
  profession: string[];
  institution_affiliation: string[];
};

export type GraphNode = {
  id: string;
  name: string;
  val: number;
  color?: string;
  img?: string;
  data: Mathematician;
};

export interface GraphNodeWithCoords extends GraphNode {
  x?: number;
  y?: number;
};

export type GraphLink = {
  source: string;
  target: string;
  type: string;
  color?: string;
  data?: {
    source: string;
    target: string;
    type: string;
  };
};

export type GraphData = {
  nodes: (GraphNode & string)[];
  links: GraphLink[];
};

export type Filters = {
  yearRange: [number, number];
  locations: string[];
  religions: string[];
  institutions: string[];
  mathematicians: string[];
};

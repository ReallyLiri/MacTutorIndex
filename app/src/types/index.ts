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
    person: string; // ID or name of the other mathematician
    connection_type: string; // e.g. "influenced by", "collaborator with"
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
  nodes: GraphNode[];
  links: GraphLink[];
};

export type Filters = {
  yearRange: [number, number];
  locations: string[];
  religions: string[];
  institutions: string[];
  mathematicians: string[];
};
import { toTitleCase } from "./textUtils";

export interface LocationNode {
  name: string;
  fullPath: string;
  children: LocationNode[];
  parent?: LocationNode;
  depth: number;
}

export function buildLocationTree(locations: string[]): LocationNode[] {
  const root: LocationNode = {
    name: "Root",
    fullPath: "",
    children: [],
    depth: 0
  };
  
  locations.forEach(location => {
    if (!location) return;
    
    const parts = location
      .split(/,\s*/)
      .map(part => part.trim().replace(/[()]/g, ''))
      .filter(Boolean);
    
    if (parts.length === 0) return;
    
    let currentNode = root;
    
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = toTitleCase(parts[i]);
      const fullPath = parts.slice(i).join(", ");
      
      let childNode = currentNode.children.find(child => child.name === part);
      
      if (!childNode) {
        childNode = {
          name: part,
          fullPath,
          children: [],
          parent: currentNode,
          depth: currentNode.depth + 1
        };
        currentNode.children.push(childNode);
      }
      
      currentNode = childNode;
    }
  });
  
  sortLocationNodes(root);
  mergeSingleChildNodes(root);
  
  return root.children;
}

function mergeSingleChildNodes(node: LocationNode): void {
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    
    mergeSingleChildNodes(child);
    
    if (child.children.length === 1) {
      const grandchild = child.children[0];
      
      child.name = `${child.name}, ${grandchild.name}`;
      child.fullPath = grandchild.fullPath;
      child.children = grandchild.children;
      
      grandchild.children.forEach(gc => {
        gc.parent = child;
      });
    }
  }
}

function sortLocationNodes(node: LocationNode): void {
  node.children.sort((a, b) => a.name.localeCompare(b.name));
  node.children.forEach(sortLocationNodes);
}

export function flattenLocationTree(nodes: LocationNode[]): string[] {
  const result: string[] = [];
  
  function traverse(node: LocationNode) {
    result.push(node.fullPath);
    node.children.forEach(traverse);
  }
  
  nodes.forEach(traverse);
  
  return result;
}

export function findLocationNode(tree: LocationNode[], path: string): LocationNode | undefined {
  for (const node of tree) {
    if (node.fullPath === path) {
      return node;
    }
    
    const found = findLocationNode(node.children, path);
    if (found) return found;
  }
  
  return undefined;
}

export function getAncestors(node: LocationNode): LocationNode[] {
  const ancestors: LocationNode[] = [];
  let current = node.parent;
  
  while (current && current.name !== "Root") {
    ancestors.unshift(current);
    current = current.parent;
  }
  
  return ancestors;
}

export function getDescendants(node: LocationNode): LocationNode[] {
  const descendants: LocationNode[] = [];
  
  function traverse(n: LocationNode) {
    n.children.forEach(child => {
      descendants.push(child);
      traverse(child);
    });
  }
  
  traverse(node);
  
  return descendants;
}
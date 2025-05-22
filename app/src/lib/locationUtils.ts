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

export function getAllSelectedPaths(tree: LocationNode[], selectedPaths: string[]): string[] {
  // Create a set for fast lookups
  const selectedSet = new Set(selectedPaths);
  const effectiveSelections = new Set<string>();
  
  // Process the tree to find effective selections
  function processNode(node: LocationNode): boolean {
    // If this node is explicitly selected
    if (selectedSet.has(node.fullPath)) {
      effectiveSelections.add(node.fullPath);
      // Don't need to check children - parent selection implies child selection
      return true;
    }
    
    // If it's a leaf node with no children
    if (node.children.length === 0) {
      return false;
    }
    
    // Process all children
    const childStates = node.children.map(child => processNode(child));
    
    // If all children are selected, this node is effectively selected
    if (childStates.every(state => state === true) && node.children.length > 0) {
      // All children are selected, so this node should also be selected
      effectiveSelections.add(node.fullPath);
      return true;
    }
    
    // If some but not all children are selected
    if (childStates.some(state => state === true)) {
      // Some children are selected - node is not fully selected
      return false;
    }
    
    return false;
  }
  
  // Process the entire tree
  tree.forEach(processNode);
  
  // Combine explicit selections with derived ones
  const result = new Set([...effectiveSelections, ...selectedSet]);
  return Array.from(result);
}

export function getNodeSelectionState(node: LocationNode, selectedPaths: string[]): "checked" | "indeterminate" | "unchecked" {
  const selectedSet = new Set(selectedPaths);
  
  if (selectedSet.has(node.fullPath)) {
    return "checked";
  }
  
  if (node.children.length === 0) {
    return "unchecked";
  }
  
  const checkDescendants = (n: LocationNode): { total: number; selected: number } => {
    let total = 0;
    let selected = 0;
    
    total++;
    if (selectedSet.has(n.fullPath)) {
      selected++;
    }
    
    for (const child of n.children) {
      const childCounts = checkDescendants(child);
      total += childCounts.total;
      selected += childCounts.selected;
    }
    
    return { total, selected };
  };
  
  let totalNodes = 0;
  let selectedNodes = 0;
  
  for (const child of node.children) {
    const counts = checkDescendants(child);
    totalNodes += counts.total;
    selectedNodes += counts.selected;
  }
  
  if (selectedNodes === totalNodes && totalNodes > 0) {
    return "checked";
  }
  
  if (selectedNodes > 0) {
    return "indeterminate";
  }
  
  return "unchecked";
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
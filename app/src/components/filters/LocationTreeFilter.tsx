import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { normalizeText } from "@/lib/textUtils";
import {
  getAllSelectedPaths,
  getNodeSelectionState,
  LocationNode,
} from "@/lib/locationUtils";

interface LocationTreeFilterProps {
  className?: string;
  value: string[];
  locationTree: LocationNode[];
  onChange: (value: string[]) => void;
  title: string;
}

const LocationTreeItem = ({
  node,
  selectedPaths,
  onToggle,
  searchQuery,
  expandedNodes,
  toggleExpand,
}: {
  node: LocationNode;
  selectedPaths: string[];
  onToggle: (node: LocationNode, checked: boolean) => void;
  searchQuery: string;
  expandedNodes: Set<string>;
  toggleExpand: (node: LocationNode) => void;
}) => {
  const selectionState = getNodeSelectionState(node, selectedPaths);
  const isExpanded = expandedNodes.has(node.fullPath);
  const hasChildren = node.children.length > 0;
  const normalizedQuery = normalizeText(searchQuery);
  const normalizedName = normalizeText(node.name);
  const normalizedFullPath = normalizeText(node.fullPath);

  const isVisible =
    !searchQuery ||
    normalizedName.includes(normalizedQuery) ||
    normalizedFullPath.includes(normalizedQuery);

  if (!isVisible) return null;

  // Use inline style for padding to support deeper nesting
  const indentPadding = node.depth * 1;

  return (
    <div>
      <div
        className="flex items-start space-x-2 min-h-6 py-1 hover:bg-muted/50"
        style={{ paddingLeft: `${indentPadding}rem` }}
      >
        <Checkbox
          checked={selectionState === "checked"}
          indeterminate={selectionState === "indeterminate"}
          onCheckedChange={(checked) => onToggle(node, checked === true)}
          className={`h-4 w-4 ${hasChildren ? "" : "mt-[0.2em]"}`}
        />
        <div
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={() => hasChildren && toggleExpand(node)}
        >
          <span className="text-sm leading-tight">{node.name}</span>

          {hasChildren && (
            <>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                ({node.children.length})
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div>
          {node.children.map((child) => (
            <LocationTreeItem
              key={child.fullPath}
              node={child}
              selectedPaths={selectedPaths}
              onToggle={onToggle}
              searchQuery={searchQuery}
              expandedNodes={expandedNodes}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const LocationTreeFilter = ({
  className,
  value,
  locationTree,
  onChange,
  title,
}: LocationTreeFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleNodeExpand = (node: LocationNode) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(node.fullPath)) {
      newExpandedNodes.delete(node.fullPath);
    } else {
      newExpandedNodes.add(node.fullPath);
    }
    setExpandedNodes(newExpandedNodes);
  };

  const handleToggle = (node: LocationNode, checked: boolean) => {
    const currentSelections = new Set(value);

    const getAllPaths = (n: LocationNode): string[] => {
      return [n.fullPath, ...n.children.flatMap(getAllPaths)];
    };

    if (checked) {
      getAllPaths(node).forEach((path) => currentSelections.add(path));
    } else {
      getAllPaths(node).forEach((path) => currentSelections.delete(path));
    }

    onChange(Array.from(currentSelections));
  };

  const handleSelectAll = () => {
    const paths = new Set<string>();

    const addNodeAndDescendants = (node: LocationNode) => {
      paths.add(node.fullPath);
      node.children.forEach((child) => {
        addNodeAndDescendants(child);
      });
    };

    locationTree.forEach(addNodeAndDescendants);

    onChange(Array.from(paths));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const effectiveSelectedPaths = getAllSelectedPaths(value);

  const selectedCount = value.length;

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <span className="font-medium text-sm text-blue-500">{title}</span>
          <span className="text-sm text-gray-500">({locationTree.length})</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} selected` : "All"}
        </span>
      </div>

      {isExpanded && (
        <>
          <Input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex justify-start gap-3 mt-1 mb-1">
            <button
              className="text-xs hover:underline"
              onClick={handleSelectAll}
            >
              Select all
            </button>
            <button
              className="text-xs hover:underline"
              onClick={handleClearAll}
            >
              Clear all
            </button>
            <button
              className="text-xs hover:underline ml-auto"
              onClick={() => {
                const newExpandedNodes = new Set(expandedNodes);

                // Recursive function to add all nodes and their children
                const expandAllNodes = (nodes: LocationNode[]) => {
                  nodes.forEach((node) => {
                    newExpandedNodes.add(node.fullPath);
                    if (node.children.length > 0) {
                      expandAllNodes(node.children);
                    }
                  });
                };

                expandAllNodes(locationTree);
                setExpandedNodes(newExpandedNodes);
              }}
            >
              Expand All
            </button>
            <button
              className="text-xs hover:underline"
              onClick={() => {
                setExpandedNodes(new Set());
              }}
            >
              Collapse All
            </button>
          </div>
          <ScrollArea className="h-40">
            <div className="space-y-0 mt-1">
              {locationTree.map((node) => (
                <LocationTreeItem
                  key={node.fullPath}
                  node={node}
                  selectedPaths={effectiveSelectedPaths}
                  onToggle={handleToggle}
                  searchQuery={searchQuery}
                  expandedNodes={expandedNodes}
                  toggleExpand={toggleNodeExpand}
                />
              ))}

              {locationTree.length === 0 && (
                <div className="text-sm text-muted-foreground py-2">
                  No locations found
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
};

export default LocationTreeFilter;

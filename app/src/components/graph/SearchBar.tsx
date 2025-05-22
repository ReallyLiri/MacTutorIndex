import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { GraphNode } from "@/types";
import { Search } from "lucide-react";

interface SearchBarProps {
  nodes: GraphNode[];
  onSelectNode: (node: GraphNode) => void;
}

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export function SearchBar({ nodes, onSelectNode }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<GraphNode[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const normalizedQuery = normalizeText(query);
    const matchedNodes = nodes
      .filter((node) => {
        const normalizedName = normalizeText(node.name);
        return normalizedName.includes(normalizedQuery);
      })
      .slice(0, 10);

    setResults(matchedNodes);
  }, [query, nodes]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResultClick = (node: GraphNode) => {
    onSelectNode(node);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-[5rem] left-[18rem] z-10 w-80 shadow-lg"
    >
      <div className="relative">
        <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search mathematicians..."
          className="pl-8 pr-4 h-10"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(!!e.target.value);
          }}
          onFocus={() => {
            if (query) setIsOpen(true);
          }}
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="bg-background border rounded-md mt-1 max-h-60 overflow-y-auto">
          <ul className="py-1">
            {results.map((node) => (
              <li
                key={node.id}
                className="px-4 py-2 hover:bg-muted cursor-pointer"
                onClick={() => handleResultClick(node)}
              >
                {node.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

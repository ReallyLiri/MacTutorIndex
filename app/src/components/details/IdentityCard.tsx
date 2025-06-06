import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraphNode, Mathematician } from "@/types";
import { useEffect, useState } from "react";
import MultiSelectFilter from "@/components/filters/MultiSelectFilter";
import { useFirestore } from "@/hooks/useFirestore";
import { getInitials, formatYear, formatPlace } from "@/lib/personUtils";

const getConnectionColor = (connectionType: string): string => {
  switch (connectionType.toLowerCase()) {
    case "influenced by":
      return "#9333EA";
    case "collaborator with":
      return "#14B8A6";
    case "teacher of":
      return "#F97316";
    case "student of":
      return "#22C55E";
    default:
      return "#94A3B8";
  }
};

interface IdentityCardProps {
  mathematician: Mathematician;
  onClose: () => void;
  onPersonClick?: (node: GraphNode) => void;
  availableNodes?: GraphNode[];
}

interface ConnectionPersonProps {
  name: string;
  connectionType: string;
  personKey: string;
  correspondingNode?: GraphNode;
  onPersonClick?: (node: GraphNode) => void;
  connectionColor?: string;
}

const ConnectionPerson = ({
  name,
  connectionType,
  personKey,
  correspondingNode,
  onPersonClick,
  connectionColor,
}: ConnectionPersonProps) => {
  const [personData, setPersonData] = useState<Mathematician | null>(null);
  const [loading, setLoading] = useState(true);
  const { getMathematicianById } = useFirestore(null);

  useEffect(() => {
    const fetchPerson = async () => {
      setLoading(true);
      const data = await getMathematicianById(personKey);
      setPersonData(data as Mathematician | null);
      setLoading(false);
    };

    fetchPerson();
  }, [personKey, getMathematicianById]);

  const handleClick = () => {
    if (onPersonClick) {
      if (correspondingNode) {
        onPersonClick(correspondingNode);
      } else if (personData) {
        onPersonClick({
          id: personKey,
          name: personData.name,
          val: 5,
          data: personData,
        } as GraphNode);
      }
    }
  };

  return (
    <div className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
      <h3 className="text-sm font-semibold capitalize mb-2 flex items-center gap-1">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: connectionColor || "#888" }}
        ></span>
        {connectionType === "collaborator with"
          ? "Collaborated with"
          : connectionType}
      </h3>
      <div className="flex items-center gap-2">
        {loading ? (
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
        ) : (
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={personData?.picture}
              className="object-cover w-full h-full"
            />
            <AvatarFallback>
              {getInitials(personData?.name || name)}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1">
          <p className="text-sm">{personData?.name || name}</p>
          {personData && (
            <p className="text-xs text-muted-foreground">
              {personData.born.year &&
                `${personData.born.year} - ${personData.died.year || "?"}`}
            </p>
          )}
        </div>
        {personData && onPersonClick && (
          <Button
            variant="ghost"
            size="sm"
            className={`p-0 h-6 w-6 ${correspondingNode ? "" : "text-muted-foreground"}`}
            onClick={handleClick}
            title={
              correspondingNode ? "View details" : "View details (not in graph)"
            }
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View details</span>
          </Button>
        )}
      </div>
    </div>
  );
};

const IdentityCard = ({
  mathematician,
  onClose,
  onPersonClick,
  availableNodes = [],
}: IdentityCardProps) => {
  const {
    name,
    summary,
    born,
    died,
    picture,
    lived_in,
    worked_in,
    religions,
    profession,
    institution_affiliation,
    connections,
  } = mathematician;

  const connectionTypes = connections
    ? [...new Set(connections.map((conn) => conn.connection_type))]
    : [];

  const [selectedConnectionTypes, setSelectedConnectionTypes] = useState<
    string[]
  >([]);

  const filteredConnections = connections
    ? connections
        .filter(
          (conn) =>
            selectedConnectionTypes.length === 0 ||
            selectedConnectionTypes.includes(conn.connection_type),
        )
        .sort((a, b) => a.key?.localeCompare(b.key))
    : [];

  return (
    <Card className="w-full max-w-md h-full max-h-[90vh] flex flex-col overflow-hidden">
      <div className="flex items-center p-4 shrink-0">
        <Avatar className="h-16 w-16 mr-4">
          <AvatarImage src={picture} className="object-cover w-full h-full" />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{name}</h2>
          <p className="text-sm text-muted-foreground">
            {formatYear(born.year, born.approx)} -{" "}
            {formatYear(died.year, died.approx)}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={onClose}
          className="w-12 h-12 ml-auto flex flex-col items-center justify-center"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <CardContent className="p-4 pt-0">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="flex mb-4 bg-muted/50 p-1 rounded-lg gap-2">
              <TabsTrigger
                value="summary"
                className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Summary
              </TabsTrigger>
              <TabsTrigger
                value="biography"
                className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Biography
              </TabsTrigger>
              <TabsTrigger
                value="connections"
                className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Connections
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-0">
              <div className="space-y-4">
                <div>
                  <p className="text-sm leading-relaxed">
                    {summary.split(/(_[^_]+_)/g).map((part, index) => {
                      if (part.match(/^_[^_]+_$/)) {
                        const italicText = part.slice(1, -1);
                        return <i key={index}>{italicText}</i>;
                      }
                      return part;
                    })}
                  </p>
                  <div className="mt-4">
                    <a
                      href={`https://mathshistory.st-andrews.ac.uk/Biographies/${mathematician.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      View on MacTutor
                    </a>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="biography" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Birth</h3>
                  <p className="text-sm">
                    {formatYear(born.year, born.approx)} in{" "}
                    {born.link ? (
                      <a
                        href={born.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {born.place}
                      </a>
                    ) : (
                      formatPlace(born.place)
                    )}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-1">Death</h3>
                  <p className="text-sm">
                    {formatYear(died.year, died.approx)} in{" "}
                    {died.link ? (
                      <a
                        href={died.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {died.place}
                      </a>
                    ) : (
                      formatPlace(died.place)
                    )}
                  </p>
                </div>

                <Separator />

                {lived_in && lived_in.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Lived in</h3>
                    <div className="flex flex-wrap gap-1">
                      {lived_in.map((place, i) => (
                        <span
                          key={i}
                          className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-1"
                        >
                          {place}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {worked_in && worked_in.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Worked in</h3>
                    <div className="flex flex-wrap gap-1">
                      {worked_in.map((place, i) => (
                        <span
                          key={i}
                          className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-1"
                        >
                          {place}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {religions && religions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Religion</h3>
                    <div className="flex flex-wrap gap-1">
                      {religions.map((religion, i) => (
                        <span
                          key={i}
                          className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-1"
                        >
                          {religion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profession && profession.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Profession</h3>
                    <div className="flex flex-wrap gap-1">
                      {profession.map((prof, i) => (
                        <span
                          key={i}
                          className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-1"
                        >
                          {prof}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {institution_affiliation &&
                  institution_affiliation.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-1">
                        Institutions
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {institution_affiliation.map((inst, i) => (
                          <span
                            key={i}
                            className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-1"
                          >
                            {inst}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </TabsContent>

            <TabsContent value="connections" className="mt-0">
              <div className="space-y-4">
                {connections && connections.length > 0 ? (
                  <>
                    <MultiSelectFilter
                      className="p-1"
                      value={selectedConnectionTypes}
                      options={connectionTypes}
                      onChange={setSelectedConnectionTypes}
                      placeholder="Search connection types..."
                      type="connection-type"
                      emptyMessage="No connection types found"
                      title="Filter by connection type"
                    />

                    {filteredConnections.length > 0 ? (
                      <div className="space-y-3">
                        {filteredConnections.map((connection, i) => (
                          <ConnectionPerson
                            key={i}
                            name={connection.person}
                            connectionType={connection.connection_type}
                            personKey={connection.key}
                            correspondingNode={availableNodes.find(
                              (node) => node.id === connection.key,
                            )}
                            onPersonClick={onPersonClick}
                            connectionColor={getConnectionColor(
                              connection.connection_type,
                            )}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No connections match the selected filters.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No connection data available.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default IdentityCard;

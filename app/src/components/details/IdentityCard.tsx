import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mathematician } from "@/types";
import { useState } from "react";
import MultiSelectFilter from "@/components/filters/MultiSelectFilter";

interface IdentityCardProps {
  mathematician: Mathematician | null;
  onClose: () => void;
}

const IdentityCard = ({ mathematician, onClose }: IdentityCardProps) => {
  if (!mathematician) return null;

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
    ? connections.filter(
        (conn) =>
          selectedConnectionTypes.length === 0 ||
          selectedConnectionTypes.includes(conn.connection_type),
      )
    : [];

  const formatYear = (year: number | null, approx: boolean) => {
    if (year === null) return "Unknown";
    return `${approx ? "c. " : ""}${year}`;
  };

  const formatPlace = (place: string, link?: string) => {
    if (!place) return "Unknown";
    if (link)
      return (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {place}
        </a>
      );
    return place;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatSummaryText = (text: string) => {
    if (!text) return "";

    const parts = text.split(/(_[^_]+_)/g);

    return parts.map((part, index) => {
      if (part.match(/^_[^_]+_$/)) {
        const italicText = part.slice(1, -1);
        return <i key={index}>{italicText}</i>;
      }
      return part;
    });
  };

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
              <TabsTrigger value="summary" className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Summary
              </TabsTrigger>
              <TabsTrigger value="biography" className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Biography
              </TabsTrigger>
              <TabsTrigger value="connections" className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Connections
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-0">
              <div className="space-y-4">
                <div>
                  <p className="text-sm leading-relaxed">
                    {formatSummaryText(summary)}
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
                    {formatPlace(born.place, born.link)}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-1">Death</h3>
                  <p className="text-sm">
                    {formatYear(died.year, died.approx)} in{" "}
                    {formatPlace(died.place, died.link)}
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
                      filteredConnections.map((connection, i) => (
                        <div key={i} className="border rounded-md p-3">
                          <h3 className="text-sm font-semibold capitalize">
                            {connection.connection_type}
                          </h3>
                          <p className="text-sm">{connection.person}</p>
                        </div>
                      ))
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

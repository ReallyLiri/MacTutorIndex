import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GraphLink, Mathematician } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConnectionDetailsProps {
  link: GraphLink | null;
  mathematicians: Record<string, Mathematician>;
  onClose: () => void;
}

const ConnectionDetails = ({
  link,
  mathematicians,
  onClose,
}: ConnectionDetailsProps) => {
  if (!link) return null;

  const sourceId = link.source;
  const targetId = link.target;

  const sourceMathematician = mathematicians[sourceId];
  const targetMathematician = mathematicians[targetId];

  if (!sourceMathematician || !targetMathematician) return null;

  const createCitationUrl = (name: string, text: string) => {
    const baseUrl = "https://mathshistory.st-andrews.ac.uk/Biographies/";
    const formattedName = name.split(" ").pop();
    return `${baseUrl}${formattedName}/#:~:text=${encodeURIComponent(text)}`;
  };

  const getConnectionExcerpts = () => {
    const sourceExcerpts: string[] = [];
    const targetExcerpts: string[] = [];

    const sourceSummary = sourceMathematician.summary || "";
    const targetSummary = targetMathematician.summary || "";

    const sourceSentences = sourceSummary.match(/[^.!?]+[.!?]+/g) || [];
    const targetSentences = targetSummary.match(/[^.!?]+[.!?]+/g) || [];
    sourceSentences.forEach((sentence) => {
      if (sentence.includes(targetMathematician.name)) {
        sourceExcerpts.push(sentence.trim());
      }
    });

    targetSentences.forEach((sentence) => {
      if (sentence.includes(sourceMathematician.name)) {
        targetExcerpts.push(sentence.trim());
      }
    });

    return { sourceExcerpts, targetExcerpts };
  };

  const { sourceExcerpts, targetExcerpts } = getConnectionExcerpts();

  return (
    <Card className="max-w-md">
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl">Connection Details</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center px-2">
              <h3 className="font-semibold">{sourceMathematician.name}</h3>
            </div>
            <div className="text-sm px-4 py-1 bg-secondary rounded-full">
              {link.type}
            </div>
            <div className="flex-1 text-center px-2">
              <h3 className="font-semibold">{targetMathematician.name}</h3>
            </div>
          </div>

          {sourceExcerpts.length > 0 && (
            <div className="border-l-2 border-primary pl-4 py-2">
              <h4 className="text-sm font-semibold mb-2">
                From {sourceMathematician.name}'s biography:
              </h4>
              {sourceExcerpts.map((excerpt, i) => (
                <div key={`source-${i}`} className="mb-2">
                  <p className="text-sm">{excerpt}</p>
                  <a
                    href={createCitationUrl(
                      sourceMathematician.name,
                      excerpt.substring(0, 30),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    View in MacTutor
                  </a>
                </div>
              ))}
            </div>
          )}

          {targetExcerpts.length > 0 && (
            <div className="border-l-2 border-secondary pl-4 py-2">
              <h4 className="text-sm font-semibold mb-2">
                From {targetMathematician.name}'s biography:
              </h4>
              {targetExcerpts.map((excerpt, i) => (
                <div key={`target-${i}`} className="mb-2">
                  <p className="text-sm">{excerpt}</p>
                  <a
                    href={createCitationUrl(
                      targetMathematician.name,
                      excerpt.substring(0, 30),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    View in MacTutor
                  </a>
                </div>
              ))}
            </div>
          )}

          {sourceExcerpts.length === 0 && targetExcerpts.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <p>
                No detailed information about this connection is available in
                the biographies.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionDetails;

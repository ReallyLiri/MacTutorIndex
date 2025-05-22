import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GraphLink, Mathematician } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createCitationUrl, getInitials } from "@/lib/personUtils";

interface ConnectionDetailsProps {
  link: GraphLink | null;
  mathematicians: Record<string, Mathematician>;
  onClose: () => void;
  onPersonClick?: (id: string) => void;
}

const ConnectionDetails = ({
  link,
  mathematicians,
  onClose,
  onPersonClick,
}: ConnectionDetailsProps) => {
  if (!link) return null;

  const sourceId = link.source;
  const targetId = link.target;

  const sourceMathematician = mathematicians[sourceId];
  const targetMathematician = mathematicians[targetId];

  if (!sourceMathematician || !targetMathematician) return null;

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
        <Button
          variant="ghost"
          onClick={onClose}
          className="w-12 h-12 ml-auto flex flex-col items-center justify-center"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 flex flex-col items-center px-2">
              <Avatar className="h-16 w-16 mb-2">
                <AvatarImage
                  src={sourceMathematician.picture}
                  className="object-cover w-full h-full"
                />
                <AvatarFallback>
                  {getInitials(sourceMathematician.name)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-center">
                {sourceMathematician.name}
              </h3>
              {onPersonClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1"
                  onClick={() => onPersonClick(sourceId)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}
            </div>

            <div className="text-sm px-4 py-1 bg-secondary rounded-full self-start mt-8">
              {link.type}
            </div>

            <div className="flex-1 flex flex-col items-center px-2">
              <Avatar className="h-16 w-16 mb-2">
                <AvatarImage
                  src={targetMathematician.picture}
                  className="object-cover w-full h-full"
                />
                <AvatarFallback>
                  {getInitials(targetMathematician.name)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-center">
                {targetMathematician.name}
              </h3>
              {onPersonClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1"
                  onClick={() => onPersonClick(targetId)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionDetails;

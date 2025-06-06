import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ExternalLinkIcon } from "@radix-ui/react-icons";

const Header = () => {
  return (
    <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-40">
      <div className="container px-6 h-16 flex items-center justify-between w-fit gap-8">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">MacTutor Index Graph</h1>
        </div>
        <Separator orientation="vertical" className="h-8" />
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost">About</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>About MacTutor Index Graph</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              This web application offers a visual exploration of
              mathematicians’ lives and networks across history. It is built on
              data from the MacTutor Index, an online resource which contains
              biographies of over 3,000 mathematicians. The project uses an LLM
              to extract essential details from each biography and map the
              connections between individuals as an interactive graph. This
              project is still in its early stages and the LLM output has not
              yet been fully verified and refined. Copyright attribution: The
              data is based on the{" "}
              <a
                href="https://mathshistory.st-andrews.ac.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                MacTutor Index
              </a>{" "}
              and is licensed under{" "}
              <a
                href="http://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                CC BY-SA 4.0
              </a>
              .
            </div>
            <div className="text-sm">
              A data visualization project by Mia Joskowicz and Liri Sokol, 2025
            </div>
          </DialogContent>
        </Dialog>
        <Button variant="ghost">
          <a
            className="mr-2"
            href="https://elements-resource-box.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Euclid's Elements: A Resource Box
          </a>
          <ExternalLinkIcon />
        </Button>
      </div>
    </header>
  );
};

export default Header;

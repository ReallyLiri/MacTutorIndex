import { ConstructionIcon, XIcon } from "lucide-react";
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
      <div className="container px-6 h-18 flex items-center justify-between w-fit gap-8">
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
              <DialogTitle className="flex items-center justify-between">
                About MacTutor Index Graph
                <DialogTrigger asChild>
                  <Button variant="ghost">
                    <XIcon />
                  </Button>
                </DialogTrigger>
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              This web application offers a visual exploration of
              mathematicians’ lives and networks across history. It is built on
              data from the MacTutor Index, an online resource which contains
              biographies of over 3,000 mathematicians. The project uses an LLM
              to extract essential details from each biography and map the
              connections between individuals as an interactive graph.
              <div className="flex items-center gap-2 my-4">
                <ConstructionIcon className="w-12 h-12 cursor-pointer text-orange-300" />
                <span className=" text-gray-300">
                  This project is still in its early stages and the LLM output
                  has not yet been fully verified and refined.
                </span>
              </div>
              <div className="text-sm text-gray-300">
                The data is based on the{" "}
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
                . The project is created and maintained by Mia Joskowicz and
                Liri Sokol, 2025.
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Separator orientation="vertical" className="h-8" />
        <ConstructionIcon className="w-8 h-8 cursor-pointer text-orange-300 -mr-4" />
        <span className=" text-gray-300">
          This project is still in its early stages and
          <br />
          the LLM output has not yet been fully verified and refined.
        </span>
      </div>
    </header>
  );
};

export default Header;

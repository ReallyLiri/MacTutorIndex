import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">About Math Historian</CardTitle>
          <CardDescription>
            Exploring the connections between mathematicians throughout history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">About the Project</h2>
            <p>
              Math Historian is an interactive visualization tool that helps explore the relationships between mathematicians throughout history. This project aims to highlight the interconnected nature of mathematical discovery and the personal and professional networks that have shaped the field.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Data Sources</h2>
            <p>
              The data for this project is sourced from MacTutor History of Mathematics Archive, a comprehensive resource maintained by the University of St Andrews, Scotland. Additional biographical information comes from various academic sources and historical records.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">How to Use</h2>
            <p className="mb-4">
              The interactive graph on the home page represents mathematicians as nodes and their relationships as connecting lines. You can interact with the graph in the following ways:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Click and drag to move the graph</li>
              <li>Scroll to zoom in and out</li>
              <li>Click on a node to view detailed information about a mathematician</li>
              <li>Click on a connecting line to view details about the relationship between two mathematicians</li>
              <li>Use the filters panel to focus on specific time periods, locations, or other attributes</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Types of Connections</h2>
            <p className="mb-4">
              The relationships between mathematicians are classified into several types:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-medium">Influenced by</span>: Indicates intellectual influence without direct contact</li>
              <li><span className="font-medium">Collaborator with</span>: Direct research collaboration or joint publication</li>
              <li><span className="font-medium">Teacher of</span>: Formal educational relationship where one mathematician taught another</li>
              <li><span className="font-medium">Student of</span>: Formal educational relationship where one mathematician studied under another</li>
              <li><span className="font-medium">Correspondent with</span>: Maintained significant scholarly correspondence</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Feedback and Contributions</h2>
            <p>
              This is an ongoing project, and we welcome feedback and contributions. If you notice any inaccuracies in the data or have suggestions for improvements, please contact us.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;
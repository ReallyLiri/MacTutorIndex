# 🧠 AI Agent Prompt: Build a Math Historian Graph Webapp

Create a new web app in a new directory named "app". Put everything related to the web app in there (package.json etc).

## 🛠 Tech Stack

Use the following tools and frameworks:
- **Yarn** (package management)
- **TypeScript** (language)
- **Vite** (bundler)
- **React** (UI framework)
- **React Router DOM** (routing)
- **Tailwind CSS** (utility-first styling)
- **ShadCN UI** (component library)
Do not use Zod.

---

## 🎯 Objective

Develop a **graph-based web application** that visualizes the relationships between mathematicians. Data is stored in **Firestore** in the collection named `"l2"`. Firestore credentials will be added later — use placeholders for now.

---

## 🗃 Data Schema

Each document in the `"l2"` Firestore collection follows this structure, you can see examples in store/json/l2 dir.

```ts
type Mathematician = {
  id: string; // unique ID
  name: string;
  summary: string;
  born: {
    year: number | null;
    approx: boolean;
    place: string;
    link?: string;
  };
  died: {
    year: number | null;
    approx: boolean;
    place: string;
    link?: string;
  };
  picture?: string;
  connections: {
    person: string; // ID or name of the other mathematician
    connection_type: string; // e.g. "influenced by", "collaborator with"
  }[];
  lived_in: string[];
  worked_in: string[];
  religions: string[];
  profession: string[];
  institution_affiliation: string[];
}
```

## 🔍 Key Features

### 1. Graph View

- The homepage shows a **force-directed graph**:
  - **Nodes** represent mathematicians.
  - **Edges** represent relationships from the `connections[]` field.
- The graph should be **readable**, **interactive**, and **aesthetically clear** with good label handling.

### 2. Filters

- Include controls for filtering by:
  - Year range
  - City / Region
  - Religion
  - Institution
  - Specific mathematicians
- Filters should update the graph live.

### 3. Identity Card

- Clicking a node opens a panel showing:
  - Name, image, birth/death info
  - Summary
  - All other biographical data (places, religion, affiliations, etc.)

### 4. Connection Details

- Clicking an edge displays:
  - All sentences from the biographies that describe the connection.
  - Hyperlinked citations to MaxTutor biographies:
    - e.g. `https://mathshistory.st-andrews.ac.uk/Biographies/Newton/#:~:text=Newton%20studied%20the%20philosophy%20of%20Descartes`

### 5. UI/UX Requirements

- Use Tailwind CSS for responsive design.
- Use ShadCN components where possible.
- Prioritize clarity, usability, and accessibility (ARIA roles, keyboard nav).

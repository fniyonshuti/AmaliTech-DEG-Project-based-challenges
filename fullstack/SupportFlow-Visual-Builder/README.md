# SupportFlow Visual Builder

SupportFlow Visual Builder is a visual decision-tree editor for customer support chat flows. It replaces spreadsheet-based flow management with an interactive graph editor and a built-in preview runner.

Live Demo: [https://suportflow.netlify.app/](https://suportflow.netlify.app/)  
project Repository: [SupportFlow-Visual-Builder](https://github.com/fniyonshuti/AmaliTech-DEG-Project-based-challenges/tree/main/fullstack/SupportFlow-Visual-Builder)

## Project Context

SupportFlow AI needed a clearer way for non-technical teams to configure support bots. The previous spreadsheet process was hard to visualize and error-prone. This project solves that by showing the full conversation flow as connected nodes that can be edited and tested instantly.

## Implemented Requirements

### Story 1: Visual Graph

- Renders nodes from flow_data.json
- Positions nodes by x/y coordinates from data
- Draws parent-child connectors with SVG

### Story 2: Interactive Editor

- Click node to open editing modal
- Update question text with immediate canvas refresh
- In-memory state updates (no database required)
- Drag and reposition nodes on canvas

### Story 3: Preview Mode

- Toggle between Editor and Preview
- Start from the start node
- Traverse flow by selecting options
- Show restart option at end-of-flow nodes
- Support back navigation while previewing

## Wildcard Feature (Innovation)

### Responsive + Touch-Optimized Editing

Chosen feature: full responsive behavior with touch-friendly dragging.

Why this feature:

- Support managers can review and edit flows on laptop, tablet, and phone
- Improves adoption for teams working outside desktop-only setups

Value delivered:

- Breakpoints for desktop/tablet/mobile layouts
- Touch + mouse drag handling for node movement
- Adaptive controls and spacing for smaller screens

## Technical Constraints Compliance

- Data source: uses flow_data.json
- Tech stack: Vanilla JavaScript (ES modules), HTML, CSS
- No restricted UI libraries (Bootstrap, Material UI, Chakra UI)
- No graph helper libraries (react-flow, jsPlumb, mermaid)
- Connectors and node rendering are custom-built

## Tech Stack

- JavaScript (ES6 modules)
- HTML5
- CSS3 (custom properties + responsive media queries)
- SVG for graph connectors
- Netlify for deployment

## Current Project Structure

```text
SupportFlow-Visual-Builder/
|- index.html
|- flow_data.json
|- netlify.toml
|- LICENSE
|- README.md
`- src/
   |- main.js
   |- flowBuilder.js
   `- styles.css
```

## Quick Start

1. Clone the repository.
2. Open the project folder.
3. Optional: run directly with index.html (quick check):

```bash
start index.html
```

4. Run a local static server (recommended):

```bash
python -m http.server 8000
```

5. Open [http://localhost:8000](http://localhost:8000).

6. Optional: open directly in Google Chrome (Windows):

```bash
start chrome http://localhost:8000
```

## How To Use

1. Open the app and view the flow canvas.
2. Click a node to edit its text.
3. Drag nodes to adjust layout.
4. Click Preview to test conversation paths.
5. Use Back or Restart while testing.

## Design System

- Theme: dark neon visual style
- Core tokens: color, spacing, radius, shadow, typography
- Components: canvas, node cards, connectors, modal, controls

Design file link: [figma design file](https://www.figma.com/design/KlUEq7Njwii74hg83sxty1/visual-supportflow-sytem?node-id=0-1&t=jvRxKIrKKV7ZhVrc-1).

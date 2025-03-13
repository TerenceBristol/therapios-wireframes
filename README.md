# Therapios Wireframes

A simple wireframing tool for creating and demonstrating feature mockups. This tool allows you to quickly build wireframes for client presentations without needing to publish them online.

## Purpose

This project serves as a simple wireframing tool that allows you to:

- Create basic wireframes for proposed features
- Run the application locally (not published online)
- Screen record the wireframes to share with clients
- Demonstrate how features work conceptually

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone this repository
2. Install dependencies:

```bash
cd therapios-wireframes
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the wireframing tool.

## Project Structure

- `src/components/`: Reusable wireframe components
- `src/app/wireframes/`: Individual wireframe examples
- `src/app/`: Main application code

## Available Components

The project includes several pre-built wireframe components:

- `WireframeLayout`: Page layout with optional sidebar
- `WireframeBox`: Simple content box with label
- `WireframeImage`: Image placeholder
- `WireframeFormControl`: Various form controls (text, select, checkbox, etc.)
- `WireframeButton`: Button component with different variants

## Creating New Wireframes

To create a new wireframe:

1. Create a new directory under `src/app/wireframes/` with a descriptive name
2. Create a `page.tsx` file in the new directory
3. Use the existing wireframe components to build your mockup
4. Add your new wireframe to the list in `src/app/wireframes/page.tsx`

## Usage Tips

- Use screen recording software to capture wireframe demonstrations
- Focus on functionality rather than aesthetics
- Use annotations and comments to explain features
- Add simple interactions to demonstrate user flows

## License

MIT

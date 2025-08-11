# `flow2code`

## Visual Software Code Generating Tool

`flow2code` is an ambitious and intuitive visual application that allows developers and architects to design software systems using a drag-and-drop interface. By connecting nodes that represent services, databases, and front-end components, users can define a complete system architecture. The application then leverages a generative AI model to automatically produce a runnable, production-quality codebase, complete with all necessary configurations and a `docker-compose` file for easy deployment.

This monorepo contains both the front-end client and the back-end server, which are designed to work together to provide a seamless development experience.

## Features

  - **Drag-and-Drop Canvas:** Visually design your system architecture using an interactive and user-friendly canvas.
  - **Node Library:** A comprehensive library of pre-defined nodes for common technologies, including various front-end frameworks, back-end APIs, databases, and messaging systems.
  - **Microservices & Monolithic Support:** Choose between a microservices or a monolithic architecture type for your project.
  - **Dynamic Properties Panel:** Configure the details of individual nodes and edges (connections) in real-time, such as service names, connection types (REST, gRPC, DB), and path styles.
  - **Subflow Management:** Group related services into a single node to manage complexity and create nested architectures.
  - **AI-Powered Code Generation:** Generate a complete, production-ready codebase based on the visual diagram. The AI handles boilerplate, configurations, and interconnectivity between services.
  - **Offline-First Persistence:** Projects are automatically saved to your browser's local storage using Dexie.js (IndexedDB), ensuring your work is never lost and is accessible offline.
  - **Zip Export:** The generated code is bundled into a single `.zip` file for easy download and project setup.

## Technologies

### Client (Frontend)

The client is a React application built with Vite and TypeScript, providing a responsive and modern user interface.

  - **ReactFlow:** For the interactive, node-based canvas.
  - **Zustand:** A lightweight state management library for managing application state.
  - **Dexie.js:** A wrapper for IndexedDB to handle local project persistence.
  - **Tailwind CSS:** For streamlined and rapid UI development.
  - **Vite:** A fast and modern build tool.

### Server (Backend)

The server is a Node.js and Express application responsible for communicating with the generative AI model and packaging the generated code.

  - **Express.js:** A robust and flexible web framework for the API.
  - **Google Generative AI SDK:** Interfaces with the Gemini model to generate the codebase.
  - **Archiver:** Used to compress the generated files into a `.zip` file for the client to download.
  - **TypeScript:** Ensures a type-safe and scalable back-end implementation.

## Getting Started

### Prerequisites

  - [Node.js](https://nodejs.org/) (v18 or higher)
  - [pnpm](https://pnpm.io/installation) (recommended package manager)
  - A Google Gemini API key

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/flow2code.git
    cd flow2code
    ```

2.  Install dependencies for both the client and server using the monorepo's `pnpm` workspace configuration:

    ```bash
    pnpm install
    ```

### Configuration

Create a `.env` file in the `server` directory and add your Google Gemini API key.

```
# server/.env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### Running the Application

`flow2code` is designed to be run with the front-end and back-end working together.

1.  In one terminal, start the back-end server:

    ```bash
    pnpm --filter server dev
    ```

2.  In a second terminal, start the front-end client:

    ```bash
    pnpm --filter client dev
    ```

The application will be accessible at `http://localhost:5173`.

### Screenshot 

<img width="1919" height="907" alt="image" src="https://github.com/user-attachments/assets/67ea7fff-20d2-4263-a554-55e330a80a72" />
<img width="1919" height="912" alt="image" src="https://github.com/user-attachments/assets/6b7dce4a-5860-493a-9657-f33d919070c0" />

## Usage

1.  **Create a Project:** Upon first launch, you will be prompted to create a new project. Give it a name and select an architecture type (Microservices or Monolithic).
2.  **Design Your System:** Drag and drop nodes from the **Node Library** on the left onto the canvas. Connect them by dragging from the source handle to the target handle.
3.  **Configure Components:** Select a node or edge to open the **Properties Panel** on the right. Here you can change names, connection types, and add custom requirements for the AI.
4.  **Generate Code:** Once your diagram is complete, click the **Generate Code** button in the header. The AI will analyze your design and provide a downloadable `.zip` file of the complete project.


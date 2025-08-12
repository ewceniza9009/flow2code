import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function buildPrompt(project: any): string {
    const { name, type, nodes, edges } = project;

    const nodeDetails = nodes.map((node: any) => ({
      ...node,
      config: node.config || {}, // Add config field if present
    }));
    
    const edgeDetails = edges.map((edge: any) => ({
      ...edge,
      data: edge.data || {}, // Add data field if present
    }));

    const systemDesign = `
      Project Name: ${name}
      Architecture Type: ${type}

      Nodes (Services/Components):
      ${JSON.stringify(nodeDetails, null, 2)}

      Edges (Connections):
      ${JSON.stringify(edgeDetails, null, 2)}
    `;

    return `
    You are Flow2Code, an expert software architect and full-stack developer AI.
    Your task is to generate a complete, runnable, and production-quality codebase based on a provided system design.

    **System Design:**
    ${systemDesign}

    **Instructions:**
    1.  **Analyze the System Design:** Carefully examine the nodes (services, frontends, databases) and edges (API calls, data flows) to understand the architecture. Pay close attention to the 'config' and 'data' fields for specific implementation details.
    2.  **Generate a File Structure:** Create a logical directory and file structure for the entire project. For a 'Microservices' architecture, create a separate directory for each service. For a 'Monolithic' architecture, create a single, well-structured codebase.
    3.  **Write Complete Code:** For each file, write the full source code. Do NOT use placeholders, stubs, or "your code here" comments. The code must be functional.
    4.  **Include Configuration:** Generate all necessary configuration files, such as \`package.json\`, \`Dockerfile\`, \`tsconfig.json\`, \`.gitignore\`, and environment variable example files (\`.env.example\`).
    5.  **Add DevOps Files:** Create a root \`docker-compose.yml\` file to orchestrate all services. Ensure ports are mapped correctly and services can communicate. Include a helpful \`README.md\` at the root.
    6.  **Adhere to Best Practices:** Use modern syntax, industry best practices, and appropriate design patterns for the specified tech stacks.
    7.  **Output Format:** The final output MUST be a single, valid JSON object. The keys of this object must be the full file paths (e.g., "task-manager-api/src/app.js"), and the values must be the complete file content as a single string.

    **Example Output Structure:**
    {
      "my-project/README.md": "# My Project...",
      "my-project/docker-compose.yml": "version: '3.8'...",
      "my-project/frontend/package.json": "{ \\"name\\": \\"frontend\\" ... }",
      "my-project/frontend/src/App.js": "import React from 'react'; ..."
    }

    Now, generate the complete codebase for the provided system design.
    `;
}

function buildSuggestionPrompt(project: any): string {
    const { name, type, nodes, edges } = project;

    const nodeDetails = nodes.map((node: any) => ({
      ...node,
      config: node.config || {},
    }));
    
    const edgeDetails = edges.map((edge: any) => ({
      ...edge,
      data: edge.data || {},
    }));

    const systemDesign = `
      Project Name: ${name}
      Architecture Type: ${type}

      Nodes (Services/Components):
      ${JSON.stringify(nodeDetails, null, 2)}

      Edges (Connections):
      ${JSON.stringify(edgeDetails, null, 2)}
    `;

    return `
    You are an AI architectural assistant. Your task is to analyze a provided system design and offer constructive, actionable suggestions to improve it.

    **System Design:**
    ${systemDesign}

    **Instructions:**
    1.  **Analyze the Diagram:** Review the nodes, edges, and their configurations to identify potential architectural issues.
    2.  **Provide Suggestions:** Generate suggestions categorized by 'architectural', 'node', or 'edge'.
    3.  **Focus on Improvements:** Suggestions should cover best practices such as:
        -   Better separation of concerns.
        -   Optimized communication patterns (e.g., suggesting gRPC for internal services).
        -   Missing components (e.g., a message queue for a microservice that should be event-driven).
        -   Potential scalability or security improvements.
    4.  **Output Format:** The output MUST be a single, valid JSON array of objects. Each object should have the following structure:
        -   **id:** A unique string identifier.
        -   **type:** 'architectural', 'node', or 'edge'.
        -   **title:** A concise title for the suggestion.
        -   **description:** A detailed explanation of the suggestion and its benefits.
        -   **actions:** An array of objects describing how to implement the suggestion. Each action should have a 'label', an 'action' type ('add', 'remove', 'update'), and a 'payload' with the necessary data to perform the action.

    **Example Output Structure:**
    [
      {
        "id": "suggestion-1",
        "type": "architectural",
        "title": "Introduce a Message Queue",
        "description": "For a microservices architecture, using a message queue like RabbitMQ between the 'frontend' and 'notification-service' will decouple them and improve resilience. We suggest replacing the direct REST call with a message-based communication.",
        "actions": [
          {
            "label": "Change Edge Type to RabbitMQ",
            "action": "update",
            "payload": { "edgeId": "edge-123", "label": "RabbitMQ" }
          },
          {
            "label": "Add RabbitMQ Node",
            "action": "add",
            "payload": { "type": "msg-rabbitmq", "name": "RabbitMQ Broker" }
          }
        ]
      },
      {
        "id": "suggestion-2",
        "type": "node",
        "title": "Set database credentials as environment variables",
        "description": "It's a security best practice to manage sensitive data like database credentials via environment variables instead of hardcoding them in the source code.",
        "actions": [
          {
            "label": "Add .env.example for PostgreSQL node",
            "action": "update",
            "payload": { "nodeId": "node-456", "requirements": "Use environment variables for database connection string." }
          }
        ]
      }
    ]

    Now, generate suggestions for the provided system design.
    `;
}


export const generateCodeFromDiagram = async (project: any): Promise<Record<string, string>> => {
    const prompt = buildPrompt(project);
    
    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Clean the response to ensure it's valid JSON
        const jsonString = text.trim().replace(/^```json\n/, '').replace(/\n```$/, '');
        
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error calling Generative AI API:", error);
        throw new Error("Failed to generate code from AI service.");
    }
};

export const generateSuggestionsFromDiagram = async (project: any): Promise<any[]> => {
    const prompt = buildSuggestionPrompt(project);
    
    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Clean the response to ensure it's valid JSON
        const jsonString = text.trim().replace(/^```json\n/, '').replace(/\n```$/, '');
        
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error calling Generative AI API for suggestions:", error);
        throw new Error("Failed to generate suggestions from AI service.");
    }
};
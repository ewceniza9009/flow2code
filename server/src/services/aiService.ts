import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function buildPrompt(project: any): string {
    const { name, type, nodes, edges } = project;

    const systemDesign = `
      Project Name: ${name}
      Architecture Type: ${type}

      Nodes (Services/Components):
      ${JSON.stringify(nodes, null, 2)}

      Edges (Connections):
      ${JSON.stringify(edges, null, 2)}
    `;

    return `
    You are Flow2Code, an expert software architect and full-stack developer AI.
    Your task is to generate a complete, runnable, and production-quality codebase based on a provided system design.

    **System Design:**
    ${systemDesign}

    **Instructions:**
    1.  **Analyze the System Design:** Carefully examine the nodes (services, frontends, databases) and edges (API calls, data flows) to understand the architecture.
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
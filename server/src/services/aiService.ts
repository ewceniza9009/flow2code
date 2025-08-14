import { GoogleGenerativeAI } from "@google/generative-ai";
import { NODE_DEFINITIONS, NodeCategory, NodeDefinition } from '@flow2code/shared';

const apiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: geminiModel!.toString() });

function extractJsonFromString(text: string): any {
    const firstBracket = text.indexOf('{');
    const firstSquareBracket = text.indexOf('[');
    
    let startIndex = -1;
    
    if (firstBracket === -1 && firstSquareBracket === -1) {
        throw new Error("No JSON object or array found in the AI response.");
    }

    if (firstBracket === -1) {
        startIndex = firstSquareBracket;
    } else if (firstSquareBracket === -1) {
        startIndex = firstBracket;
    } else {
        startIndex = Math.min(firstBracket, firstSquareBracket);
    }

    const lastBracket = text.lastIndexOf('}');
    const lastSquareBracket = text.lastIndexOf(']');

    if (lastBracket === -1 && lastSquareBracket === -1) {
        throw new Error("JSON object or array is not properly closed in the AI response.");
    }
    
    const endIndex = Math.max(lastBracket, lastSquareBracket);

    const jsonString = text.substring(startIndex, endIndex + 1);
    
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse extracted JSON string:", jsonString);
        throw new Error("Could not parse the JSON extracted from the AI response.");
    }
}

function getGenerationTypeInstructions(type: string): string {
    switch (type) {
        case 'Starter':
            return `
        **Primary Goal: Generate a Starter Project.**
        This is for developers who need a kickstart. The focus is on structure, not function.
        
        **Deliverables:**
        - A complete directory structure for all services.
        - All necessary configuration files: \`package.json\`, \`tsconfig.json\`, \`.env.example\`, \`Dockerfile\`, \`docker-compose.yml\`.
        - Code files with empty or placeholder function/class definitions. For example, a controller method should just be \`res.send('TODO: Implement');\` or have a comment.
        - All wiring (imports, module registrations) should be in place.

        **Non-Deliverables:**
        - No business logic implementation.
        - No unit or integration tests.
        - No data validation or complex error handling.
      `;
        case 'Flexible':
            return `
        **Primary Goal: Generate a Flexible Project.**
        This is the middle ground, creating a fully functional but easily extensible codebase.
        
        **Deliverables:**
        - A fully working, runnable application based on the requirements.
        - Modular code with a clear separation of concerns (e.g., controllers, services, repositories).
        - Explicit hooks and comments (e.g., \`// HINT: Add your custom business logic here\`) in places where a developer is likely to extend the code.
        - Data Transfer Objects (DTOs) for API contracts.
        - Basic error handling middleware and validation.

        **Non-Deliverables:**
        - Exhaustive test suites (a few example tests are acceptable).
        - Highly optimized, production-hardened code.
      `;
        case 'Complete':
            return `
        **Primary Goal: Generate a Complete Project.**
        This delivers a production-ready and highly refined codebase. Assume the requirements are final.
        
        **Deliverables:**
        - A minimal yet powerful codebase that is ready for deployment.
        - Robust error handling, data validation (e.g., using zod, joi, or data annotations), and logging.
        - A comprehensive suite of automated tests (unit and integration) for core functionality, covering both success and failure cases.
        - Adherence to the YAGNI ("You Ain't Gonna Need It") principle; no unnecessary code.
        - Clean, self-documenting code that follows industry best practices.
      `;
        case 'Test-Driven':
            return `
        **Primary Goal: Generate a Test-Driven Project.**
        Adopt a strict Test-Driven Development (TDD) workflow. The tests are the specification.
        
        **Deliverables (in this order of thinking):**
        1.  **Tests First:** A comprehensive suite of initially failing tests (unit, integration) that fully cover the requirements for every component and endpoint.
        2.  **Minimal Code:** The simplest, cleanest implementation code required to make all the generated tests pass.
        - The final output must contain both the complete test files and the implementation files.

        **Non-Deliverables:**
        - Any code that is not explicitly required to make a test pass.
      `;
        default:
            return getGenerationTypeInstructions('Flexible');
    }
}

function formatSystemDesign(nodes: any[], indent = ' '): string {
  let designString = '';
  nodes.forEach(node => {
    designString += `${indent}- Node: ${node.name} (ID: ${node.id}, Type: ${node.type}, Category: ${node.role})\n`;
    if (node.techStack) {
      designString += `${indent}  - Tech Stack: ${node.techStack.join(', ')}\n`;
    }
    if (node.config) {
      designString += `${indent}  - Config: ${JSON.stringify(node.config)}\n`;
    }
    if (node.requirements) {
      designString += `${indent}  - Requirements: ${node.requirements}\n`;
    }
    if (node.text) {
      designString += `${indent}  - Text/Label: ${node.text}\n`;
    }

    if (node.subflow && node.subflow.nodes.length > 0) {
      designString += `${indent}  - Internal Sub-Flow:\n`;
      designString += formatSystemDesign(node.subflow.nodes, indent + '    ');
      if(node.subflow.edges.length > 0) {
        designString += `${indent}    - Sub-Flow Edges:\n${indent}      ${JSON.stringify(node.subflow.edges)}\n`;
      }
    }
  });
  return designString;
}

function buildPrompt(project: any): string {
    const { name, type, nodes, edges, settings, codeGenerationType } = project;

    const systemDesign = `
      Project Name: ${name}
      Architecture Type: ${type}
      Settings: ${JSON.stringify(settings, null, 2)}
      
      High-Level Components (Nodes):
${formatSystemDesign(nodes)}

      High-Level Connections (Edges):
      ${JSON.stringify(edges, null, 2)}
    `;

    const generationInstructions = getGenerationTypeInstructions(codeGenerationType);

    return `
    You are Flow2Code, an expert-level AI software architect and full-stack developer. Your purpose is to translate a visual system design into a complete, high-quality, runnable codebase.

    **Your Guiding Philosophy:**
    - **Developer Experience is Key:** The generated code should be easy to understand, run, and extend.
    - **Code is for Humans First:** Prioritize clarity, simplicity, and maintainability.
    - **Pragmatism over Dogma:** Choose the right tools and patterns for the job as described in the requirements, not just what's popular.

    **Your Task:**
    Generate a complete codebase based on the provided system design. Your primary directive is to adhere to the **Generation Type** specified below.

    ---
    ### System Design to Implement
    ${systemDesign}
    ---
    ### Primary Directive: Generation Type
    ${generationInstructions}
    ---
    ### How to Interpret the System Design

    1.  **Nodes are Your Components:**
        - The \`requirements\` field for each node is the **source of truth** for its specific functionality.
        - **Sub-Flow Interpretation is CRUCIAL:**
          - If a node contains an 'Internal Sub-Flow' with **technological nodes** (e.g., Backend, Frontend), treat them as modules within the parent service.
          - If a sub-flow contains **'Logic & Flow' nodes**, you MUST interpret this as a business logic flowchart. The sequence of these nodes defines the exact steps, conditions, and loops the code must implement. The \`Text/Label\` on each node is the instruction for that step.

    2.  **'Logic & Flow' Node Meanings:**
        - **Process**: A standard operation or function call.
        - **Decision**: An if/else conditional block. The text inside is the condition to evaluate.
        - **Input/Output**: Receiving data from a source or sending it to a destination.
        - **Subroutine**: A call to another function or module, likely defined elsewhere.
        - **Document**: Generating a file, a PDF, a report, or some form of printed/saved output.
        - **Data Storage**: A direct interaction with a database or persistent storage (e.g., a CRUD operation).
        - **Delay**: A pause in execution (e.g., in Javascript, \`await new Promise(res => setTimeout(res, ...))\`).
        - **Display**: Outputting information to a user interface or logging to the console.
        - **Merge**: The point where two or more parallel logic paths converge.

    3.  **Edges are the Interactions:**
        - An edge defines a dependency or sequence. This applies at both high-level and within sub-flows.
        - For a 'REST' edge, Service A must contain an HTTP client to call an endpoint you create in Service B.

    4.  **Project Settings Guide the Infrastructure:**
        - The project's \`deploymentStrategy\` must influence infrastructure files like \`Dockerfile\` and \`docker-compose.yml\`.

    **Final Output Format:**
    - The entire output MUST be a single, valid JSON object.
    - The keys are full file paths (e.g., "user-service/src/index.ts").
    - The values are strings containing the complete, exact content for each file.

    Now, begin. Analyze the system design and generate the complete JSON output.
    `;
}

function buildSuggestionPrompt(project: any): string {
    const validNodeTypes = NODE_DEFINITIONS.flatMap((category: NodeCategory) => category.nodes.map((node: NodeDefinition) => node.type));
    const systemDesign = JSON.stringify(project, null, 2);
    return `
    You are an expert AI software architect. Your task is to analyze the provided hierarchical system design and return a JSON array of actionable improvement suggestions.

    **System Design:**
    \`\`\`json
    ${systemDesign}
    \`\`\`

    **Instructions & Constraints:**
    1.  **Analyze the Design Holistically:** Review the high-level nodes and edges, as well as any nested 'subflow' components. Identify potential issues related to best practices, security, scalability, and maintainability. For example, if a monolithic service has a very complex sub-flow, suggest breaking it into microservices. If a sub-flow contains 'Logic & Flow' nodes that are overly complex, suggest simplification.
    2.  **Generate Suggestions:** Provide concrete suggestions to address any identified issues.
    3.  **Strict Output Format:** Your response MUST be ONLY a single, valid JSON array of objects. Your entire response must be parsable by \`JSON.parse()\`. Each object in the array must conform to this exact structure:
        -   \`id\`: A unique string identifier.
        -   \`type\`: 'architectural', 'node', or 'edge'.
        -   \`title\`: A concise title for the suggestion.
        -   \`description\`: A detailed explanation of the issue and the proposed improvement.
        -   \`actions\`: An array of action objects.

    4.  **Action Object Schema:** Each object in the \`actions\` array MUST follow one of these schemas:
        -   **For adding a node:** \`{ "label": "Implement X", "action": "add", "payload": { "type": "...", "name": "..." } }\`. The \`label\` is a clear instruction. The \`type\` MUST be one of these values: ${JSON.stringify(validNodeTypes)}.
        -   **For removing a node:** \`{ "label": "Remove X", "action": "remove", "payload": { "nodeId": "..." } }\`.
        -   **For removing an edge:** \`{ "label": "Remove connection Y", "action": "remove", "payload": { "edgeId": "..." } }\`.
        -   **For updating a node:** \`{ "label": "Refactor X requirements", "action": "update", "payload": { "nodeId": "...", "name": "...", "requirements": "..." } }\`.
        -   **For updating an edge:** \`{ "label": "Change protocol to Z", "action": "update", "payload": { "edgeId": "...", "label": "..." } }\`.
        -   **For changing architecture type:** \`{ "label": "Change to Microservices", "action": "update", "payload": { "architecture": "Microservices" | "Monolithic" } }\`.

    **Crucial Note on Labels:** The \`label\` field is mandatory for every action and MUST be a short, clear, and descriptive command to the user. It should not be empty. If you cannot derive a specific label, use a generic one like "Apply Fix" or "Refactor". The user relies on these labels to understand the action.
    
    **Example of a valid response:**
    [
      {
        "id": "sugg-arch-1",
        "type": "architectural",
        "title": "Migrate to Microservices",
        "description": "The 'Backend' service has a very complex sub-flow with 5 distinct modules. This indicates it may be a good candidate to be broken down into a full microservices architecture for better scalability and independent deployment.",
        "actions": [
          {
            "label": "Change to Microservices",
            "action": "update",
            "payload": { "architecture": "Microservices" }
          }
        ]
      }
    ]
    Begin your JSON response now.
    `;
}

export const generateCodeFromDiagram = async (project: any): Promise<Record<string, string>> => {
    const prompt = buildPrompt(project);
    console.log("--- PROMPT SENT TO AI (Code Generation) ---\n", prompt, "\n------------------------------------");
    
    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        console.log("--- RAW AI RESPONSE (Code Generation) ---\n", text, "\n------------------------------------");
        return extractJsonFromString(text);
    } catch (error) {
        console.error("Error calling Generative AI API for code generation:", error);
        throw new Error("Failed to generate code from AI service.");
    }
};

export const generateSuggestionsFromDiagram = async (project: any): Promise<any[]> => {
    const prompt = buildSuggestionPrompt(project);
    console.log("--- PROMPT SENT TO AI (Suggestions) ---\n", prompt, "\n------------------------------------");
    
    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        console.log("--- RAW AI RESPONSE (Suggestions) ---\n", text, "\n------------------------------------");
        return extractJsonFromString(text);
    } catch (error) {
        console.error("Error calling Generative AI API for suggestions:", error);
        console.error("Full error object:", error);
        throw new Error("Failed to generate suggestions from AI service.");
    }
};
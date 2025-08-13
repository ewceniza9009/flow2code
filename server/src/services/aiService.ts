import { GoogleGenerativeAI } from "@google/generative-ai";
// --- MODIFICATION: Changed the import path ---
import { NODE_DEFINITIONS } from '@flow2code/shared';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ... the rest of the file remains the same ...

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
        1.  **Tests First:** A comprehensive suite of initially failing tests (unit, integration) that fully cover the requirements for every component and endpoint.
        2.  **Minimal Code:** The simplest, cleanest implementation code required to make all the generated tests pass.
        - The final output must contain both the complete test files and the implementation files.

        **Non-Deliverables:**
        - Any code that is not explicitly required to make a test pass.
      `;
        default:
            return getGenerationTypeInstructions('Flexible');
    }
}

function buildPrompt(project: any): string {
    const { name, type, nodes, edges, settings, codeGenerationType } = project;

    const nodeDetails = nodes.map((node: any) => ({ ...node, config: node.config || {} }));
    const edgeDetails = edges.map((edge: any) => ({ ...edge, data: edge.data || {} }));

    const systemDesign = `
      Project Name: ${name}
      Architecture Type: ${type}
      Settings: ${JSON.stringify(settings, null, 2)}
      Nodes (Services/Components):
      ${JSON.stringify(nodeDetails, null, 2)}
      Edges (Connections):
      ${JSON.stringify(edgeDetails, null, 2)}
    `;

    const generationInstructions = getGenerationTypeInstructions(codeGenerationType);

    return `
    You are Flow2Code, an expert-level AI software architect and full-stack developer. Your purpose is to translate a visual system design into a complete, high-quality, runnable codebase.

    **Your Guiding Philosophy:**
    - **Developer Experience is Key:** The generated code should be easy to understand, run, and extend.
    - **Code is for Humans First:** Prioritize clarity, simplicity, and maintainability.
    - **Pragmatism over Dogma:** Choose the right tools and patterns for the job as described in the requirements, not just what's popular.

    **Your Task:**
    Generate a complete codebase based on the provided system design. Your primary directive is to adhere to the **Generation Type** specified below. All other instructions are in service of this goal.

    ---
    ### System Design to Implement
    ${systemDesign}
    ---
    ### Primary Directive: Generation Type
    ${generationInstructions}
    ---
    ### How to Interpret the System Design

    1.  **Nodes are Your Components:**
        - The \`requirements\` field for each node is the **source of truth** for its specific functionality. Implement it faithfully.
        - The \`techStack\` dictates the language and framework.
        - The \`config\` field provides parameters like port numbers or database names. Use them.

    2.  **Edges are the Interactions:**
        - An edge from Service A to Service B defines a dependency. Service A is the client, Service B is the server.
        - For a 'REST' edge, Service A must contain an HTTP client (e.g., using \`axios\` or \`fetch\`) to call an endpoint that you must create in Service B.
        - For a 'DB' edge, the service must contain the necessary database client, connection logic, and queries (or ORM models) to interact with the database.

    3.  **Project Settings Guide the Infrastructure:**
        - The project's \`deploymentStrategy\` must influence the generated infrastructure files. If 'Serverless', generate a \`serverless.yml\` or similar instead of a \`Dockerfile\`. If 'Kubernetes', include basic K8s YAML manifests. 'Docker' (default) implies \`Dockerfile\` and \`docker-compose.yml\`.

    **General Principles (To be applied within the context of the Generation Type):**
    - **Modularity:** Each component should be a self-contained module with a clear and logical internal file structure (e.g., \`src/controllers\`, \`src/services\`, \`src/routes\`).
    - **Configuration:** Always use environment variables for secrets and configurations. Generate a complete \`.env.example\` file for each service.
    - **Deployment:** The root of the project must contain a \`docker-compose.yml\` (or equivalent) to orchestrate all services for easy local startup.

    **What to Avoid:**
    - **DO NOT** invent features or functionality not described in the node \`requirements\`.
    - **DO NOT** add any services, databases, or API endpoints not explicitly defined in the diagram. Stick to the provided design.

    **Final Output Format:**
    - The entire output MUST be a single, valid JSON object.
    - The keys of the JSON object are the full file paths (e.g., "user-service/src/index.ts").
    - The values are strings containing the complete, exact content for each file.

    With this complete context, embody the role of Flow2Code. Analyze the system design and strictly adhere to the primary directive. Generate the complete JSON output representing the project's file system. Begin.
    `;
}

function buildSuggestionPrompt(project: any): string {
    const validNodeTypes = NODE_DEFINITIONS.flatMap(category => category.nodes.map(node => node.type));

    const architecturalData = {
        name: project.name,
        type: project.type,
        settings: project.settings,
        nodes: project.nodes.map((node: any) => ({
            id: node.id,
            name: node.name,
            type: node.type,
            role: node.role,
            requirements: node.requirements,
        })),
        edges: project.edges.map((edge: any) => ({
            source: edge.source,
            target: edge.target,
            type: edge.type,
        })),
    };

    const systemDesign = JSON.stringify(architecturalData, null, 2);

    return `
    You are an expert AI software architect. Your task is to analyze the provided system design and return a JSON array of actionable improvement suggestions.

    **System Design:**
    \`\`\`json
    ${systemDesign}
    \`\`\`

    **Instructions & Constraints:**
    1.  **Analyze the Design:** Review the nodes, edges, and settings to identify potential issues related to best practices, security, scalability, and maintainability.
    2.  **Generate Suggestions:** Provide concrete suggestions to address any identified issues.
    3.  **Use Valid Node Types:** If you suggest adding a new node (action: 'add'), the \`type\` in the payload **MUST** be one of the following values: ${JSON.stringify(validNodeTypes)}. Do not invent a new type.
    4.  **Strict Output Format:** Your response MUST be ONLY a single, valid JSON array of objects.
        -   ABSOLUTELY NO commentary, explanations, or conversational text before or after the JSON array.
        -   Your entire response must be parsable by \`JSON.parse()\`.
        -   Each object in the array must conform to this exact structure:
            -   \`id\`: A unique string identifier.
            -   \`type\`: 'architectural', 'node', or 'edge'.
            -   \`title\`: A concise title for the suggestion.
            -   \`description\`: A detailed explanation of the issue and the proposed improvement.
            -   \`actions\`: An array of objects describing how to implement the suggestion. Each action must have a \`label\`, an \`action\` type ('add', 'remove', 'update'), and a \`payload\`.

    **Example of a valid response:**
    [
      {
        "id": "sugg-sec-1",
        "type": "architectural",
        "title": "Add an Authentication Service",
        "description": "The current design lacks a dedicated authentication service... etc.",
        "actions": [
          {
            "label": "Add Auth Service Node",
            "action": "add",
            "payload": { "type": "sec-auth", "name": "Auth Service" }
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
// packages/shared/src/nodes.ts
export const NODE_DEFINITIONS = [
    {
        name: "Frontend",
        nodes: [
            { type: 'frontend-vanilla', name: 'Vanilla', category: 'Frontend', techStack: ['HTML', 'Javascript', 'CSS'] },
            { type: 'frontend-react', name: 'React', category: 'Frontend', techStack: ['React', 'Vite', 'TypeScript'] },
            { type: 'frontend-nextjs', name: 'Next.js', category: 'Frontend', techStack: ['Next.js', 'React'] },
            { type: 'frontend-vue', name: 'Vue.js', category: 'Frontend', techStack: ['Vue', 'Vite'] },
            { type: 'frontend-angular', name: 'Angular', category: 'Frontend', techStack: ['Angular', 'TypeScript'] },
        ],
    },
    {
        name: "Backend",
        nodes: [
            { type: 'backend-express', name: 'Express API', category: 'Backend', techStack: ['Node.js', 'Express', 'TypeScript'], config: { port: 3000, middleware: ['cors', 'json'] } },
            { type: 'backend-nestjs', name: 'NestJS API', category: 'Backend', techStack: ['NestJS', 'TypeScript'] },
            { type: 'backend-fastapi', name: 'FastAPI', category: 'Backend', techStack: ['Python', 'FastAPI'] },
            { type: 'backend-django', name: 'Django', category: 'Backend', techStack: ['Django', 'Python'] },
            { type: 'backend-spring', name: 'Spring Boot', category: 'Backend', techStack: ['Java', 'Spring Boot'] },
            { type: 'backend-gofiber', name: 'Go Fiber', category: 'Backend', techStack: ['Go', 'Fiber'] },
            { type: 'backend-aspnet', name: 'ASP.NET Core', category: 'Backend', techStack: ['.NET', 'C#', 'ASP.NET Core'] },
        ],
    },
    {
        name: "Data Layer",
        nodes: [
            { type: 'db-postgres', name: 'PostgreSQL', category: 'Data Layer', techStack: ['PostgreSQL', 'PostgreSQL'], config: { databaseName: 'db', username: 'user', password: 'password' } },
            { type: 'db-sqlserver', name: 'SQL Server', category: 'Data Layer', techStack: ['SQL', 'MS SQL'], config: { databaseName: 'db', username: 'user', password: 'password' } },
            { type: 'db-mysql', name: 'MySQL', category: 'Data Layer', techStack: ['MySQL', 'MySQL'] },
            { type: 'db-mongo', name: 'MongoDB', category: 'Data Layer', techStack: ['NoSQL', 'MongoDB'] },
            { type: 'db-redis', name: 'Redis', category: 'Data Layer', techStack: ['Cache', 'Redis'] },
            { type: 'db-indexdb', name: 'IndexDB', category: 'Data Layer', techStack: ['DexieJS', 'IndexDb'] },
        ],
    },
    {
        name: "Logic & Flow",
        nodes: [
            { type: 'flowchart', name: 'Start / End', category: 'Logic & Flow', techStack: ['Flow'], data: { shape: 'terminator', text: 'Start' } },
            { type: 'flowchart', name: 'Process', category: 'Logic & Flow', techStack: ['Flow'], data: { shape: 'rectangle', text: 'Do something' } },
            { type: 'flowchart', name: 'Decision', category: 'Logic & Flow', techStack: ['Flow'], data: { shape: 'diamond', text: 'Is it valid?' } },
            { type: 'flowchart', name: 'Input / Output', category: 'Logic & Flow', techStack: ['Flow'], data: { shape: 'parallelogram', text: 'Get Data' } },
            { type: 'flowchart', name: 'Subroutine', category: 'Logic & Flow', techStack: ['Flow'], data: { shape: 'subroutine', text: 'Call function' } },
            { type: 'flowchart', name: 'Document', category: 'Logic & Flow', techStack: ['Flow'], data: { shape: 'document', text: 'Generate Report' } },
            { type: 'flowchart', name: 'Data Storage', category: 'Logic & Flow', techStack: ['Flow'], data: { shape: 'dataStorage', text: 'Save State' } },
            { type: 'flowchart', name: 'Delay', category: 'Logic & Flow', techStack: ['Flow'], data: { shape: 'delay', text: 'Wait 1 second' } },
            { type: 'flowchart', name: 'Display', category: 'Logic & Flow', techStack: ['Flow'], data: { shape: 'display', text: 'Show message' } },
            { type: 'flowchart', name: 'Merge', category: 'Logic & Flow', techStack: ['Flow'], data: { shape: 'merge', text: 'Merge branches' } },
            { type: 'flowchart', name: 'Connector', category: 'Logic & Flow', techStack: ['Flow'], data: { shape: 'connector', text: 'A' } },
        ],
    },
    {
        name: "Gateways",
        nodes: [
            { type: 'gateway-kong', name: 'Kong Gateway', category: 'Gateways', techStack: ['API Gateway', 'Lua'] },
            { type: 'gateway-azure-apim', name: 'Azure API Mgt', category: 'Gateways', techStack: ['API Gateway', 'Azure'] },
        ]
    },
    {
        name: "Messaging",
        nodes: [
            { type: 'msg-kafka', name: 'Kafka', category: 'Messaging', techStack: ['Event Stream', 'Kafka'] },
            { type: 'msg-rabbitmq', name: 'RabbitMQ', category: 'Messaging', techStack: ['Message Queue', 'RabbitMQ'] },
        ]
    },
    {
        name: "Security",
        nodes: [
            { type: 'sec-auth', name: 'Auth Service', category: 'Security', techStack: ['JWT', 'OAuth2'] },
            { type: 'sec-identity', name: 'Identity Provider', category: 'Security', techStack: ['OAuth2', 'OIDC', 'SAML'] },
        ]
    },
    {
        name: "External Services",
        nodes: [
            { type: 'ext-ai-ml', name: 'AI/ML Service', category: 'External Services', techStack: ['Computer Vision', 'NLP'] },
            { type: 'ext-payment', name: 'Payment Gateway', category: 'External Services', techStack: ['Stripe', 'PayPal'] },
            { type: 'ext-notification', name: 'Notification Service', category: 'External Services', techStack: ['Twilio', 'SendGrid', 'SNS'] },
        ]
    },
    {
        name: "Structural",
        nodes: [
            { type: 'group', name: 'Service Group', category: 'Structural', techStack: ['Container'] },
        ]
    },
    {
        name: "Annotations",
        nodes: [
            { type: 'text-note', name: 'Text Note', category: 'Annotations', techStack: ['Annotation'] },
            { type: 'shape', name: 'Rectangle', category: 'Annotations', techStack: ['Shape'], data: { shapeType: 'Rectangle' } },
            { type: 'shape', name: 'Circle', category: 'Annotations', techStack: ['Shape'], data: { shapeType: 'Circle' } },
            { type: 'shape', name: 'Diamond', category: 'Annotations', techStack: ['Shape'], data: { shapeType: 'Diamond' } },
            { type: 'shape', name: 'Arrow Right', category: 'Annotations', techStack: ['Shape'], data: { shapeType: 'ArrowRight' } },
            { type: 'shape', name: 'Arrow Left', category: 'Annotations', techStack: ['Shape'], data: { shapeType: 'ArrowLeft' } },
            { type: 'icon', name: 'CPU Icon', category: 'Annotations', techStack: ['Icon'], data: { iconName: 'Cpu' } },
            { type: 'icon', name: 'Server Icon', category: 'Annotations', techStack: ['Icon'], data: { iconName: 'Server' } },
            { type: 'icon', name: 'Database Icon', category: 'Annotations', techStack: ['Icon'], data: { iconName: 'Database' } },
            { type: 'icon', name: 'Users Icon', category: 'Annotations', techStack: ['Icon'], data: { iconName: 'Users' } },
            { type: 'icon', name: 'Cloud Icon', category: 'Annotations', techStack: ['Icon'], data: { iconName: 'Cloud' } },
            { type: 'icon', name: 'File Icon', category: 'Annotations', techStack: ['Icon'], data: { iconName: 'File' } },
        ]
    }
];

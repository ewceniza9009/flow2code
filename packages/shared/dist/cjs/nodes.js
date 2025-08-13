"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODE_DEFINITIONS = void 0;
exports.NODE_DEFINITIONS = [
    {
        name: "Frontend",
        nodes: [
            { type: 'frontend-vanilla', name: 'Vanilla', category: 'Frontend', techStack: ['HTML', 'Javascript', 'CSS(Tailwind CSS + Bootstrap)'] },
            { type: 'frontend-aspcore', name: 'Razor', category: 'Frontend', techStack: ['Razor + HTML', 'Javascript', 'CSS(Tailwind CSS + Bootstrap)'] },
            { type: 'frontend-thirdparty', name: 'ThirdParty', category: 'Frontend', techStack: ['Telerik', 'Devexpress', 'Syncfusion)'] },
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
            { type: 'backend-django', name: 'Django', category: 'Backend', techStack: ['Python', 'Django'] },
            { type: 'backend-spring', name: 'Spring Boot', category: 'Backend', techStack: ['Java', 'Spring Boot'] },
            { type: 'backend-gofiber', name: 'Go Fiber', category: 'Backend', techStack: ['Go', 'Fiber'] },
            { type: 'backend-aspnet', name: 'ASP.NET Core', category: 'Backend', techStack: ['.NET', 'C#', 'ASP.NET Core'] },
        ],
    },
    {
        name: "Data Layer",
        nodes: [
            { type: 'db-postgres', name: 'PostgreSQL', category: 'Data Layer', techStack: ['SQL', 'PostgreSQL'], config: { databaseName: 'db', username: 'user', password: 'password' } },
            { type: 'db-sqlserver', name: 'SQL Server', category: 'Data Layer', techStack: ['SQL', 'MS SQL'], config: { databaseName: 'db', username: 'user', password: 'password' } },
            { type: 'db-mysql', name: 'MySQL', category: 'Data Layer', techStack: ['SQL', 'MySQL'] },
            { type: 'db-mongo', name: 'MongoDB', category: 'Data Layer', techStack: ['NoSQL', 'MongoDB'] },
            { type: 'db-redis', name: 'Redis', category: 'Data Layer', techStack: ['Cache', 'Redis'] },
            { type: 'db-indexdb', name: 'IndexDB', category: 'Data Layer', techStack: ['DexieJS', 'IndexDb'] },
        ],
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

import { Node, Edge } from 'reactflow';

export type NodeData = {
    subflow?: { nodes: Node<NodeData>[], edges: Edge[] };
    [key: string]: any;
};

export interface AISuggestion {
    id: string;
    type: 'architectural' | 'node' | 'edge';
    title: string;
    description: string;
    actions: { label: string; action: 'add' | 'remove' | 'update'; payload: any; }[];
    applied?: boolean;
}

export type ProjectType = 'Monolithic' | 'Microservices';
export type CodeGenerationType = 'Starter' | 'Flexible' | 'Complete' | 'Test-Driven';
export type CloudProvider = 'AWS' | 'GCP' | 'Azure' | 'DigitalOcean' | 'Other';
export type DeploymentStrategy = 'Docker' | 'Kubernetes' | 'Serverless';

export interface ProjectSettings {
    cloudProvider: CloudProvider;
    deploymentStrategy: DeploymentStrategy;
    cicdTooling: string;
    architecturalPatterns?: {
        ddd?: boolean;
        eda?: boolean;
        cqrs?: boolean;
    };
    testingFramework?: string;
    securityPractices?: {
        inputValidation?: boolean;
        rbac?: boolean;
        rateLimiting?: boolean;
        owaspCompliance?: boolean;
    };
    iacTool?: 'None' | 'Terraform' | 'CloudFormation' | 'Bicep';
    secretManagement?: 'Environment Variables' | 'AWS Secrets Manager' | 'Azure Key Vault' | 'GCP Secret Manager';
}

export interface ProjectSnapshot {
    timestamp: Date;
    nodes: Node<NodeData>[];
    edges: Edge[];
    suggestions?: AISuggestion[];
}

export interface Project {
    id: string;
    name: string;
    type: ProjectType;
    snapshots: ProjectSnapshot[];
    createdAt: Date;
    settings?: ProjectSettings;
    generatedFiles?: Record<string, string>;
}
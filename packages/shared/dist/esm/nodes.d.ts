export interface NodeDefinition {
    type: string;
    name: string;
    category: string;
    techStack: string[];
    requirements?: string;
    config?: Record<string, any>;
    data?: Record<string, any>;
}
export interface NodeCategory {
    name: string;
    nodes: NodeDefinition[];
}
export declare const NODE_DEFINITIONS: NodeCategory[];

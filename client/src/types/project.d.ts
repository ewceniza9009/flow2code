import { Node, Edge } from 'reactflow';
import { AISuggestion } from '@/store/useStore';
import { NodeData } from '@/store/useStore';

export type ProjectType = 'Monolithic' | 'Microservices';
export type CodeGenerationType = 'Starter' | 'Flexible' | 'Complete' | 'Test-Driven';

export type CloudProvider = 'AWS' | 'GCP' | 'Azure' | 'DigitalOcean' | 'Other';
export type DeploymentStrategy = 'Docker' | 'Kubernetes' | 'Serverless';

export interface ProjectSettings {
  cloudProvider: CloudProvider;
  deploymentStrategy: DeploymentStrategy;
  cicdTooling: string;
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
}
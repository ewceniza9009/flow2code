import { Node, Edge } from 'reactflow';
import { NodeData } from '@/store/useStore';

export type ProjectType = 'Monolithic' | 'Microservices' | 'Hybrid';
export type CloudProvider = 'AWS' | 'GCP' | 'Azure' | 'DigitalOcean' | 'Other';
export type DeploymentStrategy = 'Docker' | 'Kubernetes' | 'Serverless';

export interface ProjectSnapshot {
  timestamp: Date;
  nodes: Node<NodeData>[];
  edges: Edge[];
}

export interface ProjectSettings {
  cloudProvider: CloudProvider;
  deploymentStrategy: DeploymentStrategy;
  cicdTooling: string;
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  snapshots: ProjectSnapshot[];
  createdAt: Date;
  settings?: ProjectSettings;
}
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/store/useStore';

export type ProjectType = 'Monolithic' | 'Microservices' | 'Hybrid';

export interface ProjectSnapshot {
  timestamp: Date;
  nodes: Node<NodeData>[];
  edges: Edge[];
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  snapshots: ProjectSnapshot[];
  createdAt: Date;
}
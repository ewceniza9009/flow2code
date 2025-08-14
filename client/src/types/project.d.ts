import { Node, Edge } from 'reactflow';
import { AISuggestion } from '@/store/useStore';
import { Table } from 'dexie';

export type ProjectType = 'Blank' | 'API' | 'Website' | 'Mobile App' | 'IoT' | 'Data Pipeline';
export type CodeGenerationType = 'Starter' | 'Flexible' | 'Complete' | 'Test-Driven';

export interface ProjectSettings {
  cloudProvider: string;
  deploymentStrategy: string;
  cicdTooling: string;
}

export interface ProjectSnapshot {
  timestamp: Date;
  nodes: Node[];
  edges: Edge[];
  suggestions: AISuggestion[];
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  description: string;
  snapshots: ProjectSnapshot[];
  settings: ProjectSettings;
  generatedFiles?: Record<string, string>;
}

export interface DexieProjects extends Table<Project, string> {}
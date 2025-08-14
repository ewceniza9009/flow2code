import Dexie, { Table } from 'dexie';
import { Project, ProjectSnapshot } from '@/types/project';

export class Flow2CodeDB extends Dexie {
  projects!: Table<Project, string>; 

  constructor() {
    super('Flow2CodeDB');
    this.version(1).stores({
      projects: '++id, name, createdAt' 
    });
    this.version(2).upgrade(tx => {
      return tx.table('projects').toCollection().modify(project => {
        if (!project.snapshots) {
          const currentNodes = project.nodes;
          const currentEdges = project.edges;
          delete project.nodes;
          delete project.edges;
          project.snapshots = [{
            timestamp: project.createdAt || new Date(),
            nodes: currentNodes || [],
            edges: currentEdges || [],
            suggestions: []
          }];
        }
        if (!project.settings) {
          project.settings = { cloudProvider: 'Other', deploymentStrategy: 'Docker', cicdTooling: '' };
        }
        for (const snapshot of project.snapshots) {
          if (!snapshot.suggestions) {
            snapshot.suggestions = [];
          }
        }
      });
    });
  }
}

export const db = new Flow2CodeDB();
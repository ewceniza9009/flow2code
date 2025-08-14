import Dexie, { Table } from 'dexie';
import { Project, ProjectSnapshot } from '@/types/project';

export class Flow2CodeDB extends Dexie {
  projects!: Table<Project, string>; 

  constructor() {
    super('Flow2CodeDB');
    this.version(1).stores({
      projects: '++id, name, createdAt' 
    });
    // Version 2: Add snapshots and settings to the projects table
    this.version(2).upgrade(async tx => {
      await tx.table('projects').toCollection().modify(project => {
        if (!project.snapshots) {
          // Cast to 'any' to access properties that might not exist on the new type
          const oldProject = project as any;
          
          // Create a new snapshot from the old top-level data
          const newSnapshot: ProjectSnapshot = {
            timestamp: oldProject.createdAt || new Date(),
            nodes: oldProject.nodes || [],
            edges: oldProject.edges || [],
            suggestions: []
          };
          project.snapshots = [newSnapshot];
          
          // Clean up old properties
          delete oldProject.nodes;
          delete oldProject.edges;
        }
        
        // Ensure every project has a settings object
        if (!project.settings) {
          project.settings = { cloudProvider: 'Other', deploymentStrategy: 'Docker', cicdTooling: '' };
        }

        // Ensure every snapshot has a suggestions array
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
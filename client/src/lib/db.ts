import Dexie, { Table } from 'dexie';
import { Project } from '@/types/project';

export class Flow2CodeDB extends Dexie {
  projects!: Table<Project, string>; 

  constructor() {
    super('Flow2CodeDB');
    this.version(1).stores({
      projects: '++id, name, createdAt' 
    });
  }
}

export const db = new Flow2CodeDB();
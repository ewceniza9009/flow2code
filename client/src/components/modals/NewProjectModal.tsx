import { useStore } from '@/store/useStore';
import { Project, ProjectType } from '@/types/project';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { X } from 'lucide-react';

export default function NewProjectModal() {
  const [name, setName] = useState('');
  const [type, setType] = useState<ProjectType>('Microservices');
  const { setActiveProject, setNodes, setEdges, closeNewProjectModal, loadProjects } = useStore();

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newProject: Project = {
      id: uuidv4(),
      name,
      type,
      snapshots: [{ timestamp: new Date(), nodes: [], edges: [] }],
      createdAt: new Date(),
    };

    await db.projects.add(newProject);
    await loadProjects();
    setActiveProject(newProject);
    setNodes([]);
    setEdges([]);
    closeNewProjectModal();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-surface dark:bg-dark-surface p-8 rounded-lg w-full max-w-md shadow-2xl border border-border dark:border-dark-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-main dark:text-dark-text-main">Create New Project Universe</h2>
          <button onClick={closeNewProjectModal} className="text-text-muted dark:text-dark-text-muted hover:text-text-main dark:hover:text-dark-text-main">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleCreateProject}>
          <div className="mb-4">
            <label htmlFor="projectName" className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-2">Project Name</label>
            <input
              type="text"
              id="projectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md px-3 py-2 text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="e.g., TaskManagerX"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-2">Select Universe Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('Monolithic')}
                className={`p-4 border rounded-md text-left transition-colors ${type === 'Monolithic' ? 'border-primary bg-primary/10' : 'border-border dark:border-dark-border hover:border-gray-600'}`}
              >
                <h3 className="font-semibold text-text-main dark:text-dark-text-main">🌍 Monolithic</h3>
                <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">Single unified codebase.</p>
              </button>
              <button
                type="button"
                onClick={() => setType('Microservices')}
                className={`p-4 border rounded-md text-left transition-colors ${type === 'Microservices' ? 'border-primary bg-primary/10' : 'border-border dark:border-dark-border hover:border-gray-600'}`}
              >
                <h3 className="font-semibold text-text-main dark:text-dark-text-main">🌌 Microservices</h3>
                <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">Independent, scalable services.</p>
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-3 rounded-md hover:bg-primary-hover"
          >
            Create Universe
          </button>
        </form>
      </div>
    </div>
  );
}
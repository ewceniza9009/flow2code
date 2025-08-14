import { useStore } from '@/store/useStore';
import { Project, ProjectType } from '@/types/project';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { X, Globe, GitFork } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-surface dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-sm border border-border dark:border-dark-border"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-text-main dark:text-dark-text-main">New Project Universe</h2>
            <button onClick={closeNewProjectModal} className="text-text-muted dark:text-dark-text-muted hover:text-text-main dark:hover:text-dark-text-main transition-colors">
              <X size={20} />
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
                className="w-full bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg px-3 py-2 text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder:text-text-muted/50"
                placeholder="e.g., TaskManagerX"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-2">Universe Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('Monolithic')}
                  className={`p-3 border rounded-lg text-left transition-all duration-200 ${type === 'Monolithic' ? 'border-primary bg-primary/10' : 'border-border dark:border-dark-border hover:border-gray-400 dark:hover:border-gray-400'}`}
                >
                  <div className="flex items-center mb-1">
                    <Globe size={20} className="mr-2 text-text-main dark:text-dark-text-main" />
                    <h3 className="font-medium text-text-main dark:text-dark-text-main">Monolithic</h3>
                  </div>
                  <p className="text-xs text-text-muted dark:text-dark-text-muted">Single unified codebase.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setType('Microservices')}
                  className={`p-3 border rounded-lg text-left transition-all duration-200 ${type === 'Microservices' ? 'border-primary bg-primary/10' : 'border-border dark:border-dark-border hover:border-gray-400 dark:hover:border-gray-400'}`}
                >
                  <div className="flex items-center mb-1">
                    <GitFork size={20} className="mr-2 text-text-main dark:text-dark-text-main" />
                    <h3 className="font-medium text-text-main dark:text-dark-text-main">Microservices</h3>
                  </div>
                  <p className="text-xs text-text-muted dark:text-dark-text-muted">Independent, scalable services.</p>
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary/90 transition-colors duration-200"
            >
              Create Universe
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
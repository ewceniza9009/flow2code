import { useStore } from '@/store/useStore';
import { X, Save, Eraser } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ProjectSettings, CloudProvider, DeploymentStrategy } from '@/types/project';
import { db } from '@/lib/db';
import { motion } from 'framer-motion';

export default function ProjectSettingsModal() {
  const { activeProject, projectSettings, setProjectSettings, closeSettingsModal, setActiveProject } = useStore();
  const [settings, setSettings] = useState<ProjectSettings>(projectSettings);

  // Sync state with global store when modal opens
  useEffect(() => {
    if (projectSettings) {
      setSettings(projectSettings);
    }
  }, [projectSettings]);

  const handleSave = async () => {
    if (!activeProject) return;

    setProjectSettings(settings);

    // Save the new settings to the active project in the database
    await db.projects.update(activeProject.id, { settings });

    // Update the active project in the store to reflect the new settings
    setActiveProject({ ...activeProject, settings });

    closeSettingsModal();
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
            <h2 className="text-xl font-semibold text-text-main dark:text-dark-text-main">Project Settings</h2>
            <button
              onClick={closeSettingsModal}
              className="text-text-muted dark:text-dark-text-muted hover:text-text-main dark:hover:text-dark-text-main transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-2">Cloud Provider</label>
              <select
                value={settings.cloudProvider}
                onChange={(e) => setSettings({ ...settings, cloudProvider: e.target.value as CloudProvider })}
                className="w-full h-8 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg px-2 py-0 text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                <option value="AWS">AWS</option>
                <option value="GCP">GCP</option>
                <option value="Azure">Azure</option>
                <option value="DigitalOcean">DigitalOcean</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-2">Deployment Strategy</label>
              <select
                value={settings.deploymentStrategy}
                onChange={(e) => setSettings({ ...settings, deploymentStrategy: e.target.value as DeploymentStrategy })}
                className="w-full h-8 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg px-2 py-0 text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                <option value="Docker">Docker</option>
                <option value="Kubernetes">Kubernetes</option>
                <option value="Serverless">Serverless</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-2">CI/CD Tooling</label>
              <input
                type="text"
                value={settings.cicdTooling}
                onChange={(e) => setSettings({ ...settings, cicdTooling: e.target.value })}
                placeholder="e.g., GitHub Actions, GitLab CI"
                className="w-full h-8 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg px-3 py-0 text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder:text-text-muted/50"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={closeSettingsModal}
              className="px-4 py-2 bg-transparent text-text-main dark:text-dark-text-main border border-border dark:border-dark-border rounded-md hover:bg-border/50 dark:hover:bg-dark-border/50 transition-colors flex items-center"
            >
              <Eraser size={18} className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary/90 transition-colors flex items-center"
            >
              <Save size={18} className="mr-2" />
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
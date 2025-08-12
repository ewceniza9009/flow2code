import { useStore } from '@/store/useStore';
import { X } from 'lucide-react';
import { useState } from 'react';
import { ProjectSettings, CloudProvider, DeploymentStrategy } from '@/types/project';
import { db } from '@/lib/db';

export default function ProjectSettingsModal() {
  const { activeProject, projectSettings, setProjectSettings, closeSettingsModal, setActiveProject } = useStore();
  const [settings, setSettings] = useState<ProjectSettings>(projectSettings);

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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-surface dark:bg-dark-surface p-8 rounded-lg w-full max-w-md shadow-2xl border border-border dark:border-dark-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-main dark:text-dark-text-main">Project Settings</h2>
          <button onClick={closeSettingsModal} className="text-text-muted dark:text-dark-text-muted hover:text-text-main dark:hover:text-dark-text-main">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-2">Cloud Provider</label>
            <select
              value={settings.cloudProvider}
              onChange={(e) => setSettings({ ...settings, cloudProvider: e.target.value as CloudProvider })}
              className="w-full bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md px-3 py-2 text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option>AWS</option>
              <option>GCP</option>
              <option>Azure</option>
              <option>DigitalOcean</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-2">Deployment Strategy</label>
            <select
              value={settings.deploymentStrategy}
              onChange={(e) => setSettings({ ...settings, deploymentStrategy: e.target.value as DeploymentStrategy })}
              className="w-full bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md px-3 py-2 text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option>Docker</option>
              <option>Kubernetes</option>
              <option>Serverless</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-2">CI/CD Tooling</label>
            <input
              type="text"
              value={settings.cicdTooling}
              onChange={(e) => setSettings({ ...settings, cicdTooling: e.target.value })}
              placeholder="e.g., GitHub Actions, GitLab CI"
              className="w-full bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md px-3 py-2 text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={closeSettingsModal}
            className="px-4 py-2 bg-transparent text-text-main dark:text-dark-text-main border border-border dark:border-dark-border rounded-md hover:bg-border dark:hover:bg-dark-border"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-hover"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
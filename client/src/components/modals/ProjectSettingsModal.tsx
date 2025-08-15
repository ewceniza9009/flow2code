import { useStore } from '@/store/useStore';
import { X, Save, Eraser, Settings, Network, ShieldCheck, CloudCog } from 'lucide-react';
import { useState, useEffect, FC, ReactNode } from 'react';
import { ProjectSettings, CloudProvider, DeploymentStrategy } from '@/types/project';
import { db } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';

interface NavButtonProps {
    icon: ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}
const NavButton: FC<NavButtonProps> = ({ icon, label, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-text-muted dark:text-dark-text-muted hover:bg-background dark:hover:bg-dark-background hover:text-text-main dark:hover:text-dark-text-main'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

interface ToggleSwitchProps {
    label: string;
    enabled: boolean;
    onChange: () => void;
}

const ToggleSwitch: FC<ToggleSwitchProps> = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between w-full py-2">
        <span className="text-sm text-text-main dark:text-dark-text-main pr-4">{label}</span>
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-dark-surface focus:ring-primary ${enabled ? 'bg-primary' : 'bg-border dark:bg-dark-border'}`}
        >
            <span
                aria-hidden="true"
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
    </div>
);


export default function ProjectSettingsModal() {
    const { activeProject, projectSettings, setProjectSettings, closeSettingsModal, setActiveProject } = useStore();
    const [settings, setSettings] = useState<ProjectSettings>(projectSettings);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        const defaultSettings: ProjectSettings = {
            cloudProvider: 'Other',
            deploymentStrategy: 'Docker',
            cicdTooling: '',
            architecturalPatterns: { ddd: false, eda: false, cqrs: false },
            testingFramework: '',
            securityPractices: { inputValidation: true, rbac: false, rateLimiting: false, owaspCompliance: true },
            iacTool: 'None',
            secretManagement: 'Environment Variables',
        };
        const mergedSettings = { ...defaultSettings, ...projectSettings, architecturalPatterns: { ...defaultSettings.architecturalPatterns, ...(projectSettings.architecturalPatterns || {}), }, securityPractices: { ...defaultSettings.securityPractices, ...(projectSettings.securityPractices || {}), }, };
        setSettings(mergedSettings);
    }, [projectSettings]);

    const handleSave = async () => {
        if (!activeProject) return;
        setProjectSettings(settings);
        await db.projects.update(activeProject.id, { settings });
        setActiveProject({ ...activeProject, settings });
        closeSettingsModal();
    };

    const handleCheckboxChange = (category: 'architecturalPatterns' | 'securityPractices', key: string) => {
        setSettings(prev => {
            const categoryState = prev[category] || {};
            const currentKeyState = categoryState[key as keyof typeof categoryState];
            return { ...prev, [category]: { ...categoryState, [key]: !currentKeyState, }, };
        });
    };
    
    const navItems = [
        { id: 'general', label: 'General', icon: <Settings size={18} /> },
        { id: 'architecture', label: 'Architecture', icon: <Network size={18} /> },
        { id: 'security', label: 'Security & QA', icon: <ShieldCheck size={18} /> },
        { id: 'infrastructure', label: 'Infrastructure', icon: <CloudCog size={18} /> },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-surface dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-4xl border border-border dark:border-dark-border flex flex-col h-[80vh]"
            >
                <header className="flex justify-between items-center p-5 border-b border-border dark:border-dark-border flex-shrink-0">
                    <h2 className="text-xl font-semibold text-text-main dark:text-dark-text-main">Project Settings</h2>
                    <button onClick={closeSettingsModal} className="text-text-muted dark:text-dark-text-muted hover:text-text-main dark:hover:text-dark-text-main transition-colors">
                        <X size={20} />
                    </button>
                </header>

                <div className="flex flex-grow overflow-hidden">
                    <aside className="w-1/4 border-r border-border dark:border-dark-border p-4 space-y-2 bg-background/50 dark:bg-dark-background/50">
                        {navItems.map(item => (
                            <NavButton key={item.id} label={item.label} icon={item.icon} isActive={activeTab === item.id} onClick={() => setActiveTab(item.id)} />
                        ))}
                    </aside>
                    
                    <main className="w-3/4 p-8 overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'general' && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-2">Cloud Provider</label>
                                            <select value={settings.cloudProvider} onChange={(e) => setSettings({ ...settings, cloudProvider: e.target.value as CloudProvider })} className="w-full h-9 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg px-2 text-sm text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200">
                                                <option>AWS</option> <option>GCP</option> <option>Azure</option> <option>DigitalOcean</option> <option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-2">Deployment Strategy</label>
                                            <select value={settings.deploymentStrategy} onChange={(e) => setSettings({ ...settings, deploymentStrategy: e.target.value as DeploymentStrategy })} className="w-full h-9 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg px-2 text-sm text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200">
                                                <option>Docker</option> <option>Kubernetes</option> <option>Serverless</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-2">CI/CD Tooling</label>
                                            <input
                                                type="text"
                                                list="cicd-options"
                                                value={settings.cicdTooling}
                                                onChange={(e) => setSettings({ ...settings, cicdTooling: e.target.value })}
                                                placeholder="e.g., GitHub Actions, GitLab CI"
                                                className="w-full h-9 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg px-3 text-sm text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder:text-text-muted/50"
                                            />
                                            <datalist id="cicd-options">
                                                <option value="GitHub Actions" />
                                                <option value="GitLab CI" />
                                                <option value="Jenkins" />
                                                <option value="CircleCI" />
                                                <option value="Azure DevOps" />
                                                <option value="Travis CI" />
                                            </datalist>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'architecture' && (
                                    <div className="space-y-2">
                                        <ToggleSwitch label="Domain-Driven Design (DDD)" enabled={settings.architecturalPatterns?.ddd || false} onChange={() => handleCheckboxChange('architecturalPatterns', 'ddd')} />
                                        <ToggleSwitch label="Event-Driven Architecture (EDA)" enabled={settings.architecturalPatterns?.eda || false} onChange={() => handleCheckboxChange('architecturalPatterns', 'eda')} />
                                        <ToggleSwitch label="Command Query Responsibility Segregation (CQRS)" enabled={settings.architecturalPatterns?.cqrs || false} onChange={() => handleCheckboxChange('architecturalPatterns', 'cqrs')} />
                                    </div>
                                )}
                                
                                {activeTab === 'security' && (
                                    <div className="space-y-4">
                                         <div>
                                            <label className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-2">Testing Framework</label>
                                            <input
                                                type="text"
                                                list="testing-options"
                                                value={settings.testingFramework}
                                                onChange={(e) => setSettings({ ...settings, testingFramework: e.target.value })}
                                                placeholder="e.g., Jest, Pytest, xUnit"
                                                className="w-full h-9 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg px-3 text-sm text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder:text-text-muted/50"
                                            />
                                            <datalist id="testing-options">
                                                <option value="Jest" />
                                                <option value="Vitest" />
                                                <option value="Pytest" />
                                                <option value="xUnit" />
                                                <option value="JUnit" />
                                                <option value="Cypress" />
                                                <option value="Playwright" />
                                            </datalist>
                                        </div>
                                        <div className="pt-2">
                                            <ToggleSwitch label="Enforce Input Validation" enabled={settings.securityPractices?.inputValidation || false} onChange={() => handleCheckboxChange('securityPractices', 'inputValidation')} />
                                            <ToggleSwitch label="Enable Role-Based Access Control (RBAC)" enabled={settings.securityPractices?.rbac || false} onChange={() => handleCheckboxChange('securityPractices', 'rbac')} />
                                            <ToggleSwitch label="Include API Rate Limiting" enabled={settings.securityPractices?.rateLimiting || false} onChange={() => handleCheckboxChange('securityPractices', 'rateLimiting')} />
                                            <ToggleSwitch label="Follow OWASP Top 10 Guidelines" enabled={settings.securityPractices?.owaspCompliance || false} onChange={() => handleCheckboxChange('securityPractices', 'owaspCompliance')} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'infrastructure' && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-2">Infrastructure-as-Code (IaC)</label>
                                            <select value={settings.iacTool} onChange={(e) => setSettings({ ...settings, iacTool: e.target.value as any })} className="w-full h-9 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg px-2 text-sm text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200">
                                                <option>None</option> <option>Terraform</option> <option>AWS CloudFormation</option> <option>Azure Bicep</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-2">Secret Management</label>
                                            <select value={settings.secretManagement} onChange={(e) => setSettings({ ...settings, secretManagement: e.target.value as any })} className="w-full h-9 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg px-2 text-sm text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200">
                                                <option>Environment Variables</option> <option>AWS Secrets Manager</option> <option>Azure Key Vault</option> <option>GCP Secret Manager</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>

                <footer className="p-4 flex justify-end gap-3 border-t border-border dark:border-dark-border flex-shrink-0 bg-background/50 dark:bg-dark-background/50">
                    <button onClick={closeSettingsModal} className="px-4 py-2 bg-transparent text-text-main dark:text-dark-text-main border border-border dark:border-dark-border rounded-md hover:bg-border/50 dark:hover:bg-dark-border/50 transition-colors flex items-center gap-2 text-sm font-medium">
                        <Eraser size={16} /> Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover transition-colors flex items-center gap-2 text-sm">
                        <Save size={16} /> Save Changes
                    </button>
                </footer>
            </motion.div>
        </div>
    );
}
import { StateCreator } from 'zustand';
import { Project, ProjectSettings, ProjectSnapshot, ProjectType } from '@/types/project';
import { db } from '@/lib/db';
import { AppState } from '.';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';

export interface ProjectState {
    activeProject: Project | null;
    projects: Project[];
    projectSettings: ProjectSettings;
    isSettingsModalOpen: boolean;
    countProjects: number;
    loadProjects: () => Promise<void>;
    setActiveProject: (project: Project | null) => void;
    renameProject: (projectId: string, newName: string) => Promise<void>;
    updateProjectType: (newType: ProjectType) => Promise<void>;
    setProjectSettings: (settings: ProjectSettings) => void;
    openSettingsModal: () => void;
    closeSettingsModal: () => void;
    saveProjectToFile: () => void;
    loadProjectFromFile: (fileContent: string) => Promise<void>;
    updateProjectSnapshot: () => void;
}

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

export const createProjectSlice: StateCreator<AppState, [], [], ProjectState> = (set, get) => ({
    activeProject: null,
    projects: [],
    projectSettings: defaultSettings,
    isSettingsModalOpen: false,
    countProjects: 0,

    loadProjects: async () => {
        const projectsFromDb = await db.projects.toArray();
        set({ projects: projectsFromDb, countProjects: projectsFromDb.length });
    },
    setActiveProject: (project) => {
        const projectSettings = {
            ...defaultSettings,
            ...(project?.settings || {}),
            architecturalPatterns: {
                ...defaultSettings.architecturalPatterns,
                ...(project?.settings?.architecturalPatterns || {}),
            },
            securityPractices: {
                ...defaultSettings.securityPractices,
                ...(project?.settings?.securityPractices || {}),
            }
        };

        const latestSnapshot = project?.snapshots?.[project.snapshots.length - 1];
        set({
            activeProject: project,
            nodes: latestSnapshot?.nodes || [],
            edges: latestSnapshot?.edges || [],
            suggestions: latestSnapshot?.suggestions || [],
            projectSettings: projectSettings,
            generatedFiles: project?.generatedFiles || null,
        });
    },
    renameProject: async (projectId, newName) => {
        const { projects, activeProject } = get();
        if (!activeProject || activeProject.id !== projectId) return;

        await db.projects.update(projectId, { name: newName });
        
        const updatedProjects = projects.map(p =>
            p.id === projectId ? { ...p, name: newName } : p
        );
        set({
            projects: updatedProjects,
            activeProject: { ...activeProject, name: newName }
        });
    },
    updateProjectType: async (newType: ProjectType) => {
        const { activeProject } = get();
        if (!activeProject) return;
        const updatedProject = { ...activeProject, type: newType };
        await db.projects.update(activeProject.id, { type: newType });
        set({ activeProject: updatedProject });
    },
    setProjectSettings: (settings: ProjectSettings) => set({ projectSettings: settings }),
    openSettingsModal: () => set({ isSettingsModalOpen: true }),
    closeSettingsModal: () => set({ isSettingsModalOpen: false }),
    saveProjectToFile: () => {
        const { activeProject, nodes, edges, suggestions, projectSettings } = get();
        if (!activeProject) return;
        const projectData = {
            ...activeProject,
            snapshots: [{ timestamp: new Date(), nodes, edges, suggestions }],
            settings: projectSettings
        };
        const fileContent = JSON.stringify(projectData, null, 2);
        const blob = new Blob([fileContent], { type: 'application/json' });
        saveAs(blob, `${activeProject.name}.ftc`);
    },
    loadProjectFromFile: async (fileContent: string) => {
        try {
            const loadedProject = JSON.parse(fileContent);
            if (!loadedProject.id || !loadedProject.name || !loadedProject.snapshots) {
                throw new Error("Invalid project file format.");
            }
            const newId = uuidv4();
            const projectWithNewId = { ...loadedProject, id: newId };
            await db.projects.add(projectWithNewId);
            await get().loadProjects();
            get().setActiveProject(projectWithNewId);
            const latestSnapshot = projectWithNewId.snapshots[projectWithNewId.snapshots.length - 1];
            get().setNodes(latestSnapshot.nodes);
            get().setEdges(latestSnapshot.edges);
            get().setSuggestions(latestSnapshot.suggestions || []);
            console.log(`Project "${projectWithNewId.name}" loaded successfully.`);
        } catch (error) {
            console.error("Failed to load project file:", error);
            alert(`Failed to load project file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },
    updateProjectSnapshot: debounce(async () => {
        const { activeProject, nodes, edges, suggestions } = get();
        if (!activeProject) return;
        const projectInDb = await db.projects.get(activeProject.id);
        if (!projectInDb) return;
        const newSnapshot: ProjectSnapshot = { timestamp: new Date(), nodes, edges, suggestions };
        const updatedSnapshots = [...projectInDb.snapshots, newSnapshot].slice(-5);
        await db.projects.update(activeProject.id, { snapshots: updatedSnapshots });
    }, 1000),
});
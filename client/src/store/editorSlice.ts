import { StateCreator } from 'zustand';
import { CodeGenerationType } from '@/types/project';
import { AppState } from '.';
import { db } from '@/lib/db';

interface FileState {
    path: string;
    content: string;
}

export interface EditorState {
    codeGenerationType: CodeGenerationType;
    isEditorOpen: boolean;
    generatedFiles: Record<string, string> | null;
    activeFile: FileState | null;
    setCodeGenerationType: (type: CodeGenerationType) => void;
    openEditor: () => void;
    closeEditor: () => void;
    openFileInEditor: (path: string, content: string) => void;
    updateFileContent: (path: string, newContent: string) => void;
    setGeneratedFiles: (files: Record<string, string>) => void;
}

export const createEditorSlice: StateCreator<AppState, [], [], EditorState> = (set, get) => ({
    codeGenerationType: 'Flexible',
    isEditorOpen: false,
    generatedFiles: null,
    activeFile: null,
    setCodeGenerationType: (type) => set({ codeGenerationType: type }),
    openEditor: () => set({ isEditorOpen: true }),
    closeEditor: () => set({ isEditorOpen: false, activeFile: null }),
    openFileInEditor: (path, content) => set({ activeFile: { path, content } }),
    updateFileContent: (path, newContent) => {
        set(state => {
            if (state.generatedFiles) {
                return {
                    generatedFiles: { ...state.generatedFiles, [path]: newContent },
                    activeFile: { path, content: newContent },
                };
            }
            return {};
        });
    },
    setGeneratedFiles: (files: Record<string, string>) => {
        const { activeProject } = get();
        if (activeProject) {
            const updatedProject = { ...activeProject, generatedFiles: files };
            db.projects.update(activeProject.id, { generatedFiles: files });
            set({ generatedFiles: files, activeProject: updatedProject });
        } else {
            set({ generatedFiles: files });
        }
    },
});
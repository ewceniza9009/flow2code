import { create } from 'zustand';
import { ProjectState, createProjectSlice } from './projectSlice';
import { CanvasState, createCanvasSlice } from './canvasSlice';
import { UIState, createUISlice } from './uiSlice';
import { EditorState, createEditorSlice } from './editorSlice';
import { SuggestionsState, createSuggestionsSlice } from './suggestionsSlice';
import { Project, NodeData } from '@/types/project';

export type AppState = ProjectState & CanvasState & UIState & EditorState & SuggestionsState;

export const useStore = create<AppState>()((...a) => ({
    ...createProjectSlice(...a),
    ...createCanvasSlice(...a),
    ...createUISlice(...a),
    ...createEditorSlice(...a),
    ...createSuggestionsSlice(...a),
}));

export type { Project, NodeData };
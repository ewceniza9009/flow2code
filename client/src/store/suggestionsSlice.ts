import { StateCreator } from 'zustand';
import { AISuggestion } from '@/types/project';
import { AppState } from '.';

export interface SuggestionsState {
    isGenerating: boolean;
    isChecking: boolean;
    isSuggestionsPanelOpen: boolean;
    suggestions: AISuggestion[];
    highlightedElementIds: string[];
    setIsGenerating: (isGenerating: boolean) => void;
    setIsChecking: (isChecking: boolean) => void;
    setIsSuggestionsPanelOpen: (isOpen: boolean) => void;
    setSuggestions: (suggestions: AISuggestion[]) => void;
    setHighlightedElements: (ids: string[]) => void;
    applySuggestionAction: (suggestionId: string, action: AISuggestion['actions'][0]) => void;
    dismissSuggestion: (suggestionId: string) => void;
}

export const createSuggestionsSlice: StateCreator<AppState, [], [], SuggestionsState> = (set, get) => ({
    isGenerating: false,
    isChecking: false,
    isSuggestionsPanelOpen: false,
    suggestions: [],
    highlightedElementIds: [],
    setIsGenerating: (isGenerating) => set({ isGenerating }),
    setIsChecking: (isChecking) => set({ isChecking }),
    setIsSuggestionsPanelOpen: (isOpen) => {
        set({ isSuggestionsPanelOpen: isOpen });
        if (!isOpen) {
            set({ highlightedElementIds: [] });
        }
    },
    setSuggestions: (suggestions) => set({ suggestions: suggestions.map(s => ({ ...s, applied: false })) }),
    setHighlightedElements: (ids: string[]) => set({ highlightedElementIds: ids }),
    applySuggestionAction: (suggestionId, action) => {
        const { updateNodeData, updateEdgeData, deleteElement, addNode, updateProjectType, suggestions } = get();
        switch (action.action) {
            case 'add':
                if (action.payload.type) addNode(action.payload);
                break;
            case 'remove':
                if (action.payload.nodeId) deleteElement(action.payload.nodeId, true);
                else if (action.payload.edgeId) deleteElement(action.payload.edgeId, false);
                break;
            case 'update':
                if (action.payload.nodeId) {
                    const { nodeId, ...data } = action.payload;
                    updateNodeData(nodeId, data);
                } else if (action.payload.edgeId) {
                    const { edgeId, ...data } = action.payload;
                    updateEdgeData(edgeId, data);
                } else if (action.payload.architecture) {
                    updateProjectType(action.payload.architecture);
                }
                break;
            default:
                console.warn("Unknown suggestion action:", action.action);
        }
        const updatedSuggestions = suggestions.map(s => s.id === suggestionId ? { ...s, applied: true } : s);
        set({ suggestions: updatedSuggestions });
    },
    dismissSuggestion: (suggestionId) => {
        set(state => ({
            suggestions: state.suggestions.filter(s => s.id !== suggestionId)
        }));
    },
});
import { StateCreator } from 'zustand';
import { AppState } from '.';

interface ContextMenuState { id: string; top: number; left: number; }

export interface UIState {
    isNewProjectModalOpen: boolean;
    contextMenu: ContextMenuState | null;
    isDarkMode: boolean;
    isNodeLibraryOpen: boolean;
    isPropertiesPanelOpen: boolean;
    openNewProjectModal: () => void;
    closeNewProjectModal: () => void;
    openContextMenu: (payload: ContextMenuState) => void;
    closeContextMenu: () => void;
    toggleDarkMode: () => void;
    setIsNodeLibraryOpen: (isOpen: boolean) => void;
    setIsPropertiesPanelOpen: (isOpen: boolean) => void;
}

export const createUISlice: StateCreator<AppState, [], [], UIState> = (set) => ({
    isNewProjectModalOpen: false,
    contextMenu: null,
    isDarkMode: true,
    isNodeLibraryOpen: false,
    isPropertiesPanelOpen: false,
    openNewProjectModal: () => set({ isNewProjectModalOpen: true }),
    closeNewProjectModal: () => set({ isNewProjectModalOpen: false }),
    openContextMenu: (payload) => set({ contextMenu: payload }),
    closeContextMenu: () => set({ contextMenu: null }),
    toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode })),
    setIsNodeLibraryOpen: (isOpen: boolean) => set({ isNodeLibraryOpen: isOpen }),
    setIsPropertiesPanelOpen: (isOpen: boolean) => set({ isPropertiesPanelOpen: isOpen }),
});
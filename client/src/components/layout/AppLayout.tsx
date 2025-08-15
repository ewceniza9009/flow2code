import Header from './Header';
import NodeLibrary from '../sidebar/NodeLibrary';
import FlowCanvas from '../canvas/FlowCanvas';
import PropertiesPanel from "../sidebar/PropertiesPanel";
import { ReactFlowProvider } from "reactflow";
import { useStore } from '@/store';
import ProjectSettingsModal from '../modals/ProjectSettingsModal';
import SuggestionsPanel from '../sidebar/SuggestionPanel';
import FileTree from '../editor/FileTree';
import CodeEditor from '../editor/CodeEditor';
import React from 'react';

export default function AppLayout() {
  const { 
    isNodeLibraryOpen, 
    isPropertiesPanelOpen, 
    setIsNodeLibraryOpen, 
    setIsPropertiesPanelOpen, 
    isSettingsModalOpen,
    isSuggestionsPanelOpen,
    isEditorOpen,
    generatedFiles,
    countProjects,
  } = useStore();

  const toggleLeftPanel = () => {
    setIsNodeLibraryOpen(!isNodeLibraryOpen);
  };

  const toggleRightPanel = () => {
    setIsPropertiesPanelOpen(!isPropertiesPanelOpen);
  };

  if (countProjects === 0) {
    return (
      <div className="h-screen w-screen flex flex-col bg-background text-text-main dark:bg-dark-background dark:text-dark-text-main relative">
        <Header toggleLeftPanel={toggleLeftPanel} toggleRightPanel={toggleRightPanel} />

        <div className="flex items-center justify-center h-full relative">
          <img
            src="/flow2code.png"
            alt="Logo"
            className="opacity-20 absolute w-48 h-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-text-main dark:bg-dark-background dark:text-dark-text-main">
      <Header toggleLeftPanel={toggleLeftPanel} toggleRightPanel={toggleRightPanel} />
      <div className="flex-grow relative flex">
        {!isEditorOpen ? (
          <ReactFlowProvider>
            <FlowCanvas />
          </ReactFlowProvider>
        ) : (
          <div className="flex-grow flex overflow-hidden">
            {generatedFiles && <FileTree files={generatedFiles} />}
            <CodeEditor />
          </div>
        )}

        {isNodeLibraryOpen && !isEditorOpen && (
          <div className="absolute top-0 left-0 h-full w-[300px] z-10 transition-transform">
            <NodeLibrary />
          </div>
        )}

        {isPropertiesPanelOpen && !isEditorOpen && (
          <div className="absolute top-0 right-0 h-full w-[400px] z-10 transition-transform">
            <PropertiesPanel />
          </div>
        )}

        {isSuggestionsPanelOpen && <SuggestionsPanel />}
        
        {isSettingsModalOpen && <ProjectSettingsModal />}
      </div>
    </div>
  );
}
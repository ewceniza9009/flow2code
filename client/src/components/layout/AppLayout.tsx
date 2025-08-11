import Header from './Header';
import NodeLibrary from '../sidebar/NodeLibrary';
import FlowCanvas from '../canvas/FlowCanvas';
import PropertiesPanel from "../sidebar/PropertiesPanel";
import { ReactFlowProvider } from "reactflow";
import { useStore } from '@/store/useStore';

export default function AppLayout() {
  const { isNodeLibraryOpen, isPropertiesPanelOpen, setIsNodeLibraryOpen, setIsPropertiesPanelOpen } = useStore();

  const toggleLeftPanel = () => {
    setIsNodeLibraryOpen(!isNodeLibraryOpen);
  };

  const toggleRightPanel = () => {
    setIsPropertiesPanelOpen(!isPropertiesPanelOpen);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-text-main dark:bg-dark-background dark:text-dark-text-main">
      <Header toggleLeftPanel={toggleLeftPanel} toggleRightPanel={toggleRightPanel} />
      <div className="flex-grow relative">
        <ReactFlowProvider>
          <FlowCanvas />
        </ReactFlowProvider>

        {isNodeLibraryOpen && (
          <div className="absolute top-0 left-0 h-full w-[250px] z-10 transition-transform">
            <NodeLibrary />
          </div>
        )}

        {isPropertiesPanelOpen && (
          <div className="absolute top-0 right-0 h-full w-[300px] z-10 transition-transform">
            <PropertiesPanel />
          </div>
        )}
      </div>
    </div>
  );
}
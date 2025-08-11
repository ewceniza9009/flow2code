import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Header from './Header';
import NodeLibrary from '../sidebar/NodeLibrary';
import FlowCanvas from '../canvas/FlowCanvas';
import PropertiesPanel from "../sidebar/PropertiesPanel";
import { ReactFlowProvider } from "reactflow";

export default function AppLayout() {
  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      <Header />
      <div className="flex-grow">
        <ReactFlowProvider>
          <PanelGroup direction="horizontal">
            <Panel defaultSize={18} minSize={15} maxSize={25}>
              <NodeLibrary />
            </Panel>
            <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
            <Panel>
              <FlowCanvas />
            </Panel>
            <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
            <Panel defaultSize={20} minSize={15} maxSize={30}>
              <PropertiesPanel />
            </Panel>
          </PanelGroup>
        </ReactFlowProvider>
      </div>
    </div>
  );
}
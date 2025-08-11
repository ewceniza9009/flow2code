import { useStore } from "@/store/useStore";
import { X, Share2 as EdgeIcon, ArrowRightLeft } from "lucide-react";

export default function PropertiesPanel() {
  const { 
    selectedNode, setSelectedNode, updateNodeData,
    selectedEdge, setSelectedEdge, updateEdgeData
  } = useStore();
  
  const closePanel = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  if (!selectedNode && !selectedEdge) {
    return (
      <div className="h-full bg-surface p-4 text-text-muted text-sm">
        <p>Select a node or edge to see its properties.</p>
      </div>
    );
  }

  if (selectedNode) {
    return (
      <div key={selectedNode.id} className="h-full bg-surface p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text-main">Node Properties</h2>
          <button onClick={closePanel} className="text-text-muted hover:text-text-main"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Node Name</label>
            <input 
              type="text" 
              defaultValue={selectedNode.data.name} 
              onBlur={(e) => updateNodeData(selectedNode.id, { name: e.target.value })} 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Technology</label>
            <input type="text" value={selectedNode.data.techStack.join(', ')} readOnly className="w-full bg-background border-border rounded-md px-3 py-2 text-sm text-text-muted"/>
          </div>
        </div>
      </div>
    );
  }

  if (selectedEdge) {
    const handleEdgeTypeChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
        updateEdgeData(selectedEdge.id, { label: evt.target.value });
    };

    const handlePathTypeChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
        updateEdgeData(selectedEdge.id, { data: { pathType: evt.target.value } });
    };

    const handleReverseDirection = () => {
      updateEdgeData(selectedEdge.id, { reverse: true });
    };

    return (
      <div key={selectedEdge.id} className="h-full bg-surface p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text-main flex items-center gap-2"><EdgeIcon size={18}/> Edge Properties</h2>
          <button onClick={closePanel} className="text-text-muted hover:text-text-main"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Connection Type</label>
              <select 
                value={typeof selectedEdge.label === 'string' ? selectedEdge.label : 'REST'} 
                onChange={handleEdgeTypeChange}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              >
                  <option>REST</option>
                  <option>gRPC</option>
                  <option>WebSocket</option>
                  <option>Stream</option>
                  <option>DB</option>
              </select>
          </div>
          <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Path Style</label>
              <select 
                value={selectedEdge.data?.pathType || 'smoothstep'} 
                onChange={handlePathTypeChange}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              >
                  <option value="smoothstep">Smooth Step</option>
                  <option value="bezier">Bezier</option>
                  <option value="straight">Straight</option>
              </select>
          </div>
          <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Actions</label>
              <button
                onClick={handleReverseDirection}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-background border border-border rounded-md hover:bg-border transition-colors"
              >
                <ArrowRightLeft size={16} />
                Swap Direction
              </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
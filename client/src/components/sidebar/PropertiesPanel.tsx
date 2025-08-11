import { useStore } from "@/store/useStore";
import { X, Share2 as EdgeIcon, ArrowRightLeft, AlignLeft } from "lucide-react";
import Mde from 'react-simplemde-editor';
import "easymde/dist/easymde.min.css";
import { useMemo } from 'react';

export default function PropertiesPanel() {
  const {
    selectedNode, setSelectedNode, updateNodeData,
    selectedEdge, setSelectedEdge, updateEdgeData,
    swapEdgeDirection,
  } = useStore();

  const closePanel = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  const handleRequirementsChange = (value: string) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, { requirements: value });
    }
  };

  const mdeOptions = useMemo(() => ({
    spellChecker: false,
    status: false,
    toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        "image",
        "|",
        "preview"
    ] as any, // Cast to any to bypass strict type checking
  }), []);


  if (!selectedNode && !selectedEdge) {
    return (
      <div className="h-full bg-surface dark:bg-dark-surface p-3 text-text-muted dark:text-dark-text-muted text-sm">
        <p>Select a node or edge to see its properties.</p>
      </div>
    );
  }

  if (selectedNode) {
    return (
      <div key={selectedNode.id} className="h-full bg-surface dark:bg-dark-surface p-3 overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-text-main dark:text-dark-text-main">Node Properties</h2>
          <button onClick={closePanel} className="text-text-muted dark:text-dark-text-muted hover:text-text-main dark:hover:text-dark-text-main"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Node Name</label>
            <input
              type="text"
              defaultValue={selectedNode.data.name}
              onBlur={(e) => updateNodeData(selectedNode.id, { name: e.target.value })}
              className="w-full bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Technology</label>
            <input type="text" value={selectedNode.data.techStack.join(', ')} readOnly className="w-full bg-background dark:bg-dark-background border-border dark:border-dark-border rounded-md px-2 py-1 text-sm text-text-muted dark:text-dark-text-muted" />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">
              <AlignLeft size={12} />
              Requirements
            </label>
            <Mde
              value={selectedNode.data.requirements}
              onChange={handleRequirementsChange}
              options={mdeOptions}
              className="markdown-editor"
            />
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
      if(selectedEdge?.id) {
        swapEdgeDirection(selectedEdge.id);
      }
    };

    return (
      <div key={selectedEdge.id} className="h-full bg-surface dark:bg-dark-surface p-3 overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-text-main dark:text-dark-text-main flex items-center gap-1"><EdgeIcon size={16} /> Edge Properties</h2>
          <button onClick={closePanel} className="text-text-muted dark:text-dark-text-muted hover:text-text-main dark:hover:text-dark-text-main"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Connection Type</label>
            <select
              value={typeof selectedEdge.label === 'string' ? selectedEdge.label : 'REST'}
              onChange={handleEdgeTypeChange}
              className="w-full bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option>REST</option>
              <option>gRPC</option>
              <option>WebSocket</option>
              <option>Stream</option>
              <option>DB</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Path Style</label>
            <select
              value={selectedEdge.data?.pathType || 'smoothstep'}
              onChange={handlePathTypeChange}
              className="w-full bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="smoothstep">Smooth Step</option>
              <option value="bezier">Bezier</option>
              <option value="straight">Straight</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Actions</label>
            <button
              onClick={handleReverseDirection}
              className="w-full flex items-center justify-center gap-1 px-2 py-1 text-sm bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md hover:bg-border dark:hover:bg-dark-border transition-colors"
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
import { useStore } from "@/store/useStore";
import { X, Share2 as EdgeIcon, ArrowRightLeft, AlignLeft, Trash2, Palette } from "lucide-react";
import Mde from 'react-simplemde-editor';
import "easymde/dist/easymde.min.css";
import { useMemo } from 'react';
import { ANIMATED_ICONS } from "@/lib/constants";

export default function PropertiesPanel() {
  const {
    selectedNode, setSelectedNode, updateNodeData, updateNodeStyle,
    selectedEdge, setSelectedEdge, updateEdgeData,
    swapEdgeDirection,
    deleteElement,
    isDarkMode,
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
    toolbar: [ "bold", "italic", "heading", "|", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview" ] as any,
  }), []);


  if (!selectedNode && !selectedEdge) {
    return (
      <div className="h-full bg-surface dark:bg-dark-surface p-3 text-text-muted dark:text-dark-text-muted text-sm">
        <p>Select a node or edge to see its properties.</p>
      </div>
    );
  }

  if (selectedNode) {
    const defaultBgColor = isDarkMode ? '#374151' : '#ffffff';
    const defaultTextColor = isDarkMode ? '#f3f4f6' : '#1f2937';
    const isTransparent = selectedNode.style?.backgroundColor === 'transparent';

    return (
      <div key={selectedNode.id} className="h-full bg-surface dark:bg-dark-surface p-3 overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-text-main dark:text-dark-text-main">Node Properties</h2>
          <button onClick={closePanel} className="text-text-muted dark:text-dark-text-muted hover:text-text-main dark:hover:text-dark-text-main"><X size={18} /></button>
        </div>
        <div className="space-y-4 flex-grow">
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
            <label className="flex items-center gap-1 text-xs font-medium text-text-muted dark:text-dark-text-muted mb-2">
                <Palette size={12} />
                Appearance
            </label>
            <div className="flex items-start gap-4">
                <div className="flex-1 space-y-1">
                    <label htmlFor={`bg-color-${selectedNode.id}`} className="text-xs text-text-muted dark:text-dark-text-muted">Background</label>
                    <input 
                        type="color"
                        id={`bg-color-${selectedNode.id}`}
                        value={isTransparent ? '#ffffff' : selectedNode.style?.backgroundColor?.toString() || defaultBgColor}
                        onChange={(e) => updateNodeStyle(selectedNode.id, { backgroundColor: e.target.value })}
                        disabled={isTransparent}
                        className="w-full h-8 p-0 border-none cursor-pointer bg-transparent disabled:opacity-20"
                    />
                </div>
                <div className="flex-1 space-y-1">
                    <label htmlFor={`text-color-${selectedNode.id}`} className="text-xs text-text-muted dark:text-dark-text-muted">Text / Stroke</label>
                    <input 
                        type="color"
                        id={`text-color-${selectedNode.id}`}
                        value={selectedNode.style?.color?.toString() || defaultTextColor}
                        onChange={(e) => updateNodeStyle(selectedNode.id, { color: e.target.value })}
                        className="w-full h-8 p-0 border-none cursor-pointer bg-transparent"
                    />
                </div>
            </div>
            <label htmlFor={`bg-transparent-${selectedNode.id}`} className="mt-2 flex items-center gap-1.5 cursor-pointer text-xs text-text-muted dark:text-dark-text-muted">
                <input
                    type="checkbox"
                    id={`bg-transparent-${selectedNode.id}`}
                    checked={isTransparent}
                    onChange={(e) => {
                        const newBgColor = e.target.checked ? 'transparent' : defaultBgColor;
                        updateNodeStyle(selectedNode.id, { backgroundColor: newBgColor });
                    }}
                    className="h-3.5 w-3.5 rounded-sm border-border dark:border-dark-border"
                />
                Transparent Background
            </label>
          </div>          

          {selectedNode.data.techStack && selectedNode.data.category !== 'Annotations' &&(
            <div>
              <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Technology</label>
              <input type="text" value={selectedNode.data.techStack.join(', ')} readOnly className="w-full bg-background dark:bg-dark-background border-border dark:border-dark-border rounded-md px-2 py-1 text-sm text-text-muted dark:text-dark-text-muted" />
            </div>
          )}

          {selectedNode.data.requirements !== undefined && (
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
          )}
          
          {selectedNode.data.type === 'text-note' && (
             <div>
                <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Note Content</label>
                <textarea
                  defaultValue={selectedNode.data.text}
                  onBlur={(e) => updateNodeData(selectedNode.id, { text: e.target.value })}
                  className="w-full h-40 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
            </div>
          )}
        </div>
        <div className="mt-4">
            <button
                onClick={() => deleteElement(selectedNode.id, true)}
                className="w-full flex items-center justify-center gap-1 px-2 py-1 text-sm bg-red-500/10 text-red-400 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-colors"
            >
                <Trash2 size={16} />
                Delete Node
            </button>
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
    
    const handleAnimatedIconChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
        const iconKey = evt.target.value;
        updateEdgeData(selectedEdge.id, {
            data: { animatedIcon: iconKey === 'none' ? null : iconKey }
        });
    };

    const handleIconColorChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        updateEdgeData(selectedEdge.id, { data: { animatedIconColor: evt.target.value } });
    };

    return (
      <div key={selectedEdge.id} className="h-full bg-surface dark:bg-dark-surface p-3 overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-text-main dark:text-dark-text-main flex items-center gap-1"><EdgeIcon size={16} /> Edge Properties</h2>
          <button onClick={closePanel} className="text-text-muted dark:text-dark-text-muted hover:text-text-main dark:hover:text-dark-text-main"><X size={18} /></button>
        </div>
        <div className="space-y-3 flex-grow">
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
            <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Animated Icon</label>
            <select
              value={selectedEdge.data?.animatedIcon || 'none'}
              onChange={handleAnimatedIconChange}
              className="w-full bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {ANIMATED_ICONS.map(icon => (
                <option key={icon.key} value={icon.key}>{icon.label}</option>
              ))}
            </select>
          </div>

          {selectedEdge.data?.animatedIcon && (
            <div>
                <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Icon Color</label>
                <input 
                    type="color"
                    value={selectedEdge.data.animatedIconColor || '#818cf8'}
                    onChange={handleIconColorChange}
                    className="w-full h-8 p-0 border-none cursor-pointer bg-transparent"
                />
            </div>
          )}
          
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
        <div className="mt-4">
            <button
                onClick={() => deleteElement(selectedEdge.id, false)}
                className="w-full flex items-center justify-center gap-1 px-2 py-1 text-sm bg-red-500/10 text-red-400 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-colors"
            >
                <Trash2 size={16} />
                Delete Edge
            </button>
        </div>
      </div>
    );
  }

  return null;
}
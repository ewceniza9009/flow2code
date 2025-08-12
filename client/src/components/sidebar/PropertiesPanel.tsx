import { useStore, NodeData } from "@/store/useStore";
import { X, Share2 as EdgeIcon, ArrowRightLeft, AlignLeft, Trash2, Palette, Terminal, Code } from "lucide-react";
import Mde from 'react-simplemde-editor';
import "easymde/dist/easymde.min.css";
import { useMemo, useState } from 'react';
import { ANIMATED_ICONS } from "@/lib/constants";
import React from "react";
import { Node, Edge } from "reactflow";
import { NODE_DEFINITIONS } from "@/lib/nodes";

const ConfigPanel = ({ node, updateNodeData }: { node: Node<NodeData>; updateNodeData: (id: string, data: any) => void }) => {
  const [config, setConfig] = useState(JSON.stringify(node.data?.config, null, 2));

  const handleConfigChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfig(e.target.value);
  };

  const handleConfigBlur = () => {
    try {
      const newConfig = JSON.parse(config);
      updateNodeData(node.id, { config: newConfig });
    } catch (error) {
      console.error('Invalid JSON in config editor:', error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <div className="mt-4">
      <label className="flex items-center gap-1 text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">
        <Code size={12} />
        Configuration (JSON)
      </label>
      <textarea
        value={config}
        onChange={handleConfigChange}
        onBlur={handleConfigBlur}
        rows={6}
        className="w-full bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-primary focus:outline-none font-mono"
      />
    </div>
  );
};

const EdgeDetailsPanel = ({ edge, updateEdgeData }: { edge: Edge; updateEdgeData: (id: string, payload: { data?: any; }) => void }) => {
  const [endpoints, setEndpoints] = useState(edge.data?.endpoints?.join('\n') || '');

  const handleEndpointsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEndpoints(e.target.value);
  };

  const handleEndpointsBlur = () => {
    const newEndpoints = endpoints.split('\n').filter(Boolean);
    updateEdgeData(edge.id, { data: { ...edge.data, endpoints: newEndpoints } });
  };
  
  return (
    <div className="mt-4">
      <label className="flex items-center gap-1 text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">
        <Terminal size={12} />
        API Endpoints (one per line)
      </label>
      <textarea
        value={endpoints}
        onChange={handleEndpointsChange}
        onBlur={handleEndpointsBlur}
        rows={4}
        className="w-full bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-primary focus:outline-none font-mono"
      />
    </div>
  );
};


export default function PropertiesPanel() {
  const {
    selectedNode,
    setSelectedNode,
    updateNodeData,
    updateNodeStyle,
    selectedEdge,
    setSelectedEdge,
    updateEdgeData,
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
    toolbar: ["bold", "italic", "heading", "|", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview"] as any,
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
    const isShapeNode = selectedNode.type === 'shape';
    const isTransparent = isShapeNode
      ? selectedNode.data?.fillColor === 'transparent'
      : selectedNode.style?.backgroundColor === 'transparent';
    const opacity = isShapeNode ? selectedNode.data?.opacity ?? 1 : 1; // Default opacity to 1
    
    // Check if the node's type has a config property defined in NODE_DEFINITIONS
    const nodeDefinition = NODE_DEFINITIONS.flatMap(cat => cat.nodes).find(n => n.type === selectedNode.data?.type);
    const hasConfig = nodeDefinition?.config !== undefined;

    return (
      <div key={selectedNode.id} className="h-full bg-surface dark:bg-dark-surface p-3 overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-text-main dark:text-dark-text-main">Node Properties</h2>
          <button
            onClick={closePanel}
            className="text-text-muted dark:text-dark-text-muted hover:text-text-main dark:hover:text-dark-text-main"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 flex-grow">
          <div>
            <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Node Name</label>
            <input
              type="text"
              defaultValue={selectedNode.data?.name || ''}
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
                <label
                  htmlFor={`bg-color-${selectedNode.id}`}
                  className="text-xs text-text-muted dark:text-dark-text-muted"
                >
                  Background
                </label>
                <input
                  type="color"
                  id={`bg-color-${selectedNode.id}`}
                  value={
                    isTransparent
                      ? defaultBgColor
                      : isShapeNode
                      ? selectedNode.data?.fillColor || defaultBgColor
                      : selectedNode.style?.backgroundColor || defaultBgColor
                  }
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (isShapeNode) {
                      updateNodeData(selectedNode.id, { fillColor: newValue });
                    } else {
                      updateNodeStyle(selectedNode.id, { backgroundColor: newValue });
                    }
                  }}
                  disabled={isTransparent}
                  className="w-full h-8 p-0 border-none cursor-pointer bg-transparent disabled:opacity-20"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label
                  htmlFor={`text-color-${selectedNode.id}`}
                  className="text-xs text-text-muted dark:text-dark-text-muted"
                >
                  Text / Stroke
                </label>
                <input
                  type="color"
                  id={`text-color-${selectedNode.id}`}
                  value={
                    isShapeNode
                      ? selectedNode.data?.strokeColor || defaultTextColor
                      : selectedNode.style?.color || defaultTextColor
                  }
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (isShapeNode) {
                      updateNodeData(selectedNode.id, { strokeColor: newValue });
                    } else {
                      updateNodeStyle(selectedNode.id, { color: newValue });
                    }
                  }}
                  className="w-full h-8 p-0 border-none cursor-pointer bg-transparent"
                />
              </div>
            </div>
            <label
              htmlFor={`bg-transparent-${selectedNode.id}`}
              className="mt-2 flex items-center gap-1.5 cursor-pointer text-xs text-text-muted dark:text-dark-text-muted"
            >
              <input
                type="checkbox"
                id={`bg-transparent-${selectedNode.id}`}
                checked={isTransparent}
                onChange={(e) => {
                  const newValue = e.target.checked ? 'transparent' : defaultBgColor;
                  if (isShapeNode) {
                    updateNodeData(selectedNode.id, { fillColor: newValue });
                  } else {
                    updateNodeStyle(selectedNode.id, { backgroundColor: newValue });
                  }
                }}
                className="h-3.5 w-3.5 rounded-sm border-border dark:border-dark-border"
              />
              Transparent Background
            </label>
            {isShapeNode && (
              <div className="mt-2">
                <label
                  htmlFor={`opacity-${selectedNode.id}`}
                  className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1"
                >
                  Opacity
                </label>
                <input
                  type="range"
                  id={`opacity-${selectedNode.id}`}
                  min="0"
                  max="1"
                  step="0.1"
                  value={opacity}
                  key={`opacity-slider-${selectedNode.id}-${opacity}`}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value);
                    updateNodeData(selectedNode.id, { opacity: newValue });
                  }}
                  className="w-full h-8 cursor-pointer"
                />
                <span className="text-xs text-text-muted dark:text-dark-text-muted">{(opacity * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>

          {selectedNode.data?.techStack && selectedNode.data?.category !== 'Annotations' && (
            <div>
              <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">
                Technology
              </label>
              <input
                type="text"
                value={selectedNode.data.techStack.join(', ')}
                readOnly
                className="w-full bg-background dark:bg-dark-background border-border dark:border-dark-border rounded-md px-2 py-1 text-sm text-text-muted dark:text-dark-text-muted"
              />
            </div>
          )}
          
          {hasConfig && <ConfigPanel node={selectedNode} updateNodeData={updateNodeData} />}

          {selectedNode.data?.requirements !== undefined && (
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

          {selectedNode.data?.type === 'text-note' && (
            <div>
              <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">
                Note Content
              </label>
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
      if (selectedEdge?.id) {
        swapEdgeDirection(selectedEdge.id);
      }
    };

    const handleAnimatedIconChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
      const iconKey = evt.target.value;
      updateEdgeData(selectedEdge.id, {
        data: { animatedIcon: iconKey === 'none' ? null : iconKey },
      });
    };

    const handleIconColorChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
      updateEdgeData(selectedEdge.id, { data: { animatedIconColor: evt.target.value } });
    };

    const handleDashedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedEdge) {
        const isChecked = e.target.checked;
        updateEdgeData(selectedEdge.id, {
          style: { strokeDasharray: isChecked ? '5, 5' : undefined },
          data: { isAnimated: !isChecked && (selectedEdge.label === 'WebSocket' || selectedEdge.label === 'Stream') }
        });
      }
    };

    // New handler for edge color
    const handleEdgeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedEdge) {
        updateEdgeData(selectedEdge.id, {
          style: { stroke: e.target.value }
        });
      }
    };
    
    const hasEndpoints = selectedEdge.data?.endpoints !== undefined;

    return (
      <div key={selectedEdge.id} className="h-full bg-surface dark:bg-dark-surface p-3 overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-text-main dark:text-dark-text-main flex items-center gap-1">
            <EdgeIcon size={16} /> Edge Properties
          </h2>
          <button
            onClick={closePanel}
            className="text-text-muted dark:text-dark-text-muted hover:text-text-main dark:hover:text-dark-text-main"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3 flex-grow">
          <div>
            <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">
              Connection Type
            </label>
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
            <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">
              Path Style
            </label>
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
          
          {hasEndpoints && <EdgeDetailsPanel edge={selectedEdge} updateEdgeData={updateEdgeData} />}

          <div>
            <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">
              Animated Icon
            </label>
            <select
              value={selectedEdge.data?.animatedIcon || 'none'}
              onChange={handleAnimatedIconChange}
              className="w-full bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {ANIMATED_ICONS.map((icon) => (
                <option key={icon.key} value={icon.key}>
                  {icon.label}
                </option>
              ))}
            </select>
          </div>

          {selectedEdge.data?.animatedIcon && (
            <div>
              <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">
                Icon Color
              </label>
              <input
                type="color"
                value={selectedEdge.data.animatedIconColor || '#818cf8'}
                onChange={handleIconColorChange}
                className="w-full h-8 p-0 border-none cursor-pointer bg-transparent"
              />
            </div>
          )}
          
          {/* New Dashed Line Checkbox */}
          <div className="mt-2">
            <label
              htmlFor={`dashed-line-${selectedEdge.id}`}
              className="flex items-center gap-1.5 cursor-pointer text-xs text-text-muted dark:text-dark-text-muted"
            >
              <input
                type="checkbox"
                id={`dashed-line-${selectedEdge.id}`}
                checked={!!selectedEdge.style?.strokeDasharray} // Check if strokeDasharray exists
                onChange={handleDashedChange}
                className="h-3.5 w-3.5 rounded-sm border-border dark:border-dark-border"
              />
              Dashed Line
            </label>
          </div>

          {/* New Edge Color Picker */}
          <div className="mt-2">
            <label
              htmlFor={`edge-color-${selectedEdge.id}`}
              className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1"
            >
              Edge Color
            </label>
            <input
              type="color"
              id={`edge-color-${selectedEdge.id}`}
              value={selectedEdge.style?.stroke || (isDarkMode ? '#A78BFA' : '#6366F1')} // Default based on theme
              onChange={handleEdgeColorChange}
              className="w-full h-8 p-0 border-none cursor-pointer bg-transparent"
            />
          </div>


          <div>
            <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">
              Actions
            </label>
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
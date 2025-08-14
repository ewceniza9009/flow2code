import { create } from 'zustand';
import {
  Node, Edge, Connection,
  applyNodeChanges, applyEdgeChanges,
  OnNodesChange, OnEdgesChange, OnConnect,
  MarkerType
} from 'reactflow';
import { Project, ProjectSnapshot, ProjectSettings, CodeGenerationType, ProjectType } from '@/types/project';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';
import React from 'react';
import { NODE_DEFINITIONS, NodeCategory, NodeDefinition } from '@flow2code/shared';
import { saveAs } from 'file-saver';

export type NodeData = {
  subflow?: { nodes: Node<NodeData>[], edges: Edge[] };
  [key: string]: any;
};

export interface AISuggestion {
  id: string;
  type: 'architectural' | 'node' | 'edge';
  title: string;
  description: string;
  actions: { label: string; action: 'add' | 'remove' | 'update'; payload: any; }[];
  applied?: boolean;
}

interface ContextMenuState { id: string; top: number; left: number; }

interface AppState {
  activeProject: Project | null;
  projects: Project[];
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNode: Node<NodeData> | null;
  selectedEdge: Edge | null;
  isNewProjectModalOpen: boolean;
  isGenerating: boolean;
  isChecking: boolean;
  contextMenu: ContextMenuState | null;
  currentFlowId: string | null;
  isDarkMode: boolean;
  isNodeLibraryOpen: boolean;
  isPropertiesPanelOpen: boolean;
  isSuggestionsPanelOpen: boolean;
  suggestions: AISuggestion[];
  highlightedElementIds: string[];
  projectSettings: ProjectSettings;
  isSettingsModalOpen: boolean;
  codeGenerationType: CodeGenerationType;
  loadProjects: () => Promise<void>;
  setActiveProject: (project: Project | null) => void;
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (node: Node<NodeData> | null) => void;
  setSelectedEdge: (edge: Edge | null) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  updateNodeData: (nodeId: string, data: any) => void;
  updateNodeDimensions: (nodeId: string, dimensions: { width: number, height: number }) => void;
  updateNodeStyle: (nodeId: string, style: React.CSSProperties) => void;
  updateEdgeData: (edgeId: string, payload: { label?: string; data?: any; style?: React.CSSProperties }) => void;
  swapEdgeDirection: (edgeId: string) => void;
  deleteElement: (elementId: string, isNode: boolean) => void;
  enterSubflow: (nodeId: string) => void;
  exitSubflow: () => void;
  openContextMenu: (payload: ContextMenuState) => void;
  closeContextMenu: () => void;
  bringNodeToFront: (nodeId: string) => void;
  sendNodeToBack: (nodeId: string) => void;
  openNewProjectModal: () => void;
  closeNewProjectModal: () => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setIsChecking: (isChecking: boolean) => void;
  updateProjectSnapshot: () => void;
  renameProject: (projectId: string, newName: string) => Promise<void>;
  toggleDarkMode: () => void;
  setIsNodeLibraryOpen: (isOpen: boolean) => void;
  setIsPropertiesPanelOpen: (isOpen: boolean) => void;
  setIsSuggestionsPanelOpen: (isOpen: boolean) => void;
  setSuggestions: (suggestions: AISuggestion[]) => void;
  setHighlightedElements: (ids: string[]) => void;
  setProjectSettings: (settings: ProjectSettings) => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  setCodeGenerationType: (type: CodeGenerationType) => void;
  updateProjectType: (newType: ProjectType) => Promise<void>;
  addNode: (nodeData: any) => void;
  applySuggestionAction: (suggestionId: string, action: AISuggestion['actions'][0]) => void;
  dismissSuggestion: (suggestionId: string) => void;
  saveProjectToFile: () => void;
  loadProjectFromFile: (fileContent: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  activeProject: null, projects: [], nodes: [], edges: [],
  selectedNode: null, selectedEdge: null,
  isNewProjectModalOpen: false, isGenerating: false,
  isChecking: false,
  contextMenu: null, currentFlowId: null,
  isDarkMode: true,
  isNodeLibraryOpen: false,
  isPropertiesPanelOpen: false,
  isSuggestionsPanelOpen: false,
  suggestions: [],
  highlightedElementIds: [],
  projectSettings: {
    cloudProvider: 'Other',
    deploymentStrategy: 'Docker',
    cicdTooling: '',
  },
  isSettingsModalOpen: false,
  codeGenerationType: 'Flexible',

  loadProjects: async () => {
    const projectsFromDb = await db.projects.toArray();
    set({ projects: projectsFromDb });
  },
  setActiveProject: (project) => {
    const latestSnapshot = project?.snapshots?.[project.snapshots.length - 1];
    set({
      activeProject: project,
      nodes: latestSnapshot?.nodes || [],
      edges: latestSnapshot?.edges || [],
      suggestions: latestSnapshot?.suggestions || [],
      projectSettings: project?.settings || { cloudProvider: 'Other', deploymentStrategy: 'Docker', cicdTooling: '' }
    });
  },

  setNodes: (nodes) => {
    const { currentFlowId } = get();
    if (currentFlowId === null) {
      set({ nodes });
    } else {
      set((state) => ({
        nodes: state.nodes.map(n => {
          if (n.id === currentFlowId) {
            const subflow = n.data.subflow || { nodes: [], edges: [] };
            return { ...n, data: { ...n.data, subflow: { ...subflow, nodes } } };
          }
          return n;
        })
      }));
    }
  },
  setEdges: (edges) => {
    const { currentFlowId } = get();
    if (currentFlowId === null) {
      set({ edges });
    } else {
      set((state) => ({
        nodes: state.nodes.map(n => {
          if (n.id === currentFlowId) {
            const subflow = n.data.subflow || { nodes: [], edges: [] };
            return { ...n, data: { ...n.data, subflow: { ...subflow, edges } } };
          }
          return n;
        })
      }));
    }
  },

  setSelectedNode: (node) => set({ selectedNode: node, selectedEdge: null }),
  setSelectedEdge: (edge) => set({ selectedEdge: edge, selectedNode: null }),

  onNodesChange: (changes) => {
    set(state => {
        if (state.currentFlowId === null) {
            return { nodes: applyNodeChanges(changes, state.nodes) };
        }
        return {
            nodes: state.nodes.map(n => {
                if (n.id === state.currentFlowId) {
                    const subflow = n.data.subflow || { nodes: [], edges: [] };
                    return { ...n, data: { ...n.data, subflow: { ...subflow, nodes: applyNodeChanges(changes, subflow.nodes) } } };
                }
                return n;
            })
        }
    });
    get().updateProjectSnapshot();
  },

  onEdgesChange: (changes) => {
    set(state => {
        if (state.currentFlowId === null) {
            return { edges: applyEdgeChanges(changes, state.edges) };
        }
        return {
            nodes: state.nodes.map(n => {
                if (n.id === state.currentFlowId) {
                    const subflow = n.data.subflow || { nodes: [], edges: [] };
                    return { ...n, data: { ...n.data, subflow: { ...subflow, edges: applyEdgeChanges(changes, subflow.edges) } } };
                }
                return n;
            })
        }
    });
    get().updateProjectSnapshot();
  },

  onConnect: (connection: Connection) => {
    if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
        return;
    }
    const newEdge: Edge = {
      id: uuidv4(),
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'custom',
      label: "REST",
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { pathType: 'smoothstep', isAnimated: false, animatedIcon: null, animatedIconColor: '#818cf8', endpoints: [] }
    };
    set(state => {
        if (state.currentFlowId === null) {
            return { edges: [...state.edges, newEdge] };
        }
        return {
            nodes: state.nodes.map(n => {
                if (n.id === state.currentFlowId) {
                    const subflow = n.data.subflow || { nodes: [], edges: [] };
                    return { ...n, data: { ...n.data, subflow: { ...subflow, edges: [...subflow.edges, newEdge] } } };
                }
                return n;
            })
        }
    });
    get().updateProjectSnapshot();
  },

  updateNodeData: (nodeId, data) => {
    const { currentFlowId, nodes } = get();
    let updatedNodes: Node<NodeData>[];
    let updatedSelectedNode: Node<NodeData> | null = get().selectedNode;

    if (currentFlowId) {
      updatedNodes = nodes.map(n => {
        if (n.id === currentFlowId) {
          const subflow = n.data.subflow || { nodes: [], edges: [] };
          const newSubflowNodes = subflow.nodes.map(subNode =>
            subNode.id === nodeId ? { ...subNode, data: { ...subNode.data, ...data } } : subNode
          );
          if (get().selectedNode && get().selectedNode?.id === nodeId) {
            updatedSelectedNode = newSubflowNodes.find(sn => sn.id === nodeId) || updatedSelectedNode;
          }
          return { ...n, data: { ...n.data, subflow: { ...subflow, nodes: newSubflowNodes } } };
        }
        return n;
      });
    } else {
      updatedNodes = nodes.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      );
      if (get().selectedNode && get().selectedNode?.id === nodeId) {
        updatedSelectedNode = updatedNodes.find(n => n.id === nodeId) || updatedSelectedNode;
      }
    }

    set({ nodes: updatedNodes, selectedNode: updatedSelectedNode });
    get().updateProjectSnapshot();
  },

  updateNodeDimensions: (nodeId, dimensions) => {
    set(state => {
      let updatedNodes: Node<NodeData>[];
      let updatedSelectedNode: Node<NodeData> | null = state.selectedNode;

      if (state.currentFlowId) {
        updatedNodes = state.nodes.map(n => {
          if (n.id === state.currentFlowId) {
            const subflow = n.data.subflow || { nodes: [], edges: [] };
            const newSubflowNodes = subflow.nodes.map(subNode =>
              subNode.id === nodeId ? { ...subNode, style: { ...subNode.style, ...dimensions } } : subNode
            );
            if (state.selectedNode && state.selectedNode?.id === nodeId) {
              updatedSelectedNode = newSubflowNodes.find(sn => sn.id === nodeId) || updatedSelectedNode;
            }
            return { ...n, data: { ...n.data, subflow: { ...subflow, nodes: newSubflowNodes } } };
          }
          return n;
        });
      } else {
        updatedNodes = state.nodes.map(n =>
          n.id === nodeId ? { ...n, style: { ...n.style, ...dimensions } } : n
        );
        if (state.selectedNode && state.selectedNode?.id === nodeId) {
          updatedSelectedNode = updatedNodes.find(n => n.id === nodeId) || updatedSelectedNode;
        }
      }

      return {
        nodes: updatedNodes,
        selectedNode: updatedSelectedNode,
      };
    });
    get().updateProjectSnapshot();
  },

  updateNodeStyle: (nodeId, style) => {
    set(state => {
      let updatedNodes: Node<NodeData>[];
      let updatedSelectedNode: Node<NodeData> | null = state.selectedNode;

      if (state.currentFlowId) {
        updatedNodes = state.nodes.map(n => {
          if (n.id === state.currentFlowId) {
            const subflow = n.data.subflow || { nodes: [], edges: [] };
            const newSubflowNodes = subflow.nodes.map(subNode =>
              subNode.id === nodeId ? { ...subNode, style: { ...subNode.style, ...style } } : subNode
            );
            if (state.selectedNode && state.selectedNode?.id === nodeId) {
              updatedSelectedNode = newSubflowNodes.find(sn => sn.id === nodeId) || updatedSelectedNode;
            }
            return { ...n, data: { ...n.data, subflow: { ...subflow, nodes: newSubflowNodes } } };
          }
          return n;
        });
      } else {
        updatedNodes = state.nodes.map(n =>
          n.id === nodeId ? { ...n, style: { ...n.style, ...style } } : n
        );
        if (state.selectedNode && state.selectedNode?.id === nodeId) {
          updatedSelectedNode = updatedNodes.find(n => n.id === nodeId) || updatedSelectedNode;
        }
      }

      return {
        nodes: updatedNodes,
        selectedNode: updatedSelectedNode,
      };
    });
    get().updateProjectSnapshot();
  },

  updateEdgeData: (edgeId, payload) => {
    const { currentFlowId, nodes, edges } = get();
    let currentEdges = edges;
    if (currentFlowId) {
        const parentNode = nodes.find(n => n.id === currentFlowId);
        currentEdges = parentNode?.data.subflow?.edges || [];
    }

    const updatedAllEdges = currentEdges.map(e => {
        if (e.id === edgeId) {
            const updatedEdge = {
                ...e,
                data: { ...e.data, ...payload.data },
                style: { ...e.style, ...payload.style },
            };
            if (payload.label !== undefined) {
                updatedEdge.label = payload.label;
            }
            const currentLabel = updatedEdge.label;
            const isDashed = updatedEdge.style?.strokeDasharray !== undefined && updatedEdge.style.strokeDasharray !== 'none';
            updatedEdge.data.isAnimated = (currentLabel === 'WebSocket' || currentLabel === 'Stream') && !isDashed;
            updatedEdge.markerEnd = currentLabel === 'DB' ? { type: MarkerType.Arrow, width: 20, height: 20 } : { type: MarkerType.ArrowClosed };
            return updatedEdge;
        }
        return e;
    });

    if (currentFlowId) {
        const newNodes = nodes.map(n => {
            if (n.id === currentFlowId) {
                const subflow = n.data.subflow || { nodes: [], edges: [] };
                return { ...n, data: { ...n.data, subflow: { ...subflow, edges: updatedAllEdges } } };
            }
            return n;
        });
        set({ nodes: newNodes, selectedEdge: updatedAllEdges.find(e => e.id === edgeId) || get().selectedEdge });
    } else {
        set({ edges: updatedAllEdges, selectedEdge: updatedAllEdges.find(e => e.id === edgeId) || get().selectedEdge });
    }
    get().updateProjectSnapshot();
  },

  swapEdgeDirection: (edgeId: string) => {
    const swapLogic = (edge: Edge): Edge => {
      if (edge.id !== edgeId) return edge;
      const newSourceHandle = edge.targetHandle?.replace('target', 'source');
      const newTargetHandle = edge.sourceHandle?.replace('source', 'target');
      return { ...edge, source: edge.target, target: edge.source, sourceHandle: newSourceHandle, targetHandle: newTargetHandle, };
    };
    set(state => {
        if (state.currentFlowId === null) {
            const updatedEdges = state.edges.map(swapLogic);
            return { edges: updatedEdges, selectedEdge: updatedEdges.find(e => e.id === edgeId) || null };
        }
        const updatedNodes = state.nodes.map(n => {
            if (n.id === state.currentFlowId) {
                const subflow = n.data.subflow || { nodes: [], edges: [] };
                return { ...n, data: { ...n.data, subflow: { ...subflow, edges: subflow.edges.map(swapLogic) } } };
            }
            return n;
        });
        const parentNode = updatedNodes.find(n => n.id === state.currentFlowId);
        return { nodes: updatedNodes, selectedEdge: parentNode?.data.subflow?.edges?.find(e => e.id === edgeId) || null };
    });
    get().updateProjectSnapshot();
  },

  deleteElement: (elementId: string, isNode: boolean) => {
    set(state => {
        if (state.currentFlowId === null) {
            const newNodes = isNode ? state.nodes.filter(n => n.id !== elementId) : state.nodes;
            const newEdges = isNode
                ? state.edges.filter(e => e.source !== elementId && e.target !== elementId)
                : state.edges.filter(e => e.id !== elementId);
            return { nodes: newNodes, edges: newEdges, selectedNode: null, selectedEdge: null };
        }
        const newNodes = state.nodes.map(n => {
            if (n.id === state.currentFlowId) {
                const subflow = n.data.subflow || { nodes: [], edges: [] };
                let newSubflowNodes = subflow.nodes;
                let newSubflowEdges = subflow.edges;
                if (isNode) {
                    newSubflowNodes = subflow.nodes.filter(sn => sn.id !== elementId);
                    newSubflowEdges = subflow.edges.filter(e => e.source !== elementId && e.target !== elementId);
                } else {
                    newSubflowEdges = subflow.edges.filter(se => se.id !== elementId);
                }
                return { ...n, data: { ...n.data, subflow: { nodes: newSubflowNodes, edges: newSubflowEdges }}};
            }
            return n;
        });
        return { nodes: newNodes, selectedNode: null, selectedEdge: null };
    });
    get().updateProjectSnapshot();
  },

  enterSubflow: (nodeId) => {
    const parentNode = get().nodes.find(n => n.id === nodeId);
    if (parentNode && !parentNode.data.subflow) {
      const newNodes = get().nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, subflow: { nodes: [], edges: [] } } } : n);
      set({ nodes: newNodes });
    }
    set({ currentFlowId: nodeId, selectedNode: null, selectedEdge: null });
  },
  exitSubflow: () => set({ currentFlowId: null, selectedNode: null, selectedEdge: null }),

  openContextMenu: (payload) => set({ contextMenu: payload }),
  closeContextMenu: () => set({ contextMenu: null }),

  bringNodeToFront: (nodeId: string) => {
    const updater = (nodes: Node<NodeData>[]) => {
      if (nodes.length === 0) return [];
      const maxZ = Math.max(...nodes.map(n => Number(n.style?.zIndex || 0)));
      return nodes.map(n => n.id === nodeId ? { ...n, style: { ...n.style, zIndex: maxZ + 1 } } : n);
    };
    const { currentFlowId, nodes } = get();
    if (currentFlowId === null) {
      set({ nodes: updater(nodes) });
    } else {
      const newNodes = nodes.map(n => {
        if (n.id === currentFlowId) {
          const subflow = n.data.subflow || { nodes: [], edges: [] };
          return { ...n, data: { ...n.data, subflow: { ...subflow, nodes: updater(subflow.nodes) } } };
        }
        return n;
      });
      set({ nodes: newNodes });
    }
  },
  sendNodeToBack: (nodeId: string) => {
    const updater = (nodes: Node<NodeData>[]) => {
      if (nodes.length === 0) return [];
      const minZ = Math.min(...nodes.map(n => Number(n.style?.zIndex || 0)));
      return nodes.map(n => n.id === nodeId ? { ...n, style: { ...n.style, zIndex: minZ - 1 } } : n);
    };
    const { currentFlowId, nodes } = get();
    if (currentFlowId === null) {
      set({ nodes: updater(nodes) });
    } else {
      const newNodes = nodes.map(n => {
        if (n.id === currentFlowId) {
          const subflow = n.data.subflow || { nodes: [], edges: [] };
          return { ...n, data: { ...n.data, subflow: { ...subflow, nodes: updater(subflow.nodes) } } };
        }
        return n;
      });
      set({ nodes: newNodes });
    }
  },

  openNewProjectModal: () => set({ isNewProjectModalOpen: true }),
  closeNewProjectModal: () => set({ isNewProjectModalOpen: false }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setIsChecking: (isChecking) => set({ isChecking }),
  updateProjectSnapshot: debounce(async () => {
    const { activeProject, nodes, edges, suggestions } = get();
    if (!activeProject) return;

    const projectInDb = await db.projects.get(activeProject.id);
    if (!projectInDb) return;

    // Correctly save the current suggestions from the state
    const newSnapshot: ProjectSnapshot = { timestamp: new Date(), nodes, edges, suggestions };
    
    const updatedSnapshots = [...projectInDb.snapshots, newSnapshot].slice(-5);
    
    await db.projects.update(activeProject.id, {
      snapshots: updatedSnapshots
    });
  }, 1000),

  renameProject: async (projectId, newName) => {
    const { projects, activeProject } = get();
    if (!activeProject || activeProject.id !== projectId) return;

    await db.projects.update(projectId, { name: newName });
    
    const updatedProjects = projects.map(p =>
      p.id === projectId ? { ...p, name: newName } : p
    );
    set({
      projects: updatedProjects,
      activeProject: { ...activeProject, name: newName }
    });
  },

  toggleDarkMode: () => {
    set(state => ({ isDarkMode: !state.isDarkMode }));
  },
  setIsNodeLibraryOpen: (isOpen) => set({ isNodeLibraryOpen: isOpen }),
  setIsPropertiesPanelOpen: (isOpen) => set({ isPropertiesPanelOpen: isOpen }),
  setIsSuggestionsPanelOpen: (isOpen) => {
    set({ isSuggestionsPanelOpen: isOpen });
    if (!isOpen) {
      set({ highlightedElementIds: [] });
    }
  },
  setSuggestions: (suggestions) => set({ suggestions: suggestions.map(s => ({ ...s, applied: false })) }),
  setHighlightedElements: (ids: string[]) => set({ highlightedElementIds: ids }),
  setProjectSettings: (settings: ProjectSettings) => set({ projectSettings: settings }),
  openSettingsModal: () => set({ isSettingsModalOpen: true }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false }),
  setCodeGenerationType: (type) => set({ codeGenerationType: type }),

  addNode: (nodeData) => {
    const { type, name, ...restData } = nodeData;
    const nodeDefinition = NODE_DEFINITIONS.flatMap((c: NodeCategory) => c.nodes).find((n: NodeDefinition) => n.type === type);
    if (!nodeDefinition) {
      console.error("Node definition not found for type:", type);
      return;
    }

    const initialData: NodeData = { ...nodeDefinition, ...nodeDefinition.data, name, ...restData };
    
    if (nodeDefinition.type === 'text-note') {
      initialData.text = 'Editable Note';
    } else if (nodeDefinition.category !== 'Annotations' && nodeDefinition.type !== 'group') {
      initialData.requirements = `A standard ${name}.`;
    }
    
    const newNode: Node<NodeData> = {
      id: uuidv4(),
      type: nodeDefinition.category === 'Annotations' || nodeDefinition.type === 'group' ? nodeDefinition.type : 'custom',
      position: { x: 200, y: 200 },
      data: initialData,
      style: { width: 256, height: 160 },
    };

    const { nodes } = get();
    get().setNodes([...nodes, newNode]);
  },
  
  applySuggestionAction: (suggestionId, action) => {
    const { updateNodeData, updateEdgeData, deleteElement, addNode, updateProjectType, suggestions } = get();

    switch (action.action) {
      case 'add':
        if (action.payload.type) {
          addNode(action.payload);
        }
        break;
      case 'remove':
        if (action.payload.nodeId) {
          deleteElement(action.payload.nodeId, true);
        } else if (action.payload.edgeId) {
          deleteElement(action.payload.edgeId, false);
        }
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

  updateProjectType: async (newType: ProjectType) => {
    const { activeProject } = get();
    if (!activeProject) return;

    const updatedProject = { ...activeProject, type: newType };

    await db.projects.update(activeProject.id, { type: newType });
    set({ activeProject: updatedProject });
  },
  
  saveProjectToFile: () => {
    const { activeProject, nodes, edges, suggestions, projectSettings } = get();
    if (!activeProject) return;

    const projectData = {
      ...activeProject,
      snapshots: [{
        timestamp: new Date(),
        nodes,
        edges,
        suggestions,
      }],
      settings: projectSettings
    };
    
    const fileContent = JSON.stringify(projectData, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });
    saveAs(blob, `${activeProject.name}.ftc`);
  },

  loadProjectFromFile: async (fileContent: string) => {
    try {
      const loadedProject = JSON.parse(fileContent);
      
      if (!loadedProject.id || !loadedProject.name || !loadedProject.snapshots) {
        throw new Error("Invalid project file format.");
      }
      
      const newId = uuidv4();
      const projectWithNewId = { ...loadedProject, id: newId };

      await db.projects.add(projectWithNewId);
      await get().loadProjects();
      get().setActiveProject(projectWithNewId);
      
      const latestSnapshot = projectWithNewId.snapshots[projectWithNewId.snapshots.length - 1];
      get().setNodes(latestSnapshot.nodes);
      get().setEdges(latestSnapshot.edges);
      get().setSuggestions(latestSnapshot.suggestions);
      
      console.log(`Project "${projectWithNewId.name}" loaded successfully.`);
    } catch (error) {
      console.error("Failed to load project file:", error);
      alert(`Failed to load project file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
}));
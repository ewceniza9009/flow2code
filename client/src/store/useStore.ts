import { create } from 'zustand';
import {
  Node, Edge, Connection,
  applyNodeChanges, applyEdgeChanges,
  OnNodesChange, OnEdgesChange, OnConnect,
  MarkerType
} from 'reactflow';
import { Project, ProjectSnapshot } from '@/types/project';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';

export type NodeData = {
  subflow?: { nodes: Node<NodeData>[], edges: Edge[] };
  [key: string]: any;
};

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
  contextMenu: ContextMenuState | null;
  currentFlowId: string | null;
  isDarkMode: boolean;
  isNodeLibraryOpen: boolean;
  isPropertiesPanelOpen: boolean;
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
  updateEdgeData: (edgeId: string, data: any) => void;
  swapEdgeDirection: (edgeId: string) => void;
  enterSubflow: (nodeId: string) => void;
  exitSubflow: () => void;
  openContextMenu: (payload: ContextMenuState) => void;
  closeContextMenu: () => void;
  bringNodeToFront: (nodeId: string) => void;
  sendNodeToBack: (nodeId: string) => void;
  openNewProjectModal: () => void;
  closeNewProjectModal: () => void;
  setIsGenerating: (isGenerating: boolean) => void;
  updateProjectSnapshot: () => void;
  toggleDarkMode: () => void;
  setIsNodeLibraryOpen: (isOpen: boolean) => void;
  setIsPropertiesPanelOpen: (isOpen: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  activeProject: null, projects: [], nodes: [], edges: [],
  selectedNode: null, selectedEdge: null,
  isNewProjectModalOpen: false, isGenerating: false,
  contextMenu: null, currentFlowId: null,
  isDarkMode: true,
  isNodeLibraryOpen: false,
  isPropertiesPanelOpen: false,

  loadProjects: async () => {
    const projectsFromDb = await db.projects.toArray();
    set({ projects: projectsFromDb });
  },
  setActiveProject: (project) => set({ activeProject: project }),

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
    const { currentFlowId, nodes } = get();
    if (currentFlowId === null) {
      set({ nodes: applyNodeChanges(changes, nodes) });
    } else {
      const newNodes = nodes.map(n => {
        if (n.id === currentFlowId) {
          const subflow = n.data.subflow || { nodes: [], edges: [] };
          const newSubflowNodes = applyNodeChanges(changes, subflow.nodes);
          return { ...n, data: { ...n.data, subflow: { nodes: newSubflowNodes, edges: subflow.edges } } };
        }
        return n;
      });
      set({ nodes: newNodes });
    }
    get().updateProjectSnapshot();
  },

  onEdgesChange: (changes) => {
    const { currentFlowId, nodes, edges } = get();
    if (currentFlowId === null) {
      set({ edges: applyEdgeChanges(changes, edges) });
    } else {
      const newNodes = nodes.map(n => {
        if (n.id === currentFlowId) {
          const subflow = n.data.subflow || { nodes: [], edges: [] };
          const newSubflowEdges = applyEdgeChanges(changes, subflow.edges);
          return { ...n, data: { ...n.data, subflow: { nodes: subflow.nodes, edges: newSubflowEdges } } };
        }
        return n;
      });
      set({ nodes: newNodes });
    }
    get().updateProjectSnapshot();
  },

  onConnect: (connection: Connection) => {
    // Explicitly check for all required properties to prevent errors.
    if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
        console.error("Connection failed: Missing source, target, or handle IDs.");
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
        data: { pathType: 'smoothstep', isAnimated: false }
    };
    
    const { currentFlowId, nodes, edges } = get();
    if (currentFlowId === null) {
      set({ edges: [...edges, newEdge] });
    } else {
      const newNodes = nodes.map(n => {
        if (n.id === currentFlowId) {
          const subflow = n.data.subflow || { nodes: [], edges: [] };
          return { ...n, data: { ...n.data, subflow: { ...subflow, edges: [...subflow.edges, newEdge] } } };
        }
        return n;
      });
      set({ nodes: newNodes });
    }
    get().updateProjectSnapshot();
  },

  updateNodeData: (nodeId, data) => {
    const updater = (n: Node<NodeData>) => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n;
    const { currentFlowId, nodes } = get();
    if (currentFlowId === null) {
      set({ nodes: nodes.map(updater) });
    } else {
      const newNodes = nodes.map(n => {
        if (n.id === currentFlowId) {
          const subflow = n.data.subflow || { nodes: [], edges: [] };
          return { ...n, data: { ...n.data, subflow: { ...subflow, nodes: subflow.nodes.map(updater) } } };
        }
        return n;
      });
      set({ nodes: newNodes });
    }
    get().updateProjectSnapshot();
  },

  updateNodeDimensions: (nodeId, dimensions) => {
    const updater = (n: Node<NodeData>) => n.id === nodeId ? { ...n, style: { ...n.style, ...dimensions } } : n;
    const { currentFlowId, nodes } = get();
    if (currentFlowId === null) {
      set({ nodes: nodes.map(updater) });
    } else {
      const newNodes = nodes.map(n => {
        if (n.id === currentFlowId) {
          const subflow = n.data.subflow || { nodes: [], edges: [] };
          return { ...n, data: { ...n.data, subflow: { ...subflow, nodes: subflow.nodes.map(updater) } } };
        }
        return n;
      });
      set({ nodes: newNodes });
    }
    get().updateProjectSnapshot();
  },

  updateEdgeData: (edgeId, payload) => {
    let updatedEdgeInstance: Edge | null = null;
    const updater = (e: Edge) => {
      if (e.id === edgeId) {
        let updatedEdge = { ...e, data: { ...e.data } };
        
        if (payload.label !== undefined) {
          updatedEdge.label = payload.label;
        }
        if (payload.data) {
          updatedEdge.data = { ...updatedEdge.data, ...payload.data };
        }

        const currentLabel = updatedEdge.label;
        updatedEdge.data.isAnimated = currentLabel === 'WebSocket' || currentLabel === 'Stream';
        updatedEdge.markerEnd = currentLabel === 'DB' ? { type: MarkerType.Arrow, width: 20, height: 20 } : { type: MarkerType.ArrowClosed };

        updatedEdgeInstance = updatedEdge;
        return updatedEdge;
      }
      return e;
    };

    const { currentFlowId, nodes, edges } = get();

    if (currentFlowId === null) {
      const newEdges = edges.map(updater);
      set(state => ({
        edges: newEdges,
        selectedEdge: state.selectedEdge?.id === edgeId ? updatedEdgeInstance : state.selectedEdge,
      }));
    } else {
      const newNodes = nodes.map(n => {
        if (n.id === currentFlowId) {
          const subflow = n.data.subflow || { nodes: [], edges: [] };
          const newSubflowEdges = subflow.edges.map(updater);
          return { ...n, data: { ...n.data, subflow: { ...subflow, edges: newSubflowEdges } } };
        }
        return n;
      });
      set(state => ({
        nodes: newNodes,
        selectedEdge: state.selectedEdge?.id === edgeId ? updatedEdgeInstance : state.selectedEdge,
      }));
    }
    get().updateProjectSnapshot();
  },

  swapEdgeDirection: (edgeId: string) => {
    const { currentFlowId, nodes, edges } = get();

    const swapLogic = (edge: Edge): Edge => {
      if (edge.id !== edgeId) return edge;
      
      const newSourceHandle = edge.targetHandle?.replace('target', 'source');
      const newTargetHandle = edge.sourceHandle?.replace('source', 'target');
      
      return {
        ...edge,
        source: edge.target,
        target: edge.source,
        sourceHandle: newSourceHandle,
        targetHandle: newTargetHandle,
      };
    };
    
    if (currentFlowId === null) {
      const updatedEdges = edges.map(swapLogic);
      const newSelectedEdge = updatedEdges.find(e => e.id === edgeId);
      set({ edges: updatedEdges, selectedEdge: newSelectedEdge || null });
    } else {
      const newNodes = nodes.map(n => {
        if (n.id === currentFlowId) {
          const subflow = n.data.subflow || { nodes: [], edges: [] };
          const updatedSubflowEdges = subflow.edges.map(swapLogic);
          return { ...n, data: { ...n.data, subflow: { ...subflow, edges: updatedSubflowEdges } } };
        }
        return n;
      });
      const parentNode = newNodes.find(n => n.id === currentFlowId);
      const newSelectedEdge = parentNode?.data.subflow?.edges.find(e => e.id === edgeId);
      set({ nodes: newNodes, selectedEdge: newSelectedEdge || null });
    }

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

  updateProjectSnapshot: debounce(() => {
    const { activeProject, nodes, edges } = get();
    if (!activeProject) return;
    const newSnapshot: ProjectSnapshot = { timestamp: new Date(), nodes, edges };
    db.projects.update(activeProject.id, {
      snapshots: [...activeProject.snapshots.slice(0, -1), newSnapshot]
    });
  }, 1000),

  toggleDarkMode: () => {
    set(state => ({ isDarkMode: !state.isDarkMode }));
  },
  setIsNodeLibraryOpen: (isOpen) => set({ isNodeLibraryOpen: isOpen }),
  setIsPropertiesPanelOpen: (isOpen) => set({ isPropertiesPanelOpen: isOpen }),
}));
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  Node,
  IsValidConnection,
  Connection,
  Edge,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore, NodeData } from '@/store/useStore';
import { useCallback, useMemo, useRef } from 'react';
import CustomNode from './CustomNode';
import { v4 as uuidv4 } from 'uuid';
import { NODE_DEFINITIONS } from '@/lib/nodes';
import { GroupNode } from './GroupNode';
import ContextMenu from './ContextMenu';
import CustomEdge from './CustomEdge';
import TextNode from './TextNode';
import ShapeNode from './ShapeNode';
import IconNode from './IconNode';

const nodeTypes = {
  custom: CustomNode,
  group: GroupNode,
  'text-note': TextNode,
  shape: ShapeNode,
  icon: IconNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export default function FlowCanvas() {
  const {
    nodes: mainNodes,
    edges: mainEdges,
    currentFlowId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    activeProject,
    setSelectedNode,
    setSelectedEdge,
    openContextMenu,
    closeContextMenu,
    enterSubflow,
  } = useStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();

  const displayedFlow = useMemo(() => {
    if (currentFlowId === null) {
      return { nodes: mainNodes, edges: mainEdges };
    }
    const parentNode = mainNodes.find(n => n.id === currentFlowId);
    return parentNode?.data.subflow || { nodes: [], edges: [] };
  }, [currentFlowId, mainNodes, mainEdges]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      closeContextMenu();
      
      const type = event.dataTransfer.getData('application/reactflow');
      const name = event.dataTransfer.getData('application/reactflow-nodename');
      if (!type || !name) return;

      const nodeDefinition = NODE_DEFINITIONS.flatMap(c => c.nodes).find(n => n.name === name);
      if (!nodeDefinition) return;

      const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      
      const isAnnotation = nodeDefinition.category === 'Annotations';
      const isGroup = nodeDefinition.type === 'group';
      
      const initialData: NodeData = { ...nodeDefinition, ...nodeDefinition.data };

      if (nodeDefinition.type === 'text-note') {
        initialData.text = 'Editable Note';
      } else if (!isAnnotation && !isGroup) {
        initialData.requirements = `A standard ${nodeDefinition.name}.`;
      }
        
      let initialStyle = isGroup
        ? { width: 500, height: 400 }
        : isAnnotation
          ? { width: 150, height: 100 }
          : { width: 256, height: 160 };

      if (nodeDefinition.type === 'icon') {
        initialStyle = { width: 80, height: 80 };
      }
      
      const newNode: Node<NodeData> = {
        id: uuidv4(),
        type: nodeDefinition.type,
        position,
        data: initialData,
        style: initialStyle,
      };

      const nextNodes = [...displayedFlow.nodes, newNode];
      setNodes(nextNodes);
    },
    [closeContextMenu, displayedFlow.nodes, setNodes, reactFlowInstance]
  );
  
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;

      const pane = reactFlowWrapper.current.getBoundingClientRect();
      setSelectedNode(node);
      openContextMenu({
        id: node.id,
        top: event.clientY - pane.top,
        left: event.clientX - pane.left,
      });
    },
    [openContextMenu, setSelectedNode]
  );

  const onNodeDoubleClick = (_: React.MouseEvent, node: Node) => {
    if (node.data.category !== 'Annotations' && node.type !== 'group') {
      enterSubflow(node.id);
    }
  };
  
  const isValidConnection: IsValidConnection = useCallback(
    (connection: Connection | Edge) => {
      const allNodes = displayedFlow.nodes;
      const sourceNode = allNodes.find(n => n.id === connection.source);
      const targetNode = allNodes.find(n => n.id === connection.target);
      
      if (sourceNode?.data.category === 'Annotations' || targetNode?.data.category === 'Annotations') {
        return false;
      }

      if (!connection.source || !connection.target || connection.source === connection.target || connection.sourceHandle === connection.targetHandle) {
        return false;
      }
      
      return true;
    },
    [displayedFlow.nodes]
  );

  if (!activeProject) {
    return <div className="flex items-center justify-center h-full text-text-muted">Create a new project to begin.</div>;
  }

  return (
    <div ref={reactFlowWrapper} className="h-full w-full relative" onClick={closeContextMenu} onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={displayedFlow.nodes}
        edges={displayedFlow.edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, node) => setSelectedNode(node)}
        onEdgeClick={(_, edge) => setSelectedEdge(edge)}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeContextMenu={onNodeContextMenu}
        fitView
        isValidConnection={isValidConnection}
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
      <ContextMenu />
    </div>
  );
}
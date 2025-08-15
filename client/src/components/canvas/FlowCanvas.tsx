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
import { useStore, NodeData } from '@/store';
import { useCallback, useMemo, useRef } from 'react';
import CustomNode from './CustomNode';
import { v4 as uuidv4 } from 'uuid';
import { NODE_DEFINITIONS } from "@flow2code/shared";
import { GroupNode } from './GroupNode';
import ContextMenu from './ContextMenu';
import CustomEdge from './CustomEdge';
import TextNode from './TextNode';
import ShapeNode from './ShapeNode';
import IconNode from './IconNode';
import FlowchartNode from './FlowchartNode';

const nodeTypes = {
  custom: CustomNode,
  group: GroupNode,
  'text-note': TextNode,
  shape: ShapeNode,
  icon: IconNode,
  flowchart: FlowchartNode,
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
    highlightedElementIds,
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
     
      const name = event.dataTransfer.getData('application/reactflow-nodename');
      if (!name) return;

      const nodeDefinition = NODE_DEFINITIONS.flatMap(c => c.nodes).find(n => n.name === name);
      if (!nodeDefinition) return;

      const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
     
      let reactFlowType = 'custom';
      if (nodeDefinition.type === 'text-note' || nodeDefinition.type === 'shape' || nodeDefinition.type === 'icon' || nodeDefinition.type === 'flowchart' || nodeDefinition.type === 'group') {
        reactFlowType = nodeDefinition.type;
      }

      const isAnnotation = nodeDefinition.category === 'Annotations';
      const isGroup = nodeDefinition.type === 'group';
      const isFlowchart = nodeDefinition.category === 'Logic & Flow';
     
      const initialData: NodeData = { ...nodeDefinition, ...nodeDefinition.data };

      if (nodeDefinition.type === 'text-note') {
        initialData.text = 'Editable Note';
      } else if (!isAnnotation && !isGroup && !isFlowchart) {
        initialData.requirements = `A standard ${nodeDefinition.name}.`;
      }
      
      let initialStyle = {};
      if (isGroup) {
        initialStyle = { width: 500, height: 400 };
      } else if (isFlowchart) {
        initialStyle = { width: 200, height: 120 };
      } else if (isAnnotation) {
        initialStyle = nodeDefinition.type === 'icon' ? { width: 80, height: 80 } : { width: 150, height: 100 };
      } else {
        initialStyle = { width: 256, height: 160 };
      }
     
      const newNode: Node<NodeData> = {
        id: uuidv4(),
        type: reactFlowType,
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
    if (node.data.category !== 'Annotations' && node.data.category !== 'Logic & Flow' && node.type !== 'group') {
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

      if (!connection.source || !connection.target || connection.source === connection.target) {
        return false;
      }
      
      return true;
    },
    [displayedFlow.nodes]
  );
  
  const nodesWithHighlight = useMemo(() => {
    return displayedFlow.nodes.map(node => ({
      ...node,
      isHighlighted: highlightedElementIds.includes(node.id)
    }));
  }, [displayedFlow.nodes, highlightedElementIds]);

  const edgesWithHighlight = useMemo(() => {
    return displayedFlow.edges.map(edge => ({
      ...edge,
      isHighlighted: highlightedElementIds.includes(edge.id)
    }));
  }, [displayedFlow.edges, highlightedElementIds]);

  return (
    <div ref={reactFlowWrapper} className="h-full w-full relative" onClick={closeContextMenu} onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodesWithHighlight}
        edges={edgesWithHighlight}
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
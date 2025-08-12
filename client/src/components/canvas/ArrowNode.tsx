import { NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { useStore, NodeData } from '@/store/useStore';

const ArrowNode = ({ id, selected }: NodeProps<NodeData>) => {
  const { updateNodeDimensions } = useStore();

  return (
    <div className="w-full h-full">
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={40}
        onResizeEnd={(_event, params) => {
          updateNodeDimensions(id, { width: params.width, height: params.height });
        }}
      />
      <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" className="fill-primary" />
            </marker>
        </defs>
        <line x1="0" y1="25" x2="90" y2="25" className="stroke-primary" strokeWidth="5" markerEnd="url(#arrowhead)" />
      </svg>
    </div>
  );
};

export default ArrowNode;
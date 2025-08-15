import { NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { useStore, NodeData } from '@/store';
import { Handle, Position } from 'reactflow';

export const GroupNode = ({ id, data, selected }: NodeProps<NodeData>) => {
  const { updateNodeDimensions } = useStore();

  return (
    <div>
      <NodeResizer
        isVisible={selected}
        minWidth={300}
        minHeight={200}
        onResizeEnd={(_event, params) => {
          updateNodeDimensions(id, { width: params.width, height: params.height });
        }}
      />
      <div className="bg-surface/20 text-text-main p-2 rounded-t-lg text-sm font-bold">
        {data.name || 'Group'}
      </div>
      <Handle type="target" position={Position.Top} style={{ background: '#0d9488' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#0d9488' }} />
    </div>
  );
};
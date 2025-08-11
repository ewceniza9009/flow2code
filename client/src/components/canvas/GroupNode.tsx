import { NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { useStore, NodeData } from '@/store/useStore';

export const GroupNode = ({ id, data, selected }: NodeProps<NodeData>) => {
  const { updateNodeDimensions } = useStore();

  return (
    <div className="bg-surface/50 border-2 border-dashed border-border rounded-lg w-full h-full">
      <NodeResizer
        isVisible={selected}
        minWidth={300}
        minHeight={200}
        onResizeEnd={(_event, params) => {
            updateNodeDimensions(id, { width: params.width, height: params.height });
        }}
      />
      <div className="bg-surface text-text-main p-2 rounded-t-md text-sm font-bold">
        {data.name || 'Group'}
      </div>
    </div>
  );
};
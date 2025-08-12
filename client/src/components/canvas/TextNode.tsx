import { NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { useStore, NodeData } from '@/store/useStore';

const TextNode = ({ id, data, selected }: NodeProps<NodeData>) => {
  const { updateNodeDimensions, updateNodeData } = useStore();

  return (
    <div className="w-full h-full">
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={40}
        onResizeEnd={(_event, params) => {
          updateNodeDimensions(id, { width: params.width, height: params.height });
        }}
      />
      <textarea
        defaultValue={data.text || 'Enter text...'}
        onBlur={(e) => updateNodeData(id, { text: e.target.value })}
        className="w-full h-full p-2 bg-transparent text-text-main dark:text-dark-text-main resize-none focus:outline-none placeholder:text-text-muted"
        placeholder="Your note here..."
      />
    </div>
  );
};

export default TextNode;
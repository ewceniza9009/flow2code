import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData, useStore } from '@/store/useStore';
import { Cpu, Database, Server, Smartphone, Globe, Layers } from 'lucide-react';
import { memo } from 'react';
import { NodeResizer } from '@reactflow/node-resizer';

const icons: { [key: string]: React.ElementType } = {
  'Frontend': Globe,
  'Backend': Server,
  'Data Layer': Database,
  'Mobile': Smartphone,
  'Default': Cpu,
};

const CustomNode = ({ id, data, selected }: NodeProps<NodeData>) => {
  const Icon = icons[data.category] || icons['Default'];
  const { updateNodeData, updateNodeDimensions } = useStore();

  return (
    <div className="bg-surface border-2 border-border rounded-lg shadow-lg text-sm w-full h-full flex flex-col" >
      <NodeResizer
        isVisible={selected}
        minWidth={250}
        minHeight={150}
        onResizeEnd={(_event, params) => {
            updateNodeDimensions(id, { width: params.width, height: params.height });
        }}
      />
      
      <div className={`p-3 border-b-2 border-border flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <Icon className="text-primary" size={20} />
          <div className="flex flex-col">
            <strong className="text-text-main font-bold">{data.name}</strong>
            <span className="text-xs text-text-muted">{data.techStack.join(', ')}</span>
          </div>
        </div>
        {data.subflow && <span title="Contains a subflow"><Layers size={14} className="text-cyan-400" /></span>}
      </div>
      <div className="p-1 bg-background/50 flex-grow">
        <textarea
          defaultValue={data.requirements}
          onBlur={(e) => updateNodeData(id, { requirements: e.target.value })}
          className="w-full h-full p-2 bg-transparent text-xs text-text-muted border-none focus:ring-0 resize-none"
          placeholder="Enter requirements..."
        />
      </div>
      <Handle type="target" position={Position.Left} className="!bg-primary" />
      <Handle type="source" position={Position.Right} className="!bg-primary" />
    </div>
  );
};

export default memo(CustomNode);
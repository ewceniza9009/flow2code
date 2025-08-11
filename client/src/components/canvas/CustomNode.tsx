import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData, useStore } from '@/store/useStore';
import { Cpu, Database, Server, Smartphone, Globe, Layers } from 'lucide-react';
import { memo } from 'react';
import { NodeResizer } from '@reactflow/node-resizer';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const icons: { [key: string]: React.ElementType } = {
  'Frontend': Globe,
  'Backend': Server,
  'Data Layer': Database,
  'Mobile': Smartphone,
  'Default': Cpu,
};

const CustomNode = ({ id, data, selected }: NodeProps<NodeData>) => {
  const Icon = icons[data.category] || icons['Default'];
  const { updateNodeDimensions } = useStore();
  
  return (
    <div
      className="bg-surface dark:bg-dark-surface border-2 border-border dark:border-dark-border rounded-md shadow-lg text-sm w-full h-full flex flex-col"
    >
      <NodeResizer
        isVisible={selected}
        minWidth={250}
        minHeight={150}
        onResizeEnd={(_event, params) => {
          updateNodeDimensions(id, { width: params.width, height: params.height });
        }}
      />
      
      <div className={`p-2 border-b-2 border-border dark:border-dark-border flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Icon className="text-primary" size={18} />
          <div className="flex flex-col">
            <strong className="text-text-main dark:text-dark-text-main font-bold text-sm">{data.name}</strong>
            <span className="text-xs text-text-muted dark:text-dark-text-muted">{data.techStack.join(', ')}</span>
          </div>
        </div>
        {data.subflow && <span title="Contains a subflow"><Layers size={14} className="text-cyan-400" /></span>}
      </div>
      <div className="p-1 flex-grow overflow-y-auto custom-scroll prose dark:prose-invert">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
          {data.requirements || ''}
        </ReactMarkdown>
      </div>
      
      {/* Handles with dynamic IDs */}
      <Handle id={`${id}-left-target`} type="target" position={Position.Left} className="!bg-primary" />
      <Handle id={`${id}-right-source`} type="source" position={Position.Right} className="!bg-primary" />
      <Handle id={`${id}-top-target`} type="target" position={Position.Top} className="!bg-primary" />
      <Handle id={`${id}-bottom-source`} type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
};

export default memo(CustomNode);
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData, useStore } from '@/store/useStore';
import { Layers } from 'lucide-react';
import { memo } from 'react';
import { NodeResizer } from '@reactflow/node-resizer';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { LogoMap, DefaultLogo } from './TechLogos';

interface CustomNodeProps extends NodeProps<NodeData> {
  isHighlighted?: boolean;
}

const CustomNode = ({ id, data, selected, isHighlighted }: CustomNodeProps) => {
  const { updateNodeDimensions } = useStore();
  const TechLogo = LogoMap[data.techStack[0]] || DefaultLogo;

  return (
    <div
      className={`bg-surface dark:bg-dark-surface border-2 rounded-md shadow-lg text-sm w-full h-full flex flex-col ${isHighlighted ? 'border-yellow-400 border-[3px] animate-pulse' : 'border-border dark:border-dark-border'}`}
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
          <TechLogo size={20} />
          <div className="flex flex-col">
            <strong className="text-text-main dark:text-dark-text-main font-bold text-sm">{data.name}</strong>
            <span className="text-xs text-text-muted dark:text-dark-text-muted">{data.techStack.join(', ')}</span>
          </div>
        </div>
        {data.subflow && <span title="Contains a subflow"><Layers size={14} className="text-cyan-400" /></span>}
      </div>
      <div className="p-1 flex-grow overflow-y-auto custom-scrollbar prose dark:prose-invert">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
          {data.requirements || ''}
        </ReactMarkdown>
      </div>

      <Handle id={`${id}-left-target`} type="target" position={Position.Left} className="!bg-primary" />
      <Handle id={`${id}-left-source`} type="source" position={Position.Left} className="!bg-primary" />
      
      <Handle id={`${id}-right-target`} type="target" position={Position.Right} className="!bg-primary" />
      <Handle id={`${id}-right-source`} type="source" position={Position.Right} className="!bg-primary" />

      <Handle id={`${id}-top-target`} type="target" position={Position.Top} className="!bg-primary" />
      <Handle id={`${id}-top-source`} type="source" position={Position.Top} className="!bg-primary" />

      <Handle id={`${id}-bottom-target`} type="target" position={Position.Bottom} className="!bg-primary" />
      <Handle id={`${id}-bottom-source`} type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
};

export default memo(CustomNode);
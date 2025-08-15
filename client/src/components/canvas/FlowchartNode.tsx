import { Handle, Position, NodeProps } from 'reactflow';
import { useStore, NodeData } from '@/store';
import { memo } from 'react';
import { NodeResizer } from '@reactflow/node-resizer';

const ShapeSVG = ({ shape, className }: { shape: string; className: string }) => {
  switch (shape) {
    // Basic Shapes
    case 'rectangle': // Process
      return <rect x="0" y="0" width="100%" height="100%" rx="4" ry="4" className={className} />;
    case 'diamond': // Decision
      return <path d="M50 0 L100 50 L50 100 L0 50 Z" className={className} />;
    case 'terminator': // Start / End
      return <rect x="0" y="0" width="100%" height="100%" rx="50" ry="50" className={className} />;
    case 'parallelogram': // Input / Output
      return <path d="M20 0 L100 0 L80 100 L0 100 Z" className={className} />;
    
    // New Standard Shapes from your reference
    case 'document':
      return <path d="M0 0 H100 V90 C 80 110, 20 70, 0 90 Z" className={className} />;
    case 'dataStorage': // Or Database symbol
      return <path d="M0 10 C 0 -10, 100 -10, 100 10 V90 C 100 110, 0 110, 0 90 Z" className={className} />;
    case 'subroutine':
      return <g><rect x="0" y="0" width="100%" height="100%" rx="4" ry="4" className={className} /><path d="M10 0 V100 M90 0 V100" className="stroke-primary dark:stroke-primary" strokeWidth="2" /></g>;
    case 'delay':
      return <path d="M0 0 H80 C 120 50, 80 100, 80 100 H0 Z" className={className} />;
    case 'display':
      return <path d="M0 50 C 30 -20, 70 -20, 100 50 L90 100 H10 Z" className={className} />;
    case 'merge':
      return <path d="M0 0 L100 0 L50 100 Z" className={className} />;
    case 'connector':
      return <circle cx="50" cy="50" r="50" className={className} />;

    default:
      return <rect x="0" y="0" width="100%" height="100%" rx="4" ry="4" className={className} />;
  }
};

const FlowchartNode = ({ id, data, selected }: NodeProps<NodeData>) => {
  const { updateNodeDimensions, updateNodeData } = useStore();
  const keepAspectRatio = data.shape === 'diamond' || data.shape === 'connector';

  return (
    <div className="w-full h-full relative flex items-center justify-center text-center group">
      <NodeResizer
        isVisible={selected}
        minWidth={120}
        minHeight={70}
        keepAspectRatio={keepAspectRatio}
        onResizeEnd={(_event, params) => {
          updateNodeDimensions(id, { width: params.width, height: params.height });
        }}
      />
      
      <svg width="100%" height="100%" viewBox={"0 0 100 100"} preserveAspectRatio="none" className="absolute top-0 left-0 z-0">
        <ShapeSVG shape={data.shape} className="fill-surface dark:fill-dark-surface stroke-primary stroke-2 group-hover:stroke-[3px] transition-all duration-200" />
      </svg>

      <textarea
        defaultValue={data.text || data.name}
        onBlur={(e) => updateNodeData(id, { text: e.target.value })}
        className="relative z-10 nodrag nowheel w-4/5 h-4/5 p-2 bg-transparent resize-none focus:outline-none text-center flex items-center justify-center font-semibold text-sm text-text-main dark:text-dark-text-main"
      />

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

export default memo(FlowchartNode);
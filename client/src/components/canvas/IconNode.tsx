import { NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { useStore, NodeData } from '@/store/useStore';
import { Cpu, Server, Database, Users, Cloud, File, HelpCircle, LucideProps } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import React from 'react';

type CustomNodeProps = NodeProps<NodeData> & {
  style?: React.CSSProperties;
};

const ICONS: { [key: string]: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>> } = {
  Cpu,
  Server,
  Database,
  Users,
  Cloud,
  File,
};

const IconNode = ({ id, data, selected, style }: CustomNodeProps) => {
  const { updateNodeDimensions } = useStore();
  
  const IconComponent = ICONS[data.iconName] || HelpCircle;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <NodeResizer
        isVisible={selected}
        minWidth={40}
        minHeight={40}
        keepAspectRatio
        onResizeEnd={(_event, params) => {
          updateNodeDimensions(id, { width: params.width, height: params.height });
        }}
      />
      <IconComponent 
        className="w-full h-full" 
        strokeWidth={1.5}
        color={style?.color?.toString()} 
      />
    </div>
  );
};

export default IconNode;
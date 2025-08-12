import { NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { useStore, NodeData } from '@/store/useStore';
import { Cpu, Server, Database, Users, Cloud, File, HelpCircle, LucideProps } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

// Create a type-safe mapping from string names to the actual icon components.
// This resolves the TypeScript error by being explicit about the types.
const ICONS: { [key: string]: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>> } = {
  Cpu,
  Server,
  Database,
  Users,
  Cloud,
  File,
};

const IconNode = ({ id, data, selected }: NodeProps<NodeData>) => {
  const { updateNodeDimensions } = useStore();
  
  // Select the component from our explicit map, with a safe fallback.
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
      <IconComponent className="text-primary w-full h-full" strokeWidth={1.5} />
    </div>
  );
};

export default IconNode;
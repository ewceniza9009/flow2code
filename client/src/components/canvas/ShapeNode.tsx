import { NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { useStore, NodeData } from '@/store/useStore';

const renderShape = (shapeType: string) => {
    switch (shapeType) {
        case 'Rectangle':
            return <rect width="100%" height="100%" className="fill-primary/20 stroke-primary stroke-2" />;
        case 'Circle':
            return <ellipse cx="50%" cy="50%" rx="50%" ry="50%" className="fill-primary/20 stroke-primary stroke-2" />;
        case 'Diamond':
            return <polygon points="50,0 100,50 50,100 0,50" className="fill-primary/20 stroke-primary stroke-2" preserveAspectRatio="none" vectorEffect="non-scaling-stroke"/>;
        case 'Cylinder':
            return (
                <g className="fill-primary/20 stroke-primary stroke-2" vectorEffect="non-scaling-stroke">
                    <ellipse cx="50" cy="15" rx="48" ry="14" />
                    <rect x="2" y="15" width="96" height="70" />
                    <ellipse cx="50" cy="85" rx="48" ry="14" />
                </g>
            );
        case 'ArrowRight':
             return (
                <g className="fill-primary stroke-primary" vectorEffect="non-scaling-stroke">
                    <path d="M0,20 L75,20 L75,10 L100,25 L75,40 L75,30 L0,30 Z" />
                </g>
            );
        case 'ArrowLeft':
             return (
                <g className="fill-primary stroke-primary" vectorEffect="non-scaling-stroke">
                    <path d="M100,20 L25,20 L25,10 L0,25 L25,40 L25,30 L100,30 Z" />
                </g>
            );
        default:
            return <rect width="100%" height="100%" className="fill-red-500/20 stroke-red-500 stroke-2" />;
    }
}


const ShapeNode = ({ id, data, selected }: NodeProps<NodeData>) => {
  const { updateNodeDimensions } = useStore();
  const keepAspectRatio = data.shapeType === 'Circle' || data.shapeType === 'Diamond';

  return (
    <div className="w-full h-full">
      <NodeResizer
        isVisible={selected}
        minWidth={50}
        minHeight={50}
        keepAspectRatio={keepAspectRatio}
        onResizeEnd={(_event, params) => {
          updateNodeDimensions(id, { width: params.width, height: params.height });
        }}
      />
      <svg width="100%" height="100%" viewBox={data.shapeType === 'Cylinder' ? "0 0 100 100" : "0 0 100 50"} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        {renderShape(data.shapeType)}
      </svg>
    </div>
  );
};

export default ShapeNode;
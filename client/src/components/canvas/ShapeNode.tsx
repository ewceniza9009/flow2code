import { NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { useStore, NodeData } from '@/store/useStore';
import React from 'react';

type CustomNodeProps = NodeProps<NodeData> & {
    style?: React.CSSProperties;
};

const renderShape = (shapeType: string, style?: React.CSSProperties) => {
    const fill = style?.backgroundColor || 'rgba(13, 148, 136, 0.2)';
    const stroke = style?.color || 'rgb(13, 148, 136)';

    switch (shapeType) {
        case 'Rectangle':
            return <rect x="0" y="0" width="100%" height="100%" rx="8" fill={fill} stroke={stroke} strokeWidth="4px" />;
        case 'Circle':
            return <circle cx="50" cy="50" r="48" fill={fill} stroke={stroke} strokeWidth="4" />;
        case 'Diamond':
            return <polygon points="50,2 98,50 50,98 2,50" fill={fill} stroke={stroke} strokeWidth="4" vectorEffect="non-scaling-stroke"/>;
        case 'Cylinder':
            return (
                <g fill={fill} stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke">
                    <ellipse cx="100" cy="25" rx="98" ry="24" />
                    <rect x="2" y="25" width="196" height="150" />
                    <ellipse cx="100" cy="175" rx="98" ry="24" />
                </g>
            );
        case 'ArrowRight':
             return <path d="M0 25 L75 25 L75 0 L100 50 L75 100 L75 75 L0 75 Z" fill={stroke} stroke={stroke} strokeLinejoin="round" />;
        case 'ArrowLeft':
             return <path d="M100 25 L25 25 L25 0 L0 50 L25 100 L25 75 L100 75 Z" fill={stroke} stroke={stroke} strokeLinejoin="round" />;
        default:
            return <rect width="100" height="100" fill="red" stroke="black" strokeWidth="2" />;
    }
}


const ShapeNode = ({ id, data, selected, style }: CustomNodeProps) => {
  const { updateNodeDimensions } = useStore();
  
  const keepAspectRatio = data.shapeType === 'Circle' || data.shapeType === 'Diamond';

  return (
    <div className="w-full h-full bg-transparent">
      <NodeResizer
        isVisible={selected}
        minWidth={50}
        minHeight={50}
        keepAspectRatio={keepAspectRatio}
        onResizeEnd={(_event, params) => {
          updateNodeDimensions(id, { width: params.width, height: params.height });
        }}
      />
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100" 
        preserveAspectRatio={keepAspectRatio ? "xMidYMid meet" : "none"} 
        xmlns="http://www.w3.org/2000/svg"
      >
        {renderShape(data.shapeType, style)}
      </svg>
    </div>
  );
};

export default ShapeNode;
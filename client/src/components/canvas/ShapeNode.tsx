import { NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { useStore, NodeData } from '@/store/useStore';
import React from 'react';

type CustomNodeProps = NodeProps<NodeData> & {
  style?: React.CSSProperties;
};

const renderShape = (shapeType: string, fill: string, stroke: string, opacity: number) => {
  // React expects camelCase for SVG properties like fillOpacity and strokeOpacity
  const shapeProps = { fill, stroke, fillOpacity: opacity, strokeOpacity: opacity, vectorEffect: 'non-scaling-stroke' };
  switch (shapeType) {
    case 'Rectangle':
      return <rect x="0" y="0" width="100%" height="100%" rx="2" ry="2" {...shapeProps} strokeWidth="4px" />;
    case 'Circle':
      return <circle cx="50" cy="50" r="48" {...shapeProps} strokeWidth="2" />;
    case 'Diamond':
      return <polygon points="50,2 98,50 50,98 2,50" {...shapeProps} strokeWidth="2" vectorEffect="non-scaling-stroke" />;
    case 'ArrowRight':
      return <path d="M0 25 L75 25 L75 0 L100 50 L75 100 L75 75 L0 75 Z" strokeWidth="2" {...shapeProps} strokeLinejoin="round" />;
    case 'ArrowLeft':
      return <path d="M100 25 L25 25 L25 0 L0 50 L25 100 L25 75 L100 75 Z" strokeWidth="2" {...shapeProps} strokeLinejoin="round" />;
    default:
      return <rect width="100" height="100" fill="red" stroke="black" strokeWidth="2" />;
  }
};

const ShapeNode = ({ id, data, selected }: CustomNodeProps) => {
  const { updateNodeDimensions } = useStore();
  const keepAspectRatio = data.shapeType === 'Circle' || data.shapeType === 'Diamond';
  const fill = data.fillColor || 'rgba(13, 148, 136, 0.2)';
  const stroke = data.strokeColor || 'rgb(13, 148, 136)';
  const opacity = data.opacity ?? 1;
  
  return (
    <div className="w-full h-full bg-transparent" key={`${id}-${fill}-${stroke}-${opacity}`}>
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
        preserveAspectRatio={keepAspectRatio ? 'xMidYMid meet' : 'none'}
        xmlns="http://www.w3.org/2000/svg"
      >
        {renderShape(data.shapeType, fill, stroke, opacity)}
      </svg>
    </div>
  );
};

export default ShapeNode;

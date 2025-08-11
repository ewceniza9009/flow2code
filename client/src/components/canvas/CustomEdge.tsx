// client/src/components/canvas/CustomEdge.tsx

import { EdgeProps, getBezierPath, getSmoothStepPath, getStraightPath } from 'reactflow';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  // Determine which path function to use based on edge data
  const getPath = () => {
    switch (data?.pathType) {
      case 'straight':
        return getStraightPath({ sourceX, sourceY, targetX, targetY });
      case 'bezier':
        return getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
      case 'smoothstep':
      default:
        return getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
    }
  };

  const [edgePath] = getPath();

  return (
    <>
      {/* Invisible wide path for easier selection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="react-flow__edge-interaction"
      />
      {/* The base, visible path */}
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {/* A second path for the animation, only rendered if data.isAnimated is true */}
      {data?.isAnimated && (
        <path
          d={edgePath}
          fill="none"
          strokeDasharray="5 5"
          stroke="#4f46e5" // Animation color
          strokeWidth={2}
          className="path-animation" // CSS class for the animation
        />
      )}
    </>
  );
}
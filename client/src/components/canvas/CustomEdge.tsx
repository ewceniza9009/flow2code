import { EdgeProps, getBezierPath, getSmoothStepPath, getStraightPath } from 'reactflow';
import { useState, useEffect, useRef } from 'react';
import { AnimatedIcon } from './AnimatedIcon';

const useAnimation = (pathRef: React.RefObject<SVGPathElement>, speed = 50) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const animationFrameId = useRef<number>();

    useEffect(() => {
        const path = pathRef.current;
        if (!path) return;

        let pathLength = 0;
        try {
            pathLength = path.getTotalLength();
        } catch(e) {
            return;
        }

        let startTime: number;

        const animate = (timestamp: number) => {
            if (startTime === undefined) {
                startTime = timestamp;
            }

            const elapsed = timestamp - startTime;
            const distance = (elapsed * speed / 1000) % pathLength;
            
            const newPosition = path.getPointAtLength(distance);
            setPosition({ x: newPosition.x, y: newPosition.y });
            
            animationFrameId.current = requestAnimationFrame(animate);
        };

        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [pathRef, speed]);

    return position;
}

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
  const pathRef = useRef<SVGPathElement>(null);
  const position = useAnimation(pathRef);

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
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="react-flow__edge-interaction"
      />

      {!data?.isAnimated && (
          <path
            id={id}
            ref={pathRef}
            style={style}
            className="react-flow__edge-path"
            d={edgePath}
            markerEnd={markerEnd}
          />
      )}
      
      {data?.isAnimated && (
        <path
          id={id}
          ref={pathRef}
          d={edgePath}
          fill="none"
          strokeDasharray="5 5"
          stroke="#0f766e" 
          strokeWidth={2}
          className="path-animation"
          markerEnd={markerEnd}
        />
      )}
      
      {data?.animatedIcon && position && (
        <g transform={`translate(${position.x}, ${position.y})`}>
          
            <AnimatedIcon 
                iconType={data.animatedIcon} 
                color={data.animatedIconColor || '#0f766e'} 
            />
        </g>
      )}
    </>
  );
}
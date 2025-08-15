// ---- File: TextNode.tsx ----

import { NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { useStore, NodeData } from '@/store';
import React, { useState, useEffect, useRef } from 'react';

type TextNodeProps = NodeProps<NodeData> & {
  style?: React.CSSProperties;
  width?: number;
};

const TextNode = ({ id, data, selected, style, width }: TextNodeProps) => {
  const { updateNodeDimensions, updateNodeData } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const textDivRef = useRef<HTMLDivElement>(null);

  const autosize = () => {
    if (textDivRef.current) {
      const newHeight = textDivRef.current.scrollHeight + 4;
      updateNodeDimensions(id, { height: newHeight, width: width || 150 });
    }
  };

  useEffect(() => {
    autosize();
  }, [data.text]);

  useEffect(() => {
    if (isEditing && textDivRef.current) {
      textDivRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      className={`w-full h-full ${isEditing ? 'cursor-text' : 'cursor-grab'}`}
      onDoubleClick={() => setIsEditing(true)}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={40}
        onResizeEnd={(_event, params) => {
          updateNodeDimensions(id, { width: params.width, height: params.height });
        }}
      />
      <div
        ref={textDivRef}
        onInput={autosize}
        onBlur={(e) => {
          updateNodeData(id, { text: e.currentTarget.innerHTML });
          setIsEditing(false);
        }}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        style={style}
        // --- MODIFICATION START: Removed the "h-full" class to prevent the infinite loop ---
        className={`w-full p-2 bg-transparent resize-none focus:outline-none empty:before:content-['Double-click_to_edit'] empty:before:text-text-muted ${isEditing ? 'nodrag' : 'nowheel'}`}
        // --- MODIFICATION END ---
        dangerouslySetInnerHTML={{ __html: data.text || '' }}
      />
    </div>
  );
};

export default TextNode;
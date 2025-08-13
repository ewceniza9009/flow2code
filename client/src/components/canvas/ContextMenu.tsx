import { useStore } from '@/store/useStore';
import { ArrowUp, ArrowDown, Trash2, Bold, Italic, Strikethrough, CaseSensitive } from 'lucide-react';
import { useReactFlow } from 'reactflow';
import React from 'react';

export default function ContextMenu() {
  const { contextMenu, closeContextMenu, bringNodeToFront, sendNodeToBack, deleteElement, updateNodeStyle } = useStore();
  const { getNode } = useReactFlow();

  if (!contextMenu) {
    return null;
  }

  const node = getNode(contextMenu.id);
  const isTextNode = node?.type === 'text-note';

  const handleBringToFront = () => {
    bringNodeToFront(contextMenu.id);
    closeContextMenu();
  };

  const handleSendToBack = () => {
    sendNodeToBack(contextMenu.id);
    closeContextMenu();
  };
  
  const handleDelete = () => {
    const isNode = !!node;
    deleteElement(contextMenu.id, isNode);
    closeContextMenu();
  };

  const toggleStyle = (styleProperty: keyof React.CSSProperties, activeValue: string, inactiveValue: string) => {
    if (!node) return;
    const currentStyleValue = node.style?.[styleProperty];
    updateNodeStyle(node.id, { [styleProperty]: currentStyleValue === activeValue ? inactiveValue : activeValue });
    closeContextMenu();
  };

  const handleFontSizeChange = (size: string) => {
    if (!node) return;
    updateNodeStyle(node.id, { fontSize: size });
    closeContextMenu();
  }

  return (
    <div
      style={{ top: contextMenu.top, left: contextMenu.left }}
      className="absolute dark:bg-dark-surface z-50 bg-surface border border-border dark:border-dark-border rounded-md shadow-lg text-sm"
    >
      <ul className="py-1">
        {!!node && (
          <>
            <li onClick={handleBringToFront} className="px-4 py-2 hover:bg-primary/20 cursor-pointer flex items-center gap-2">
              <ArrowUp size={16} /> Bring to Front
            </li>
            <li onClick={handleSendToBack} className="px-4 py-2 hover:bg-primary/20 cursor-pointer flex items-center gap-2">
              <ArrowDown size={16} /> Send to Back
            </li>
          </>
        )}
        {isTextNode && (
          <>
            <div className="my-1 h-px bg-border dark:bg-dark-border" />
            <li onClick={() => toggleStyle('fontWeight', 'bold', 'normal')} className="px-4 py-2 hover:bg-primary/20 cursor-pointer flex items-center gap-2">
                <Bold size={16} /> Bold
            </li>
            <li onClick={() => toggleStyle('fontStyle', 'italic', 'normal')} className="px-4 py-2 hover:bg-primary/20 cursor-pointer flex items-center gap-2">
                <Italic size={16} /> Italic
            </li>
            <li onClick={() => toggleStyle('textDecoration', 'line-through', 'none')} className="px-4 py-2 hover:bg-primary/20 cursor-pointer flex items-center gap-2">
                <Strikethrough size={16} /> Strikethrough
            </li>
            <div className="my-1 h-px bg-border dark:bg-dark-border" />
            <div className="px-4 py-2 text-text-muted dark:text-dark-text-muted text-xs flex items-center gap-2"><CaseSensitive size={16} /> Font Size</div>
            <li onClick={() => handleFontSizeChange('12px')} className="px-4 py-2 pl-8 hover:bg-primary/20 cursor-pointer flex items-center gap-2">Small</li>
            <li onClick={() => handleFontSizeChange('16px')} className="px-4 py-2 pl-8 hover:bg-primary/20 cursor-pointer flex items-center gap-2">Medium</li>
            <li onClick={() => handleFontSizeChange('20px')} className="px-4 py-2 pl-8 hover:bg-primary/20 cursor-pointer flex items-center gap-2">Large</li>
          </>
        )}
        <div className="my-1 h-px bg-border dark:bg-dark-border" />
        <li onClick={handleDelete} className="px-4 py-2 hover:bg-red-500/20 text-red-400 cursor-pointer flex items-center gap-2">
            <Trash2 size={16} /> Delete
        </li>
      </ul>
    </div>
  );
}
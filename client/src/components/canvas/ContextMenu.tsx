import { useStore } from '@/store/useStore';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { useReactFlow } from 'reactflow';

export default function ContextMenu() {
  const { contextMenu, closeContextMenu, bringNodeToFront, sendNodeToBack, deleteElement, selectedNode, selectedEdge } = useStore();
  const { getNode, getEdge } = useReactFlow();

  if (!contextMenu) {
    return null;
  }

  const handleBringToFront = () => {
    bringNodeToFront(contextMenu.id);
    closeContextMenu();
  };

  const handleSendToBack = () => {
    sendNodeToBack(contextMenu.id);
    closeContextMenu();
  };
  
  const handleDelete = () => {
    const isNode = !!getNode(contextMenu.id);
    deleteElement(contextMenu.id, isNode);
    closeContextMenu();
  };

  return (
    <div
      style={{ top: contextMenu.top, left: contextMenu.left }}
      className="absolute dark:bg-dark-surface z-50 bg-surface border border-border dark:border-dark-border rounded-md shadow-lg text-sm"
    >
      <ul className="py-1">
        {!!getNode(contextMenu.id) && (
          <>
            <li onClick={handleBringToFront} className="px-4 py-2 hover:bg-primary/20 cursor-pointer flex items-center gap-2">
              <ArrowUp size={16} /> Bring to Front
            </li>
            <li onClick={handleSendToBack} className="px-4 py-2 hover:bg-primary/20 cursor-pointer flex items-center gap-2">
              <ArrowDown size={16} /> Send to Back
            </li>
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
import { useStore } from '@/store/useStore';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function ContextMenu() {
  const { contextMenu, closeContextMenu, bringNodeToFront, sendNodeToBack } = useStore();

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

  return (
    <div
      style={{ top: contextMenu.top, left: contextMenu.left }}
      className="absolute z-50 bg-surface border border-border rounded-md shadow-lg text-sm"
    >
      <ul className="py-1">
        <li onClick={handleBringToFront} className="px-4 py-2 hover:bg-primary/20 cursor-pointer flex items-center gap-2">
          <ArrowUp size={16} /> Bring to Front
        </li>
        <li onClick={handleSendToBack} className="px-4 py-2 hover:bg-primary/20 cursor-pointer flex items-center gap-2">
          <ArrowDown size={16} /> Send to Back
        </li>
      </ul>
    </div>
  );
}
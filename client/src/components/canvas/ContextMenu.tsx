import { useStore } from '@/store/useStore';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react'; // --- 1. IMPORT TRASH ICON ---

export default function ContextMenu() {
  // --- 2. GET THE NEW DELETE FUNCTION ---
  const { contextMenu, closeContextMenu, bringNodeToFront, sendNodeToBack, deleteElement } = useStore();

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
  
  // --- 3. CREATE THE DELETE HANDLER ---
  const handleDelete = () => {
    deleteElement(contextMenu.id);
    closeContextMenu();
  };

  return (
    <div
      style={{ top: contextMenu.top, left: contextMenu.left }}
      className="absolute dark:bg-dark-surface z-50 bg-surface border border-border rounded-md shadow-lg text-sm"
    >
      <ul className="py-1">
        <li onClick={handleBringToFront} className="px-4 py-2 hover:bg-primary/20 cursor-pointer flex items-center gap-2">
          <ArrowUp size={16} /> Bring to Front
        </li>
        <li onClick={handleSendToBack} className="px-4 py-2 hover:bg-primary/20 cursor-pointer flex items-center gap-2">
          <ArrowDown size={16} /> Send to Back
        </li>
        {/* --- 4. ADD THE DELETE OPTION TO THE MENU --- */}
        <div className="my-1 h-px bg-border" />
        <li onClick={handleDelete} className="px-4 py-2 hover:bg-red-500/20 text-red-400 cursor-pointer flex items-center gap-2">
            <Trash2 size={16} /> Delete
        </li>
      </ul>
    </div>
  );
}
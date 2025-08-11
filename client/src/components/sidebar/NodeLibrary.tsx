import { NODE_DEFINITIONS, NodeCategory, NodeDefinition } from '@/lib/nodes';

export default function NodeLibrary() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="h-full bg-surface p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-text-main mb-4">Node Library</h2>
      {NODE_DEFINITIONS.map((category: NodeCategory) => (
        <div key={category.name} className="mb-6">
          <h3 className="text-primary font-bold mb-3">{category.name}</h3>
          <div className="grid grid-cols-2 gap-2">
            {category.nodes.map((node: NodeDefinition) => (
              <div
                key={node.type}
                className="p-3 bg-background border border-border rounded-md cursor-grab text-center hover:border-primary transition-colors"
                onDragStart={(event) => onDragStart(event, node.type)}
                draggable
              >
                <p className="text-sm font-medium text-text-main">{node.name}</p>
                <p className="text-xs text-text-muted">{node.techStack[0]}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
import { NODE_DEFINITIONS, NodeCategory, NodeDefinition } from '@flow2code/shared';
import { useState } from 'react';

export default function NodeLibrary() {
  const [searchTerm, setSearchTerm] = useState('');

  const onDragStart = (event: React.DragEvent, node: NodeDefinition) => {
    // Pass both the general type and the unique name for identification
    event.dataTransfer.setData('application/reactflow', node.type);
    event.dataTransfer.setData('application/reactflow-nodename', node.name);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredNodes = NODE_DEFINITIONS
    .map(category => ({
      ...category,
      nodes: category.nodes.filter(node =>
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.techStack.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }))
    .filter(category => category.nodes.length > 0);

  return (
    <div className="h-full bg-surface dark:bg-dark-surface p-2 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-semibold text-text-main dark:text-dark-text-main">Node Library</h2>
      </div>
      <input
        type="text"
        placeholder="Search nodes..."
        className="w-full mb-2 p-1.5 text-sm rounded-md bg-background dark:bg-dark-background border border-border dark:border-dark-border focus:ring-1 focus:ring-primary focus:outline-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="flex-grow overflow-y-auto">
        {filteredNodes.map((category: NodeCategory) => (
          <div key={category.name} className="mb-4 pr-5">
            <h3 className="text-primary font-bold text-sm mb-2">{category.name}</h3>
            <div className="grid grid-cols-2 gap-2">
              {category.nodes.map((node: NodeDefinition) => (
                <div
                  key={node.name} // Use name for key since types can be duplicated
                  className="p-2 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md cursor-grab text-center hover:border-primary transition-colors"
                  onDragStart={(event) => onDragStart(event, node)}
                  draggable
                >
                  <p className="text-xs font-medium text-text-main dark:text-dark-text-main">{node.name}</p>
                  <p className="text-xs text-text-muted dark:text-dark-text-muted">{node.techStack[0]}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
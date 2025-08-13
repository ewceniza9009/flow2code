import { NODE_DEFINITIONS, NodeCategory, NodeDefinition } from '@flow2code/shared';
import { useState } from 'react';
import { LogoMap, DefaultLogo } from '../canvas/TechLogos';
import { Search, ChevronDown } from 'lucide-react';

export default function NodeLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState(
    NODE_DEFINITIONS.map(category => category.name)
  );

  const onDragStart = (event: React.DragEvent, node: NodeDefinition) => {
    event.dataTransfer.setData('application/reactflow-nodename', node.name);
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
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
    <div className="h-full w-80 bg-surface dark:bg-dark-surface p-4 flex flex-col border-r border-border dark:border-dark-border">
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-text-muted" />
        <input
          type="text"
          placeholder="Search nodes..."
          className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-background dark:bg-dark-background border border-border dark:border-dark-border focus:ring-2 focus:ring-primary focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {filteredNodes.map((category: NodeCategory) => (
          <div key={category.name} className="mb-4 last:mb-0">
            <button
              onClick={() => toggleCategory(category.name)}
              className="flex items-center justify-between w-full p-2 text-sm font-semibold text-text-main dark:text-dark-text-main rounded-md hover:bg-background dark:hover:bg-dark-background transition-colors duration-200"
            >
              <div className="flex items-center gap-2">
                {category.name}
              </div>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  openCategories.includes(category.name) ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openCategories.includes(category.name) && (
              <div className="grid grid-cols-2 gap-3 p-2">
                {category.nodes.map((node: NodeDefinition) => {
                  const TechLogo = LogoMap[node.techStack[0]] || DefaultLogo;
                  return (
                    <div
                      key={node.name}
                      className="flex flex-col items-center p-3 rounded-lg bg-background dark:bg-dark-background border border-border dark:border-dark-border cursor-grab transition-all duration-200 ease-in-out hover:border-primary hover:shadow-lg group"
                      onDragStart={(event) => onDragStart(event, node)}
                      draggable
                    >
                      <div className="mb-2 transition-transform duration-200 ease-in-out group-hover:scale-110">
                        <TechLogo size={32} />
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <span className="text-sm font-semibold text-text-main dark:text-dark-text-main">
                          {node.name}
                        </span>
                        <span className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">
                          {node.techStack[0]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useStore } from "@/store";
import { Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react';

interface FileTreeProps {
  files: Record<string, string>;
}

interface TreeNode {
  name: string;
  isDir: boolean;
  path: string;
  children?: { [key: string]: TreeNode };
}

const buildFileTree = (files: Record<string, string>): TreeNode => {
  const root: TreeNode = { name: 'project-root', isDir: true, path: '', children: {} };

  for (const path in files) {
    if (Object.prototype.hasOwnProperty.call(files, path)) {
      const parts = path.split('/');
      let currentNode = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!currentNode.children) {
          currentNode.children = {};
        }

        if (!currentNode.children[part]) {
          const newPath = i === 0 ? part : `${currentNode.path}/${part}`;
          currentNode.children[part] = {
            name: part,
            isDir: i < parts.length - 1,
            path: newPath,
            children: i < parts.length - 1 ? {} : undefined,
          };
        }
        currentNode = currentNode.children[part];
      }
    }
  }
  return root;
};

const FileTreeItem: React.FC<{
  node: TreeNode;
  activeFilePath: string | null;
  openFileInEditor: (path: string, content: string) => void;
  files: Record<string, string>;
}> = ({ node, activeFilePath, openFileInEditor, files }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = node.path === activeFilePath;

  if (node.isDir) {
    const sortedChildren = Object.values(node.children || {}).sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.name.localeCompare(b.name);
    });

    return (
      <div className="mb-1">
        <div
          className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-background dark:hover:bg-dark-background"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Folder size={16} />
          <span>{node.name}</span>
        </div>
        {isOpen && (
          <div className="ml-4">
            {sortedChildren.map(child => (
              <FileTreeItem
                key={child.path}
                node={child}
                activeFilePath={activeFilePath}
                openFileInEditor={openFileInEditor}
                files={files}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => openFileInEditor(node.path, files[node.path])}
      className={`flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-background dark:hover:bg-dark-background ${isSelected ? 'bg-primary/20 text-text-main dark:text-dark-text-main' : ''}`}
    >
      <FileText size={16} />
      <span>{node.name}</span>
    </div>
  );
};

export default function FileTree({ files }: FileTreeProps) {
  const { openFileInEditor, activeFile, activeProject } = useStore();
  const fileTree = buildFileTree(files);
  const rootChildren = Object.values(fileTree.children || {});

  return (
    <div className="h-[94vh] w-[300px] flex-shrink-0 bg-surface dark:bg-dark-surface border-r border-border dark:border-dark-border text-sm flex flex-col">
      <div className="overflow-y-auto flex-grow custom-scrollbar p-3">
        {rootChildren.map(node => (
          <FileTreeItem
            key={node.path}
            node={node}
            activeFilePath={activeFile?.path || null}
            openFileInEditor={openFileInEditor}
            files={files}
          />
        ))}
      </div>
    </div>
  );
}
import Editor from "@monaco-editor/react";
import { useStore } from "@/store";
import { useState, useEffect } from "react";
import React from 'react';

export default function CodeEditor() {
  const { activeFile, updateFileContent } = useStore();
  const [content, setContent] = useState(activeFile?.content || '');

  useEffect(() => {
    setContent(activeFile?.content || '');
  }, [activeFile]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && activeFile) {
      setContent(value);
      updateFileContent(activeFile.path, value);
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-background dark:bg-dark-background text-text-muted">
        Select a file to view its content.
      </div>
    );
  }

  const fileExtension = activeFile.path.split('.').pop();
  const languageMap: Record<string, string> = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    json: 'json', html: 'html', css: 'css', md: 'markdown', yml: 'yaml', yaml: 'yaml',
  };
  const language = languageMap[fileExtension as string] || 'plaintext';

  return (
    <div className="flex-1 h-full flex flex-col bg-background dark:bg-dark-background overflow-hidden">
      <div className="px-4 py-2 border-b border-border dark:border-dark-border text-text-muted dark:text-dark-text-muted text-sm flex-shrink-0">
        {activeFile.path}
      </div>
      <div className="flex-grow">
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            readOnly: false,
            minimap: { enabled: false },
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
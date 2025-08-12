import { ArrowLeft, Files, Play, Trash2, PanelLeft, PanelRight, Sun, Moon, Sparkles, ChevronDown, Search, Pencil } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Project } from '@/types/project';
import { generateCode, checkAndSuggest } from '@/api/api';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
}

export default function Header({ toggleLeftPanel, toggleRightPanel }: HeaderProps) {
  const {
    activeProject,
    currentFlowId,
    exitSubflow,
    openNewProjectModal,
    isGenerating,
    setActiveProject,
    setNodes,
    setEdges,
    setIsGenerating,
    loadProjects,
    isDarkMode,
    toggleDarkMode,
    setIsSuggestionsPanelOpen,
    renameProject,
  } = useStore();

  const projects = useLiveQuery(() => db.projects.toArray());
  const parentNode = useStore(state => state.nodes.find(n => n.id === state.currentFlowId));
  
  const [isProjectsListOpen, setIsProjectsListOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isRenamingActive, setIsRenamingActive] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState(activeProject?.name || '');
  const [searchTerm, setSearchTerm] = useState('');
  
  const projectListRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeProject) {
      setProjectNameInput(activeProject.name);
    }
  }, [activeProject]);

  useEffect(() => {
    if (isRenamingActive && renameInputRef.current) {
      renameInputRef.current.focus();
    }
  }, [isRenamingActive]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectListRef.current && !projectListRef.current.contains(event.target as Node)) {
        setIsProjectsListOpen(false);
        setSearchTerm('');
      }
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsMenuOpen(false);
      }
      if (isRenamingActive && renameInputRef.current && !renameInputRef.current.contains(event.target as Node)) {
        handleRenameBlur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [projectListRef, actionsMenuRef, isProjectsListOpen, isActionsMenuOpen, isRenamingActive, projectNameInput, activeProject, renameProject]);

  const handleProjectSelect = async (projectId: string) => {
    const project = await db.projects.get(projectId);
    if (project) {
      const latestSnapshot = project.snapshots[project.snapshots.length - 1];
      setActiveProject(project);
      setNodes(latestSnapshot.nodes);
      setEdges(latestSnapshot.edges);
    }
    setIsProjectsListOpen(false); // Collapse after selection
  };

  const handleRenameClick = () => {
    setIsRenamingActive(true);
    setIsActionsMenuOpen(false); // Close actions menu
  };

  const handleRenameBlur = () => {
    if (activeProject && projectNameInput && projectNameInput !== activeProject.name) {
      renameProject(activeProject.id, projectNameInput);
    }
    setIsRenamingActive(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Trigger blur to save
    }
  };

  const handleDeleteProject = async () => {
    if (!activeProject) return;
    if (window.confirm(`Are you sure you want to delete "${activeProject.name}"? This cannot be undone.`)) {
      await db.projects.delete(activeProject.id);
      await loadProjects();
      const remainingProjects = await db.projects.toArray();
      if (remainingProjects.length > 0) {
        const firstProject = remainingProjects[0];
        const latestSnapshot = firstProject.snapshots[firstProject.snapshots.length - 1];
        setActiveProject(firstProject);
        setNodes(latestSnapshot.nodes);
        setEdges(latestSnapshot.edges);
      } else {
        setActiveProject(null);
        setNodes([]);
        setEdges([]);
        openNewProjectModal();
      }
    }
    setIsActionsMenuOpen(false); // Close menu after action
  };

  const handleNewProjectClick = () => {
    openNewProjectModal();
    setIsActionsMenuOpen(false); // Close menu after action
  };

  const handleGenerate = async () => {
    if (!activeProject) return;
    setIsGenerating(true);
    await generateCode(activeProject);
    setIsGenerating(false);
  };
  
  const handleAICheck = async () => {
    if (!activeProject) return;
    setIsSuggestionsPanelOpen(true);
    await checkAndSuggest(activeProject);
  };

  const filteredProjects = projects?.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  return (
    <header className="h-12 bg-surface dark:bg-dark-surface border-b border-border dark:border-dark-border flex items-center justify-between px-3 shrink-0">
      
      {/* Left-aligned: Project/Flow Navigation */}
      <div className="flex items-center gap-4">
        <img src='/flow2code.svg' alt='Flow2Code Logo' className='w-6 h-6' />
        
        {currentFlowId ? (
          <div className="flex items-center gap-1 text-text-muted dark:text-dark-text-muted">
            <button onClick={exitSubflow} className="p-1 rounded-md hover:bg-border dark:hover:bg-dark-border flex items-center gap-1">
              <ArrowLeft size={16} />
            </button>
            <span>/</span>
            <span className="font-semibold text-text-main dark:text-dark-text-main">{parentNode?.data.name || 'Subflow'}</span>
          </div>
        ) : (
          projects && projects.length > 0 && activeProject ? (
            <div className="flex items-center gap-2">
              {isRenamingActive ? (
                <input
                  ref={renameInputRef}
                  type="text"
                  value={projectNameInput}
                  onChange={(e) => setProjectNameInput(e.target.value)}
                  onBlur={handleRenameBlur}
                  onKeyDown={handleRenameKeyDown}
                  className="bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md px-2 py-1 text-sm font-bold focus:ring-1 focus:ring-primary focus:outline-none w-40"
                />
              ) : (
                <div className="relative" ref={projectListRef}>
                  <button
                    onClick={() => setIsProjectsListOpen(!isProjectsListOpen)}
                    className="flex items-center h-9 px-3 gap-2 text-text-main dark:text-dark-text-main font-bold border border-border dark:border-dark-border rounded-md cursor-pointer transition-colors hover:bg-border dark:hover:bg-dark-border"
                  >
                    {activeProject.name}
                    <ChevronDown size={14} className={`transition-transform ${isProjectsListOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isProjectsListOpen && (
                    <div className="absolute top-11 left-0 z-20 flex flex-col p-2 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-md shadow-lg w-64">
                      <div className="relative mb-2">
                        <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-text-muted" />
                        <input
                          type="text"
                          placeholder="Search projects..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-8 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto hide-scrollbar">
                        {filteredProjects.map((p: Project) => (
                          <div
                            key={p.id}
                            className={`p-2 rounded-md cursor-pointer text-sm font-medium transition-colors 
                              ${activeProject.id === p.id 
                                ? 'bg-primary/20 text-primary dark:bg-primary/30 dark:text-dark-text-main' 
                                : 'hover:bg-background dark:hover:bg-dark-background'}`
                            }
                            onClick={() => handleProjectSelect(p.id)}
                          >
                            {p.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="relative" ref={actionsMenuRef}>
                <button
                  onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
                  className="flex items-center gap-1 px-2 py-1 text-sm bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md hover:bg-border dark:hover:bg-dark-border transition-colors"
                >
                  Project Actions <ChevronDown size={14} className={`transition-transform ${isActionsMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isActionsMenuOpen && (
                  <div className="absolute top-11 left-0 mt-2 z-20 flex flex-col p-2 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-md shadow-lg w-48">
                    <button 
                      onClick={handleNewProjectClick} 
                      className="flex items-center gap-2 px-2 py-1 text-sm rounded-md hover:bg-background dark:hover:bg-dark-background transition-colors"
                    >
                      <Files size={16} /> New Project
                    </button>
                    <button 
                      onClick={handleRenameClick} 
                      className="flex items-center gap-2 px-2 py-1 text-sm rounded-md hover:bg-background dark:hover:bg-dark-background transition-colors"
                    >
                      <Pencil size={16} /> Rename Project
                    </button>
                    <button 
                      onClick={handleDeleteProject} 
                      className="flex items-center gap-2 px-2 py-1 text-sm rounded-md hover:bg-red-500/10 text-red-400 transition-colors"
                    >
                      <Trash2 size={16} /> Delete Project
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <h1 className="text-lg font-bold text-text-main dark:text-dark-text-main">Flow2Code</h1>
          )
        )}
      </div>

      {/* Center-aligned: Primary Actions */}
      <div className='flex items-center gap-2'>
        <button
          onClick={handleAICheck}
          disabled={!activeProject}
          className="flex items-center gap-1 px-3 py-1 text-sm font-semibold bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          <Sparkles size={16} /> AI Check
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !activeProject}
          className="flex items-center gap-1 px-3 py-1 text-sm font-semibold bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          <Play size={16} />
          {isGenerating ? 'Generating...' : 'Generate Code'}
        </button>
      </div>

      {/* Right-aligned: Utility Controls */}
      <div className="flex items-center gap-2">
        <button onClick={toggleLeftPanel} className="p-1 rounded-md hover:bg-border dark:hover:bg-dark-border transition-colors"><PanelLeft size={18} /></button>
        <button onClick={toggleRightPanel} className="p-1 rounded-md hover:bg-border dark:hover:bg-dark-border transition-colors"><PanelRight size={18} /></button>
        <button onClick={toggleDarkMode} className="p-1 rounded-md hover:bg-border dark:hover:bg-dark-border transition-colors">
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

    </header>
  );
}
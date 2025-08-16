import { ArrowLeft, Files, Play, Trash2, PanelLeft, PanelRight, Sun, Moon, Sparkles, ChevronDown, Search, Pencil, Settings, Lightbulb, Download, Upload, PlusIcon, Code2, X, MoreHorizontal, FileText } from 'lucide-react';
import { useStore } from '@/store';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Project } from '@/types/project';
import { generateCodeAndSetFiles, checkAndSuggest } from '@/api/api';
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Transition } from 'framer-motion';

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
        isChecking,
        setIsChecking,
        setActiveProject,
        setNodes,
        setEdges,
        setIsGenerating,
        loadProjects,
        isDarkMode,
        toggleDarkMode,
        isSuggestionsPanelOpen,
        setIsSuggestionsPanelOpen,
        renameProject,
        openSettingsModal,
        codeGenerationType,
        setCodeGenerationType,
        suggestions,
        saveProjectToFile,
        loadProjectFromFile,
        isEditorOpen,
        closeEditor,
        generatedFiles,
        openEditor,
        countProjects
    } = useStore();

    const projects = useLiveQuery(() => db.projects.toArray());
    const parentNode = useStore(state => state.nodes.find(n => n.id === state.currentFlowId));

    const [isProjectsListOpen, setIsProjectsListOpen] = useState(false);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
    const [isGenerateMenuOpen, setIsGenerateMenuOpen] = useState(false);
    const [isRenamingActive, setIsRenamingActive] = useState(false);
    const [projectNameInput, setProjectNameInput] = useState(activeProject?.name || '');
    const [searchTerm, setSearchTerm] = useState('');

    const projectListRef = useRef<HTMLDivElement>(null);
    const actionsMenuRef = useRef<HTMLDivElement>(null);
    const generateMenuRef = useRef<HTMLDivElement>(null);
    const projectNameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activeProject) {
            setProjectNameInput(activeProject.name);
        }
    }, [activeProject]);

    useEffect(() => {
        if (isRenamingActive && projectNameRef.current) {
            projectNameRef.current.focus();
            projectNameRef.current.select();
        }
    }, [isRenamingActive]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (projectListRef.current && !projectListRef.current.contains(event.target as Node)) setIsProjectsListOpen(false);
            if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) setIsActionsMenuOpen(false);
            if (generateMenuRef.current && !generateMenuRef.current.contains(event.target as Node)) setIsGenerateMenuOpen(false);
            if (isRenamingActive && projectNameRef.current && !projectNameRef.current.contains(event.target as Node)) handleRenameBlur();
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isRenamingActive]);


    const handleProjectSelect = async (projectId: string) => {
        const project = await db.projects.get(projectId);
        if (project) {
            const latestSnapshot = project.snapshots[project.snapshots.length - 1];
            setActiveProject(project);
            setNodes(latestSnapshot.nodes);
            setEdges(latestSnapshot.edges);
        }
        setIsProjectsListOpen(false);
    };

    const handleRenameClick = () => {
        setIsRenamingActive(true);
        setIsActionsMenuOpen(false);
    };

    const handleRenameBlur = () => {
        if (activeProject && projectNameInput && projectNameInput !== activeProject.name) {
            renameProject(activeProject.id, projectNameInput);
        }
        setIsRenamingActive(false);
    };

    const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') {
            setProjectNameInput(activeProject?.name || '');
            setIsRenamingActive(false);
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
        setIsActionsMenuOpen(false);
    };

    const handleNewProjectClick = () => {
        openNewProjectModal();
        setIsProjectsListOpen(false);
    };

    const handleGenerate = async () => {
        if (!activeProject) return;
        setIsGenerating(true);
        setIsGenerateMenuOpen(false);
        try {
            await generateCodeAndSetFiles(activeProject, codeGenerationType);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAICheck = async () => {
        if (!activeProject) return;
        setIsChecking(true);
        try {
            await checkAndSuggest(activeProject);
            setIsSuggestionsPanelOpen(true);
        } finally {
            setIsChecking(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = e.target?.result as string;
                loadProjectFromFile(fileContent);
            };
            reader.readAsText(file);
        }
        setIsActionsMenuOpen(false);
        setIsProjectsListOpen(false);
    };

    const handleDownloadZip = () => {
        if (!generatedFiles) return;
        import('jszip').then(JSZip => {
            const zip = new JSZip.default();
            for (const filePath in generatedFiles) {
                zip.file(filePath, generatedFiles[filePath]);
            }
            zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = `${activeProject?.name || 'project'}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        });
    };

    const handleShowCode = () => {
        if (generatedFiles) {
            openEditor();
        }
    };

    const unappliedSuggestionsCount = suggestions.filter(s => !s.applied).length;

    const displayedProjects = useMemo(() => {
        if (!projects) return [];
        
        const sortedProjects = [...projects].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        if (searchTerm.trim() !== '') {
            return sortedProjects.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return sortedProjects.slice(0, 5);
    }, [projects, searchTerm]);

    const dropdownTransition: Transition = { duration: 0.15, ease: "easeOut" };

    const dropdownAnimation = {
        initial: { opacity: 0, scale: 0.95, y: -10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: -10 },
        transition: dropdownTransition,
    };

    return (
        <header className="h-14 bg-surface dark:bg-dark-surface border-b border-border dark:border-dark-border flex items-center justify-between px-4 shrink-0 text-text-main dark:text-dark-text-main relative">

            {/* --- LEFT SECTION: Project Navigation & Info --- */}
            <div className="flex items-center gap-3">
                <img src='/flow2code.png' alt='Flow2Code Logo' className='w-7 h-7' />
                <div className="w-px h-6 bg-border dark:bg-dark-border"></div>

                {currentFlowId ? (
                    <div className="flex items-center gap-1 text-sm">
                        <button onClick={exitSubflow} className="p-1.5 rounded-md hover:bg-background dark:hover:bg-dark-background flex items-center gap-1 transition-colors">
                            <ArrowLeft size={16} />
                        </button>
                        <span className="text-text-muted dark:text-dark-text-muted">/</span>
                        <span className="font-semibold ml-1">{parentNode?.data.name || 'Subflow'}</span>
                    </div>
                ) : (                    
                    countProjects === 0 ? (
                        <div className="relative" ref={actionsMenuRef}>
                            <button onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)} className="p-2 rounded-md hover:bg-background dark:hover:bg-dark-background transition-colors">
                                <MoreHorizontal size={18} />
                            </button>
                            <AnimatePresence>
                                {isActionsMenuOpen && (
                                    <motion.div {...dropdownAnimation} className="absolute top-full left-0 mt-2 z-50 flex flex-col p-2 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg shadow-2xl w-48">
                                        <button onClick={handleNewProjectClick} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-background dark:hover:bg-dark-background transition-colors"><PlusIcon size={16} /> New Project</button>
                                        <label className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-background dark:hover:bg-dark-background transition-colors cursor-pointer">
                                            <Upload size={16} /> Load from File...
                                            <input type="file" accept=".ftc" className="hidden" onChange={handleFileChange} onClick={(e) => (e.currentTarget.value = '')} />
                                        </label>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        activeProject && (
                            <div className="flex items-center gap-2">
                                {isRenamingActive ? (
                                    <input
                                        ref={projectNameRef}
                                        type="text"
                                        value={projectNameInput}
                                        onChange={(e) => setProjectNameInput(e.target.value)}
                                        onBlur={handleRenameBlur}
                                        onKeyDown={handleRenameKeyDown}
                                        className="bg-background dark:bg-dark-background border border-primary rounded-md px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none w-48"
                                    />
                                ) : (
                                    <div className="relative" ref={projectListRef}>
                                        <button
                                            onClick={() => setIsProjectsListOpen(!isProjectsListOpen)}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md hover:bg-border/40 dark:hover:bg-dark-border/40 transition-colors"
                                        >
                                            <Files size={15} />
                                            <span className="font-semibold">{activeProject.name}</span>
                                            <ChevronDown size={14} className={`transition-transform ${isProjectsListOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {isProjectsListOpen && (                                            
                                                <motion.div {...dropdownAnimation} className="absolute top-full left-0 mt-2 z-50 flex flex-col p-2 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg shadow-2xl w-64">
                                                    <div className="relative mb-2">
                                                        <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-text-muted" />
                                                        <input type="text" placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                                                    </div>
                                                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar">
                                                        {displayedProjects.map((p: Project) => (
                                                            <div key={p.id} className={`p-2 rounded-md cursor-pointer text-sm font-medium transition-colors ${activeProject.id === p.id ? 'bg-primary/20 text-primary' : 'hover:bg-background dark:hover:bg-dark-background'}`} onClick={() => handleProjectSelect(p.id)}>
                                                                {p.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="my-2 h-px bg-border dark:bg-dark-border" />
                                                    <button onClick={handleNewProjectClick} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-background dark:hover:bg-dark-background transition-colors"><PlusIcon size={16} /> New Project</button>
                                                    <label className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-background dark:hover:bg-dark-background transition-colors cursor-pointer">
                                                        <Upload size={16} /> Load from File...
                                                        <input type="file" accept=".ftc" className="hidden" onChange={handleFileChange} onClick={(e) => (e.currentTarget.value = '')} />
                                                    </label>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                                <div className="relative" ref={actionsMenuRef}>
                                    <button onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)} className="p-2 rounded-md hover:bg-background dark:hover:bg-dark-background transition-colors">
                                        <MoreHorizontal size={18} />
                                    </button>
                                    <AnimatePresence>
                                        {isActionsMenuOpen && (
                                            <motion.div {...dropdownAnimation} className="absolute top-full right-0 mt-2 z-50 flex flex-col p-2 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg shadow-2xl w-48">
                                                <button onClick={handleRenameClick} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-background dark:hover:bg-dark-background transition-colors"><Pencil size={16} /> Rename Project</button>
                                                <button onClick={saveProjectToFile} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-background dark:hover:bg-dark-background transition-colors"><Download size={16} /> Save to File</button>
                                                <div className="my-1 h-px bg-border dark:bg-dark-border" />
                                                <button onClick={openSettingsModal} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-background dark:hover:bg-dark-background transition-colors"><Settings size={16} /> Project Settings</button>
                                                <div className="my-1 h-px bg-border dark:bg-dark-border" />
                                                <button onClick={handleDeleteProject} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-red-500/10 text-red-500 transition-colors"><Trash2 size={16} /> Delete Project</button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )
                    )                    
                )}
            </div>

            {/* --- CENTER SECTION: Core Actions --- */}
            <div className='absolute left-1/2 -translate-x-1/2 z-30 flex items-center gap-2'>
                {isEditorOpen ? (
                    <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 text-text-muted dark:text-dark-text-muted">
                            <FileText size={16} />
                            <span>Editor</span>
                        </div>
                        <div className="w-px h-6 bg-border dark:bg-dark-border"></div>
                        {generatedFiles && (
                            <button onClick={handleDownloadZip} title="Download Project as ZIP" className="p-1.5 rounded-md hover:bg-background dark:hover:bg-dark-background transition-colors"><Download size={16} /></button>
                        )}
                        <button onClick={closeEditor} title="Close Editor" className="p-1.5 rounded-md hover:bg-background dark:hover:bg-dark-background transition-colors"><X size={16} /></button>
                    </div>
                ) : (
                    <>
                        <button onClick={handleAICheck} disabled={!activeProject || isGenerating || isChecking} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-blue-500/10 text-blue-400 rounded-md hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <Sparkles size={16} className={isChecking ? 'animate-pulse' : ''} />
                            {isChecking ? 'Checking...' : 'AI Check'}
                        </button>
                        <div className="relative flex" ref={generateMenuRef}>
                            <button onClick={handleGenerate} disabled={isGenerating || !activeProject || isChecking} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-sm font-semibold bg-primary text-white rounded-l-md hover:bg-primary-hover disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                                <Play size={16} className={isGenerating ? 'animate-spin' : ''} />
                                {isGenerating ? 'Generating...' : `Generate (${codeGenerationType})`}
                            </button>
                            <button onClick={() => setIsGenerateMenuOpen(!isGenerateMenuOpen)} disabled={isGenerating || !activeProject || isChecking} className="px-1.5 py-1.5 bg-primary text-white rounded-r-md hover:bg-primary-hover disabled:bg-gray-500 disabled:cursor-not-allowed border-l border-teal-600">
                                <ChevronDown size={16} className={`transition-transform ${isGenerateMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {isGenerateMenuOpen && (
                                    <motion.div {...dropdownAnimation} className="absolute top-full right-0 mt-2 z-50 flex flex-col p-2 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg shadow-2xl w-56">
                                        <div onClick={() => { setCodeGenerationType('Starter'); setIsGenerateMenuOpen(false); }} className="flex flex-col gap-1 px-2 py-2 text-sm rounded-md hover:bg-background dark:hover:bg-dark-background cursor-pointer">
                                            <h4 className="font-semibold text-text-main dark:text-dark-text-main">Starter Project</h4>
                                            <p className="text-xs text-text-muted dark:text-dark-text-muted">Architectural scaffolding and configs.</p>
                                        </div>
                                        <div onClick={() => { setCodeGenerationType('Flexible'); setIsGenerateMenuOpen(false); }} className="flex flex-col gap-1 px-2 py-2 text-sm rounded-md hover:bg-background dark:hover:bg-dark-background cursor-pointer">
                                            <h4 className="font-semibold text-text-main dark:text-dark-text-main">Flexible Project</h4>
                                            <p className="text-xs text-text-muted dark:text-dark-text-muted">Functional code with hooks for logic.</p>
                                        </div>
                                        <div onClick={() => { setCodeGenerationType('Complete'); setIsGenerateMenuOpen(false); }} className="flex flex-col gap-1 px-2 py-2 text-sm rounded-md hover:bg-background dark:hover:bg-dark-background cursor-pointer">
                                            <h4 className="font-semibold text-text-main dark:text-dark-text-main">Complete Project</h4>
                                            <p className="text-xs text-text-muted dark:text-dark-text-muted">Production-ready, refined, with tests.</p>
                                        </div>
                                        <div className="my-1 h-px bg-border dark:bg-dark-border" />
                                        <div onClick={() => { setCodeGenerationType('Test-Driven'); setIsGenerateMenuOpen(false); }} className="flex flex-col gap-1 px-2 py-2 text-sm rounded-md hover:bg-background dark:hover:bg-dark-background cursor-pointer">
                                            <h4 className="font-semibold text-text-main dark:text-dark-text-main">Test-Driven Project</h4>
                                            <p className="text-xs text-text-muted dark:text-dark-text-muted">Tests first, then minimal code to pass.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {generatedFiles && (
                           <button onClick={handleShowCode} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md hover:bg-border/40 dark:hover:bg-dark-border/40 transition-colors">
                                <Code2 size={16} />
                                View Code
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* --- RIGHT SECTION: UI & View Controls --- */}
            <div className="flex items-center gap-1">
                <button onClick={() => setIsSuggestionsPanelOpen(!isSuggestionsPanelOpen)} className={`p-2 rounded-md transition-colors relative ${isSuggestionsPanelOpen ? 'bg-background dark:bg-dark-background' : 'hover:bg-background dark:hover:bg-dark-background'}`} title="Toggle AI Suggestions">
                    <Lightbulb size={18} className="text-yellow-400" />
                    {unappliedSuggestionsCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {unappliedSuggestionsCount}
                        </span>
                    )}
                </button>
                <div className="w-px h-6 bg-border dark:bg-dark-border mx-2"></div>
                <button onClick={toggleLeftPanel} className="p-2 rounded-md hover:bg-background dark:hover:bg-dark-background transition-colors" title="Toggle Node Library (Ctrl+G)"><PanelLeft size={18} /></button>
                <button onClick={toggleRightPanel} className="p-2 rounded-md hover:bg-background dark:hover:bg-dark-background transition-colors" title="Toggle Properties Panel (Ctrl+H)"><PanelRight size={18} /></button>
                <button onClick={toggleDarkMode} className="p-2 rounded-md hover:bg-background dark:hover:bg-dark-background transition-colors" title="Toggle Theme">
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>
        </header>
    );
}
import { ArrowLeft, Files, Play, Save, Share2, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Project } from '@/types/project';
import { generateCode } from '@/api/api';

export default function Header() {
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
    loadProjects
  } = useStore();
  
  const projects = useLiveQuery(() => db.projects.toArray());
  const parentNode = useStore(state => state.nodes.find(n => n.id === state.currentFlowId));

  const handleProjectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const projectId = e.target.value;
      const project = await db.projects.get(projectId);
      if(project) {
        const latestSnapshot = project.snapshots[project.snapshots.length - 1];
        setActiveProject(project);
        setNodes(latestSnapshot.nodes);
        setEdges(latestSnapshot.edges);
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
  };

  const handleGenerate = async () => {
    if (!activeProject) return;
    setIsGenerating(true);
    await generateCode(activeProject);
    setIsGenerating(false);
  };

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <Share2 className="text-primary" />
        <h1 className="text-xl font-bold text-text-main">Flow2Code</h1>
        
        {currentFlowId && (
          <div className="flex items-center gap-2 text-text-muted">
            <button 
              onClick={exitSubflow}
              className="p-1 rounded-md hover:bg-border flex items-center gap-1"
            >
              <ArrowLeft size={16}/>
            </button>
            <span>/</span>
            <span className="font-semibold text-text-main">{parentNode?.data.name || 'Subflow'}</span>
          </div>
        )}
      </div>

      <div className='flex items-center gap-2'>
        {projects && projects.length > 0 && activeProject && (
          <div className="flex items-center gap-1">
             <select 
               value={activeProject.id} 
               onChange={handleProjectChange}
               className="bg-background border border-border rounded-md px-3 py-1.5 text-sm"
             >
              {projects.map((p: Project) => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
             <button onClick={handleDeleteProject} className="p-2 text-red-400 hover:bg-red-500/20 rounded-md">
                <Trash2 size={16} />
             </button>
           </div>
        )}
        <button onClick={openNewProjectModal} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-background border border-border rounded-md hover:bg-border">
          <Files size={16} /> New Project
        </button>
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-background border border-border rounded-md hover:bg-border">
          <Save size={16} /> Save Snapshot
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !activeProject}
          className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          <Play size={16} />
          {isGenerating ? 'Generating...' : 'Generate Code'}
        </button>
      </div>
    </header>
  );
}
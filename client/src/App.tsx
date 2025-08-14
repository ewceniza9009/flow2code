import { useEffect } from 'react';
import AppLayout from "./components/layout/AppLayout";
import { useStore } from './store/useStore';
import NewProjectModal from './components/modals/NewProjectModal';
import { db } from './lib/db';
import { ReactFlowProvider } from 'reactflow';

function App() {
  const {
    isNewProjectModalOpen,
    openNewProjectModal,
    loadProjects,
    setActiveProject,
    setNodes,
    setEdges,
    isDarkMode,
    isNodeLibraryOpen,
    isPropertiesPanelOpen,
    setIsNodeLibraryOpen,
    setIsPropertiesPanelOpen,
  } = useStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const projectsFromDb = await db.projects.toArray();
        if (projectsFromDb.length === 0) {
          openNewProjectModal();
        } else {
          await loadProjects();
          const firstProject = projectsFromDb[0];
          
          if (firstProject.snapshots && firstProject.snapshots.length > 0) {
            const latestSnapshot = firstProject.snapshots[firstProject.snapshots.length - 1];
            setActiveProject(firstProject);
            setNodes(latestSnapshot.nodes);
            setEdges(latestSnapshot.edges);
          } else {
            console.warn(`Project "${firstProject.name}" found with no snapshots. Loading an empty canvas.`);
            setActiveProject(firstProject);
            setNodes([]);
            setEdges([]);
          }
        }
      } catch (error) {
        console.error("Failed to initialize the application:", error);
        alert("A critical error occurred while loading project data. Please try clearing your browser's application data if the problem persists.");
      }
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      
      if (event.ctrlKey && event.key === 'g') {
        event.preventDefault(); 
        setIsNodeLibraryOpen(!isNodeLibraryOpen);
      }
      
      if (event.ctrlKey && event.key === 'h') {
        event.preventDefault();
        setIsPropertiesPanelOpen(!isPropertiesPanelOpen);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNodeLibraryOpen, isPropertiesPanelOpen, setIsNodeLibraryOpen, setIsPropertiesPanelOpen]);

  return (
    <div className="h-screen w-screen flex flex-col">
      {isNewProjectModalOpen && <NewProjectModal />}
      <ReactFlowProvider>
        <AppLayout />
      </ReactFlowProvider>
    </div>
  );
}

export default App;
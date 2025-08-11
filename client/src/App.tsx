import { useEffect } from 'react';
import AppLayout from "./components/layout/AppLayout";
import { useStore } from './store/useStore';
import NewProjectModal from './components/modals/NewProjectModal';
import { db } from './lib/db';

function App() {
  const {
    isNewProjectModalOpen,
    openNewProjectModal,
    loadProjects,
    setActiveProject,
    setNodes,
    setEdges,
    isDarkMode,
  } = useStore();

  useEffect(() => {
    const initializeApp = async () => {
      const projectsFromDb = await db.projects.toArray();
      if (projectsFromDb.length === 0) {
        openNewProjectModal();
      } else {
        await loadProjects();
        const firstProject = projectsFromDb[0];
        const latestSnapshot = firstProject.snapshots[firstProject.snapshots.length - 1];
        setActiveProject(firstProject);
        setNodes(latestSnapshot.nodes);
        setEdges(latestSnapshot.edges);
      }
    };
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="h-screen w-screen flex flex-col">
      {isNewProjectModalOpen && <NewProjectModal />}
      <AppLayout />
    </div>
  );
}

export default App;
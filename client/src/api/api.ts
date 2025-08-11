import axios from 'axios';
import { saveAs } from 'file-saver';
import { Project } from '@/types/project';

const prepareProjectForApi = (project: Project) => {
    const latestSnapshot = project.snapshots[project.snapshots.length - 1];
    const nodes = latestSnapshot.nodes.map(node => ({
        id: node.id,
        name: node.data.name,
        type: node.data.type,
        role: node.data.category,
        techStack: node.data.techStack,
        requirements: node.data.requirements,
    }));
    const edges = latestSnapshot.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        type: edge.label || "API Call"
    }));
    return { name: project.name, type: project.type, nodes, edges };
};

export const generateCode = async (project: Project): Promise<void> => {
    try {
        const projectData = prepareProjectForApi(project);
        const response = await axios.post('/api/generate', { project: projectData }, {
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/zip' });
        saveAs(blob, `${project.name.replace(/\s+/g, '_')}.zip`);
        alert('Project generated successfully!');
    } catch (error) {
        console.error('Error generating code:', error);
        alert('An error occurred during code generation.');
    }
};
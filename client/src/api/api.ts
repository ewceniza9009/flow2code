import axios from 'axios';
import { saveAs } from 'file-saver';
import { Project } from '@/types/project';
import { useStore } from '@/store/useStore';

const prepareProjectForApi = (project: Project) => {
    const latestSnapshot = project.snapshots[project.snapshots.length - 1];
    const nodes = latestSnapshot.nodes.map(node => ({
        id: node.id,
        name: node.data.name,
        type: node.data.type,
        role: node.data.category,
        techStack: node.data.techStack,
        requirements: node.data.requirements,
        config: node.data.config, // Include the new config field
    }));
    const edges = latestSnapshot.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        type: edge.label || "API Call",
        data: edge.data, // Include all edge data
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

export const checkAndSuggest = async (project: Project): Promise<any> => {
    try {
        const projectData = prepareProjectForApi(project);
        const response = await axios.post('/api/suggest', { project: projectData });
        useStore.getState().setSuggestions(response.data.suggestions);
        alert('Suggestions generated successfully!');
        return response.data;
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        alert('An error occurred during suggestions generation.');
        return null;
    }
}
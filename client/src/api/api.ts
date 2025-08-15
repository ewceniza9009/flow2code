import axios from 'axios';
import { saveAs } from 'file-saver';
import { Project, CodeGenerationType, NodeData } from '@/types/project';
import { useStore } from '@/store';
import { Node, Edge } from 'reactflow';

const processNodesRecursive = (nodes: Node<NodeData>[]) => {
    const processedNodes: any[] = [];
    nodes.forEach(node => {
        if (node.data.category === 'Annotations') return;

        const processedNode: any = {
            id: node.id,
            name: node.data.name,
            type: node.data.type,
            role: node.data.category,
            techStack: node.data.techStack,
            requirements: node.data.requirements,
            config: node.data.config,
        };

        if (node.data.subflow && (node.data.subflow.nodes.length > 0 || node.data.subflow.edges.length > 0)) {
            processedNode.subflow = {
                nodes: processNodesRecursive(node.data.subflow.nodes),
                edges: node.data.subflow.edges.map((edge: Edge) => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    type: edge.label || "API Call",
                    data: edge.data,
                }))
            };
        }
        processedNodes.push(processedNode);
    });
    return processedNodes;
};

const prepareProjectForApi = (project: Project, codeGenerationType?: CodeGenerationType) => {
    const latestSnapshot = project.snapshots[project.snapshots.length - 1];
    
    const nodes = processNodesRecursive(latestSnapshot.nodes);
    
    const edges = latestSnapshot.edges.map((edge: Edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.label || "API Call",
        data: edge.data,
    }));
    
    const payload: any = { 
        name: project.name, 
        type: project.type, 
        nodes, 
        edges,
        settings: project.settings 
    };

    if (codeGenerationType) {
        payload.codeGenerationType = codeGenerationType;
    }

    return payload;
};

export const generateCodeAndSetFiles = async (project: Project, codeGenerationType: CodeGenerationType): Promise<void> => {
    try {
        const projectData = prepareProjectForApi(project, codeGenerationType);
        useStore.getState().setIsGenerating(true);
        const response = await axios.post('/api/generate-json', { project: projectData }, {
            responseType: 'json',
        });
        useStore.getState().setIsGenerating(false);
        useStore.getState().setGeneratedFiles(response.data);
        useStore.getState().openEditor();
        alert('Project generated successfully!');
    } catch (error) {
        useStore.getState().setIsGenerating(false);
        console.error('Error generating code:', error);
        alert('An error occurred during code generation.');
    }
};

export const generateCodeAndDownloadZip = async (project: Project, codeGenerationType: CodeGenerationType): Promise<void> => {
    try {
        const projectData = prepareProjectForApi(project, codeGenerationType);
        useStore.getState().setIsGenerating(true);
        const response = await axios.post('/api/generate-zip', { project: projectData }, {
            responseType: 'blob',
        });
        useStore.getState().setIsGenerating(false);
        const blob = new Blob([response.data], { type: 'application/zip' });
        saveAs(blob, `${project.name}.zip`);
        alert('Project zip downloaded successfully!');
    } catch (error) {
        useStore.getState().setIsGenerating(false);
        console.error('Error generating and downloading zip:', error);
        alert('An error occurred while downloading the project.');
    }
};

export const checkAndSuggest = async (project: Project): Promise<any> => {
    try {
        const projectData = prepareProjectForApi(project);
        useStore.getState().setIsChecking(true);
        const response = await axios.post('/api/suggest', { project: projectData });
        useStore.getState().setIsChecking(false);
        useStore.getState().setSuggestions(response.data.suggestions);
        return response.data;
    } catch (error) {
        useStore.getState().setIsChecking(false);
        console.error('Error fetching suggestions:', error);
        alert('An error occurred during suggestions generation.');
        return null;
    }
}
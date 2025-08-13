import { Request, Response } from 'express';
import { generateCodeFromDiagram, generateSuggestionsFromDiagram } from '../services/aiService';
import { createZipFromResponse } from '../services/fileService';

export const generateCodeAndZip = async (req: Request, res: Response) => {
  try {
    const { project } = req.body;
    
    if (!project) {
      return res.status(400).json({ error: 'Project data is required.' });
    }

    console.log(`Received project data for generation type: ${project.codeGenerationType}, generating prompt...`);
    const generatedCode = await generateCodeFromDiagram(project);

    if (!generatedCode || Object.keys(generatedCode).length === 0) {
      throw new Error('AI failed to generate code.');
    }
    
    console.log('AI code generation complete. Zipping files...');
    const projectName = project.name.replace(/\s+/g, '_') || 'flow2code-export';
    
    res.setHeader('Content-Disposition', `attachment; filename=${projectName}.zip`);
    res.setHeader('Content-Type', 'application/zip');
    
    await createZipFromResponse(generatedCode, res);
    console.log('Zip file successfully streamed to client.');

  } catch (error) {
    console.error('Error during code generation and zipping:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to generate project zip.', details: errorMessage });
  }
};

export const getSuggestions = async (req: Request, res: Response) => {
  try {
    const { project } = req.body;
    if (!project) {
      return res.status(400).json({ error: 'Project data is required for suggestions.' });
    }
    console.log('Received project data for suggestions...');
    const suggestions = await generateSuggestionsFromDiagram(project);
    res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error during suggestion generation:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to generate suggestions.', details: errorMessage });
  }
};
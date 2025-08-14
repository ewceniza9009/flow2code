import { Router } from 'express';
import { generateCodeAndZip, generateCodeAsJson, getSuggestions } from '../controllers/generationController';

const router = Router();

router.post('/api/generate-zip', generateCodeAndZip);
router.post('/api/generate-json', generateCodeAsJson);
router.post('/api/suggest', getSuggestions);

export default router;
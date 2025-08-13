import { Router } from 'express';
import { generateCodeAndZip, getSuggestions } from '../controllers/generationController';

const router = Router();

router.post('/generate', generateCodeAndZip);
router.post('/suggest', getSuggestions);

export default router;
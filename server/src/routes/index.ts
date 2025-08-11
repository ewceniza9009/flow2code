import { Router } from 'express';
import { generateCodeAndZip } from '../controllers/generationController';

const router = Router();

router.post('/generate', generateCodeAndZip);

export default router;
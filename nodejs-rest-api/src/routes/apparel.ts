
import { Router } from 'express';
import { updateSingleStock, updateStock, checkOrder, getLowestCost } from '../controllers/apparelController';

const router = Router();

router.put('/update-single', updateSingleStock);
router.put('/update', updateStock);
router.post('/check-order', checkOrder);
router.post('/lowest-cost', getLowestCost);

export default router;

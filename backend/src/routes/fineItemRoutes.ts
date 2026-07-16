import express from 'express';
import FineItemController from '../controllers/fineItemController';
import { authorize } from '../middlewares/authorizer';

const router = express.Router();

/**
 * @swagger
 * /fine-items/branch/{id}:
 *   get:
 *     summary: Get data
 *     tags: [FineItem]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/branch/:id', (req, res) => {
    authorize(req, res, ["staff", "manager", "admin"], FineItemController.getFineItemsByBranchId(req, res))
});
/**
 * @swagger
 * /fine-items:
 *   get:
 *     summary: Get data
 *     tags: [FineItem]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', (req, res) => {
    authorize(req, res, ["staff", "manager", "admin"], FineItemController.getAllFineItems(req, res))
});
/**
 * @swagger
 * /fine-items/{id}:
 *   get:
 *     summary: Get data
 *     tags: [FineItem]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/:id', (req, res) => {
    authorize(req, res, ["staff", "manager", "admin"], FineItemController.getFineItemById(req, res))
});
/**
 * @swagger
 * /fine-items:
 *   post:
 *     summary: Create new record
 *     tags: [FineItem]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Successful operation
 */
router.post('/', (req, res) => {
    authorize(req, res, ["manager", "admin"], FineItemController.createFineItem(req, res))
});
/**
 * @swagger
 * /fine-items/{id}:
 *   put:
 *     summary: Update record
 *     tags: [FineItem]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.put('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], FineItemController.updateFineItem(req, res))
});
/**
 * @swagger
 * /fine-items/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [FineItem]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.delete('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], FineItemController.deleteFineItem(req, res))
});

export default router;

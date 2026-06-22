import express from 'express';
import FineItemController from '../controllers/fineItemController';

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
router.get('/branch/:id', FineItemController.getFineItemsByBranchId);
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
router.get('/', FineItemController.getAllFineItems);
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
router.get('/:id', FineItemController.getFineItemById);
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
router.post('/', FineItemController.createFineItem);
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
router.put('/:id', FineItemController.updateFineItem);
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
router.delete('/:id', FineItemController.deleteFineItem);

export default router;

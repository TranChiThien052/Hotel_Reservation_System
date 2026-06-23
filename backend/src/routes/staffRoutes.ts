import express from 'express';
import StaffController from '../controllers/staffController';


const router = express.Router();

/**
 * @swagger
 * /staffs:
 *   get:
 *     summary: Get data
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *            application/json:
 *               schema:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                        id:
 *                           type: string
 *                        branch_id:
 *                           type: string
 *                        account_id:
 *                           type: string
 *                        full_name:
 *                           type: string
 *                        phone:
 *                           type: string
 *                        position:
 *                           type: string
 *                        created_at:
 *                           type: string
 *       500:
 *         description: Internal server error
 */
router.get('/', StaffController.getAllStaff);
/**
 * @swagger
 * /staffs/{id}:
 *   get:
 *     summary: Get data
 *     tags: [Staff]
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
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     id:
 *                        type: string
 *                     branch_id:
 *                        type: string
 *                     account_id:
 *                        type: string
 *                     full_name:
 *                        type: string
 *                     phone:
 *                        type: string
 *                     position:
 *                        type: string
 *                     created_at:
 *                        type: string
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', StaffController.getStaffById);
/**
 * @swagger
 * /staffs:
 *   post:
 *     summary: Create new record
 *     tags: [Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                branch_id:
 *                   type: string
 *                account_id:
 *                   type: string
 *                full_name:
 *                   type: string
 *                phone:
 *                   type: string
 *                position:
 *                   type: string
 *     responses:
 *       201:
 *         description: Successful operation
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     id:
 *                        type: string
 *                     branch_id:
 *                        type: string
 *                     account_id:
 *                        type: string
 *                     full_name:
 *                        type: string
 *                     phone:
 *                        type: string
 *                     position:
 *                        type: string
 *                     created_at:
 *                        type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /staffs/branch/{id}:
 *   get:
 *     summary: Get data
 *     tags: [Staff]
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
 *         content:
 *            application/json:
 *               schema:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                        id:
 *                           type: string
 *                        branch_id:
 *                           type: string
 *                        account_id:
 *                           type: string
 *                        full_name:
 *                           type: string
 *                        phone:
 *                           type: string
 *                        position:
 *                           type: string
 *                        created_at:
 *                           type: string
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Internal server error
 */
router.get('/branch/:id', StaffController.getStaffByBranchId)

router.post('/', StaffController.createStaff);
/**
 * @swagger
 * /staffs/{id}:
 *   put:
 *     summary: Update record
 *     tags: [Staff]
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
 *             properties:
 *                branch_id:
 *                   type: string
 *                full_name:
 *                   type: string
 *                phone:
 *                   type: string
 *                position:
 *                   type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     id:
 *                        type: string
 *                     branch_id:
 *                        type: string
 *                     full_name:
 *                        type: string
 *                     phone:
 *                        type: string
 *                     position:
 *                        type: string
 *                     created_at:
 *                        type: string
 *       400:
 *         description: Bad request
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', StaffController.updateStaff);
/**
 * @swagger
 * /staffs/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [Staff]
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
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     id:
 *                        type: string
 *                     branch_id:
 *                        type: string
 *                     full_name:
 *                        type: string
 *                     phone:
 *                        type: string
 *                     position:
 *                        type: string
 *                     created_at:
 *                        type: string
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', StaffController.deleteStaff);

export default router;

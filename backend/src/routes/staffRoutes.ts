import express from 'express';
import StaffController from '../controllers/staffController';


const router = express.Router();

/**
 * @swagger
 * /staff:
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
 *                        accounts:
 *                           type: object
 *                           properties:
 *                              id: 
 *                                  type: string
 *                                  format: uuid
 *                              username:
 *                                  type: string
 *                              status:
 *                                  type: enum
 *                                  enum: ['active', 'inactive']
 *                              branch_id:
 *                                  type: string
 *                                  format: uuid
 *       500:
 *         description: Internal server error
 */
router.get('/', StaffController.getAllStaff);
/**
 * @swagger
 * /staff/{id}:
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
 *                     accounts:
 *                        type: object
 *                        properties:
 *                           id:
 *                              type: string
 *                              format: uuid
 *                           username:
 *                              type: string
 *                           status:
 *                              type: string
 *                              format: enum
 *                              enum: ['active', 'inactive']
 *                           branch_id:
 *                              type: string
 *                              format: uuid
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', StaffController.getStaffById);
/**
 * @swagger
 * /staff:
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
router.post('/', StaffController.createStaff);
/**
 * @swagger
 * /staff/branches/{id}:
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
 *                        accounts:
 *                           type: object
 *                           properties:
 *                              id:
 *                                 type: string
 *                                 format: uuid
 *                              username:
 *                                 type: string
 *                              status:
 *                                 type: string
 *                                 format: enum
 *                                 enum: ['active', 'inactive']
 *                              branch_id:
 *                                 type: string
 *                                 format: uuid
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Internal server error
 */
router.get('/branches/:id', StaffController.getStaffByBranchId)
/**
 * @swagger
 * /staff/{id}:
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
 * /staff/{id}:
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

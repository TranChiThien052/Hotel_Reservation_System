import express from 'express';
import BranchController from '../controllers/branchController';
import { authorize } from '../middlewares/authorizer';

const router = express.Router();

/**
 * @swagger
 * /branches:
 *   get:
 *     summary: Lấy danh sách tất cả các chi nhánh
 *     tags: [Branches]
 *     responses:
 *       200:
 *         description: Danh sách chi nhánh
 */
router.get('/', BranchController.getAllBranches);

/**
 * @swagger
 * /branches/{id}:
 *   get:
 *     summary: Lấy thông tin chi nhánh
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin chi nhánh
 */
router.get('/:id', (req, res) => {
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => BranchController.getBranchById(req, res))
});

/**
 * @swagger
 * /branches:
 *   post:
 *     summary: Tạo một chi nhánh mới
 *     tags: [Branches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chi nhánh được tạo thành công
 */
router.post('/', (req, res) => {
    authorize(req, res, ["admin"], () => BranchController.createBranch(req, res))
});

/**
 * @swagger
 * /branches/{id}:
 *   put:
 *     summary: Cập nhật chi nhánh
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi nhánh được cập nhật thành công
 */
router.put('/:id', (req, res) => {
    authorize(req, res, ["admin"], () => BranchController.updateBranch(req, res))
});
/**
 * @swagger
 * /branches/{id}:
 *   delete:
 *     summary: Xóa chi nhánh
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi nhánh được xóa thành công
 */
router.delete('/:id', (req, res) => {
    authorize(req, res, ["admin"], () => BranchController.deleteBranch(req, res))
});

export default router;
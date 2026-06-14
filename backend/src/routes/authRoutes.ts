import express from 'express';

const router = express.Router();

router.post('/login', (req, res) => {
    res.status(200).json({ message: "Login successful" });
});

router.post('/logout', (req, res) => {
    res.status(200).json({ message: "Logout successful" });
});

router.post('/refresh-token', (req, res) => {
    res.status(200).json({ message: "Token refreshed successfully" });
});

router.get('/me', (req, res) => {
    res.status(200).json({ message: "User information retrieved successfully" });
});

export default router;
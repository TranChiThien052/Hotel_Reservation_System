import express from 'express';
import branchRoutes from './routes/branchRoutes.ts';

const app = express();

const PORT = 3000;

app.use(express.json());

app.use('/branches', branchRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
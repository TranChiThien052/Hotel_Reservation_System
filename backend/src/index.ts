import express from 'express';
import { branchRoutes, roomTypeRoutes, roomRoutes } from './routes/index.ts'; 

const app = express();

const PORT = 3000;

app.use(express.json());

app.use('/branches', branchRoutes);
app.use('/room-types', roomTypeRoutes);
app.use('/rooms', roomRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
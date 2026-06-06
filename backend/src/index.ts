import express from 'express';
import route from './routes/index.ts'; 
    
const app = express();

const PORT = 3000;

app.use(express.json());

app.use('/branches', route.branchRoutes);
app.use('/room-types', route.roomTypeRoutes);
app.use('/rooms', route.roomRoutes);
app.use('/room-prices', route.roomPriceRoutes);
app.use('/services', route.roomServiceRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
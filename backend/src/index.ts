import express from 'express';
import routes from './routes/index.ts'; 
    
const app = express();

const PORT = 3000;

app.use(express.json());

app.use('/branches', routes.branchRoutes);
app.use('/room-types', routes.roomTypeRoutes);
app.use('/rooms', routes.roomRoutes);
app.use('/room-prices', routes.roomPriceRoutes);
app.use('/services', routes.roomServiceRoutes);
app.use('/discounts', routes.discountRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
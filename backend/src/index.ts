import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.ts'; 

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL }));
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
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from './routes/index';

const app = express();

// CORS configuration - shared between middleware and preflight handler
const corsOptions: cors.CorsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            process.env.FRONTEND_URL,       // Production Vercel URL
            'http://localhost:5173',         // Local dev
            'http://localhost:3000',         // Alternative local dev
        ].filter(Boolean); // Remove undefined values

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

app.use(cors(corsOptions));
app.options("/{*path}", cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Existing routes
app.use('/branches', routes.branchRoutes);
app.use('/room-types', routes.roomTypeRoutes);
app.use('/rooms', routes.roomRoutes);
app.use('/room-prices', routes.roomPriceRoutes);
app.use('/services', routes.roomServiceRoutes);
app.use('/discounts', routes.discountRoutes);

// User Management routes
app.use('/accounts', routes.accountRoutes);
app.use('/customers', routes.customerRoutes);
app.use('/staff', routes.staffRoutes);

// Booking Management routes
app.use('/bookings', routes.bookingRoutes);
app.use('/booking-services', routes.bookingServiceRoutes);
app.use('/cancellation-requests', routes.cancellationRequestRoutes);
app.use('/holiday-dates', routes.holidayDateRoutes);

// Financial Management routes
app.use('/invoices', routes.invoiceRoutes);
app.use('/payments', routes.paymentRoutes);
app.use('/fine-items', routes.fineItemRoutes);
app.use('/invoice-fines', routes.invoiceFineRoutes);

// History routes
app.use('/history-transactions', routes.historyTransactionRoutes);

// Authentication routes
app.use('/auth', routes.authRoutes);

export default app;

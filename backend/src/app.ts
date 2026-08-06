import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from './routes/index';
import { swaggerUi, swaggerSpec } from './swagger';
import { getTransporter } from './services/emailServices';

const app = express();

const transporter = getTransporter();

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ SMTP connection failed:", error.message);
    } else {
        console.log("✅ SMTP server is ready to send emails");
    }
});

app.use(cors({
    origin: (origin, callback) => {
        callback(null, origin || true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/branches', routes.branchRoutes);
app.use('/room-types', routes.roomTypeRoutes);
app.use('/rooms', routes.roomRoutes);
app.use('/rooms-availability', routes.roomAvailabilityRoutes);
app.use('/room-prices', routes.roomPriceRoutes);
app.use('/services', routes.roomServiceRoutes);
app.use('/discounts', routes.discountRoutes);
app.use('/accounts', routes.accountRoutes);
app.use('/customers', routes.customerRoutes);
app.use('/staff', routes.staffRoutes);
app.use('/bookings', routes.bookingRoutes);
app.use('/booking-services', routes.bookingServiceRoutes);
app.use('/cancellation-requests', routes.cancellationRequestRoutes);
app.use('/holiday-dates', routes.holidayDateRoutes);
app.use('/invoices', routes.invoiceRoutes);
app.use('/payments', routes.paymentRoutes);
app.use('/fine-items', routes.fineItemRoutes);
app.use('/invoice-fines', routes.invoiceFineRoutes);
app.use('/history-transactions', routes.historyTransactionRoutes);
app.use('/auth', routes.authRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
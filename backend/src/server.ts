import app from './app';
import dotenv from 'dotenv';
import dns from 'dns';
import { getTransporter } from './services/emailServices';

dns.setDefaultResultOrder("ipv4first");

const transporter = getTransporter();

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ SMTP connection failed:", error.message);
    } else {
        console.log("✅ SMTP server is ready to send emails");
    }
});

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

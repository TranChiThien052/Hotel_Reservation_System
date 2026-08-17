import app from './app';
import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const PORT = process.env.PORT || 3000;

app.get('/loaderio-39b08f8565f4e97ffa6beb73d50e73bd.txt', (req, res) => {
    res.sendFile(process.cwd() + '/src/loaderio-39b08f8565f4e97ffa6beb73d50e73bd.txt');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

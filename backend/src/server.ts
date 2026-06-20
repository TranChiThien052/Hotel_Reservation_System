import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
}

import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

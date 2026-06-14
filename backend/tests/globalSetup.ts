import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default async function globalSetup() {
  // Đảm bảo biến môi trường test được load
  process.env.NODE_ENV = 'test';

  console.log('🔧 Applying migrations to test database...');
  execSync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
    },
    stdio: 'inherit',
  });
  console.log('✅ Test database ready');
}
export default async function globalTeardown() {
  console.log('🧹 Teardown complete');
  // PrismaClient đóng trong từng test file, không cần đóng ở đây
}
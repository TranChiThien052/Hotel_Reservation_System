import { prisma } from "./lib/prisma";

async function main() {
    const branches = await prisma.branches.findMany();
    console.log(branches);
};

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
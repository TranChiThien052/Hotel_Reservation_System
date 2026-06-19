import { prisma } from "../config/prisma";

class RefreshTokenRepository {
    async createRefreshToken(data) {
        return await prisma.refresh_tokens.create({
            data: data,
        });
    }

    async getRefreshTokenById(id) {
        return await prisma.refresh_tokens.findUnique({
            where: { id: id },
        });
    }

    async getRefreshTokenByAccountId(accountId) {
        return await prisma.refresh_tokens.findMany({
            where: {
                account_id: accountId,
                is_revoked: false,
            },
        });
    }

    async updateRefreshToken(id, data) {
        return await prisma.refresh_tokens.update({
            where: { id: id },
            data: data,
        });
    }

}

export default RefreshTokenRepository;
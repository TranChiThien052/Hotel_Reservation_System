import { prisma } from '../config/prisma';

class ResetTokenPasswordRepository {
    async createResetPasswordToken(data) {
        return await prisma.password_reset_token.create({
            data: data
        })
    };

    async getResetPasswordToken(hashedToken) {
        return await prisma.password_reset_token.findUnique({
            where: {
                token_hash: hashedToken
            }
        })
    };

    async updateResetPasswordToken(hashToken, data) {
        return await prisma.password_reset_token.update({
            where: {
                token_hash: hashToken
            },
            data: data
        })
    };
}

export default new ResetTokenPasswordRepository();
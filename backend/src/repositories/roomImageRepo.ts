import { prisma } from '../config/prisma';

class RoomImageRepository {
    async createRoomImages(room_type_id, images) {
        return await prisma.room_image.createMany({
            data: images.map((image) => ({
                room_type_id: room_type_id,
                image_url: image.path,
                image_public_id: image.filename,
            }))
        })
    }
}

export default new RoomImageRepository();
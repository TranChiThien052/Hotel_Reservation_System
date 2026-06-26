import RoomAvailabilityService from '../services/roomAvailabilityServices';

class RoomAvailabilityController {
    async getAvailableRoomCount(req, res) {
        try {
            const { branch_id, checkin, checkout, room_type_id } = req.query;
            if (!branch_id || !checkin || !checkout) {
                return res.status(400).json({ error: "Missing required parameters: branch_id, checkin, checkout" });
            }
            const result = await RoomAvailabilityService.getAvailableRoomCount(branch_id, checkin, checkout, room_type_id);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async searchAvailableRooms(req, res) {
        try {
            const { branch_id, checkin_at, checkout_at, room_type_id, num_guests, booking_type } = req.query;

            if (!branch_id || !checkin_at || !checkout_at) {
                return res.status(400).json({ error: "Missing required parameters: branch_id, checkin_at, checkout_at" });
            }

            const results = await RoomAvailabilityService.searchAvailableRooms(
                branch_id,
                checkin_at,
                checkout_at,
                room_type_id,
                num_guests ? parseInt(num_guests) : undefined,
                booking_type
            );

            return res.status(200).json(results);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}

export default new RoomAvailabilityController();

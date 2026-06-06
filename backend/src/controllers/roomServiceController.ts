import RoomServiceServices from '../services/roomServiceSerives.ts';

class RoomServiceController {
    async getAllServices(req, res) {
        return await RoomServiceServices.getAllServices()
        .then(services => res.status(200).json(services))
        .catch(error => res.status(500).json({ error: error.message }));
    };

    async getServiceById(req, res) {
        const { id } = req.params;
        return await RoomServiceServices.getServiceById(id)
        .then(service => {
            if (!service) {
                return res.status(404).json({ error: "Service not found" });
            }
            res.status(200).json(service);
        })
        .catch(error => res.status(500).json({ error: error.message }));
    };

    async createService(req, res) {
        const data = req.body;
        return await RoomServiceServices.createService(data)
        .then(createdService => res.status(201).json(createdService))
        .catch(error => res.status(500).json({ error: error.message }));
    };

    async updateService(req, res) {
        const { id } = req.params;
        const data = req.body;
        return await RoomServiceServices.updateService(id, data)
        .then(updatedService => res.status(200).json(updatedService))
        .catch(error => {
            if (error.message === "Service not found") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        });
    };

    async deleteService(req, res) {
        const { id } = req.params;
        return await RoomServiceServices.deleteService(id)
        .then(deletedService => res.status(200).json(deletedService))
        .catch(error => {
            if (error.message === "Service not found") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        });
    };
}

export default new RoomServiceController();
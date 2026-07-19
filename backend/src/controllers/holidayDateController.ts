import HolidayDateService from '../services/holidayDateServices';

class HolidayDateController {
    async getAllHolidayDates(req, res) {
        return await HolidayDateService.getAllHolidayDates()
            .then(dates => res.status(200).json(dates))
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async getHolidayDateById(req, res) {
        const { id } = req.params;
        return await HolidayDateService.getHolidayDateById(id)
            .then(date => {
                if (!date) {
                    return res.status(404).json({ error: "Holiday date not found" });
                }
                res.status(200).json(date);
            })
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async createHolidayDate(req, res) {
        const { branch_id, date, name } = req.body;
        const data = { branch_id, date, name, log_account_id: req.user?.account_id };
        return await HolidayDateService.createHolidayDate(data)
            .then(holidayDate => res.status(201).json(holidayDate))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async updateHolidayDate(req, res) {
        const { id } = req.params;
        const { branch_id, date, name } = req.body;
        const data = { branch_id, date, name, log_account_id: req.user?.account_id };
        return await HolidayDateService.updateHolidayDate(id, data)
            .then(holidayDate => res.status(200).json(holidayDate))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async deleteHolidayDate(req, res) {
        const { id } = req.params;
        return await HolidayDateService.deleteHolidayDate(id)
            .then(holidayDate => res.status(200).json(holidayDate))
            .catch(error => {
                if (error.code === "P2025") {
                    return res.status(404).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };
}

export default new HolidayDateController();

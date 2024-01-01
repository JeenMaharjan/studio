const Notification = require("../models/notificationsModel");

const create = async (req, res) => {
    try {
        const newNotification = new Notification(req.body);
        await newNotification.save();
        res.send({
            success: true,
            message: "Notification added successfully",
        });
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        });
    }
}

const listAll = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const read = async (req, res) => {
    try {
        
        await Notification.updateMany({ read: false }, { $set: { read: true } });
        res.send({
            success: true,
            message: "All notifications marked as read",
        });
    } catch (error) {
        console.log(error)
    }
}

const remove = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.send({
            success: true,
            message: "Notification deleted successfully",
        });
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        });
    }
}
module.exports = {
    create , listAll , read , remove
  };
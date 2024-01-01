const Book = require("../models/book.js");

const create = async (req, res) => {
    try {
        const { name, email, phone, address,  dates , price } = req.body;

        

        // Create a new Book instance with the provided data
        const newBooking = new Book({
            name,
            email,
            phone,
            address,
            
            price,
            dates,
        });

        // Save the new booking to the database
        const savedBooking = await newBooking.save();

        // Respond with the saved booking
        return res.status(201).json(savedBooking);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllBooking = async (req, res) => {
    try {
        // Use the find method to retrieve all documents from the Book collection
        const allBookings = await Book.find();

        // Extract the dates from each booking and flatten the array
        const allDates = allBookings.map(booking => booking.dates);

        // Respond with the array of dates
        return res.status(200).json(allDates);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllBookingRecords = async (req, res) => {
    try {
        // Use the find method to get all booking records
        const bookingRecords = await Book.find().sort({ createdAt: -1 });

        // Send the booking records as a response
        res.status(200).json(bookingRecords);
    } catch (error) {
        // Handle any errors that may occur during the process
        console.error('Error fetching booking records:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

module.exports = {
    create , getAllBooking , getAllBookingRecords
  };
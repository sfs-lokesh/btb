const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/behind-the-build';

const StallSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String },
    category: { type: String, enum: ['Premium', 'Standard', 'Economy'], required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['Available', 'Booked', 'OnHold'], default: 'Available' },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookingDetails: {
        firstName: String,
        lastName: String,
        contact: String,
        email: String,
        paymentMethod: String, // 'Offline'
        bookingDate: Date,
    }
}, { timestamps: true });

const Stall = mongoose.models.Stall || mongoose.model('Stall', StallSchema);

async function seedStalls() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);

        console.log('Clearing existing stalls...');
        await Stall.deleteMany({});

        const stalls = [];

        // Generate Premium Stalls (P1-P5) - Center Limit
        for (let i = 1; i <= 5; i++) {
            stalls.push({
                name: `P${i}`,
                location: 'Center Hall',
                category: 'Premium',
                price: 15000,
                status: 'Available'
            });
        }

        // Generate Standard Stalls (S1-S10) - East/West Wings
        for (let i = 1; i <= 10; i++) {
            stalls.push({
                name: `S${i}`,
                location: i <= 5 ? 'East Wing' : 'West Wing',
                category: 'Standard',
                price: 10000,
                status: 'Available'
            });
        }

        // Generate Economy Stalls (E1-E10) - Outer Ring
        for (let i = 1; i <= 10; i++) {
            stalls.push({
                name: `E${i}`,
                location: 'Outer Ring',
                category: 'Economy',
                price: 5000,
                status: 'Available'
            });
        }

        // Randomly mark a few as Booked for visual demo
        stalls[2].status = 'Booked'; // P3 Booked
        stalls[7].status = 'Booked'; // S3 Booked
        stalls[16].status = 'OnHold'; // E2 On Hold

        await Stall.insertMany(stalls);
        console.log(`Seeded ${stalls.length} stalls.`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding stalls:', error);
        process.exit(1);
    }
}

seedStalls();

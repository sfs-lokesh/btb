const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/behind-the-build';

// Minimal User Schema for seeding
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Participant', 'Audience', 'Delegate', 'Sponsor', 'Admin', 'Manager', 'SuperAdmin', 'SponsorAdmin'], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to:', MONGODB_URI);

        const users = [
            {
                name: 'System Admin',
                email: 'admin@example.com',
                password: 'password123',
                role: 'Admin'
            },
            {
                name: 'System Manager',
                email: 'manager@example.com',
                password: 'password123',
                role: 'Manager'
            },
            {
                name: 'Test Participant',
                email: 'user@example.com',
                password: 'password123',
                role: 'Participant'
            }
        ];

        for (const u of users) {
            // Check if user exists
            const existing = await User.findOne({ email: u.email });
            if (existing) {
                console.log(`User ${u.email} already exists. Removing...`);
                await User.deleteOne({ email: u.email });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(u.password, salt);

            // Create user
            await User.create({
                ...u,
                password: hashedPassword
            });
            console.log(`Created user: ${u.email} (${u.role})`);
        }

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedUsers();


import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'Admin',
    },
    {
        name: 'Manager User',
        email: 'manager@example.com',
        password: 'password123',
        role: 'Manager',
    },
    {
        name: 'Participant User',
        email: 'user@example.com',
        password: 'password123',
        role: 'Participant',
        phone: '1234567890',
    },
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB');

        for (const u of users) {
            const existingUser = await User.findOne({ email: u.email });
            if (existingUser) {
                console.log(`User ${u.email} already exists. Skipping...`);
                continue;
            }

            // Model handles hashing in pre-save
            await User.create(u);
            console.log(`Created user: ${u.email}`);
        }

        console.log('Seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();

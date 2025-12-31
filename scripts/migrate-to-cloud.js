
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables for Cloud URI including special encoding
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Configuration
const LOCAL_URI = 'mongodb://localhost:27017/behind-the-build';
const CLOUD_URI = process.env.MONGODB_URI;

if (!CLOUD_URI) {
    console.error("❌ MONGODB_URI is missing in .env.local");
    process.exit(1);
}

// Default Users to ensure exist
const defaultUsers = [
    { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'Admin' },
    { name: 'Manager User', email: 'manager@example.com', password: 'password123', role: 'Manager' },
    { name: 'Participant User', email: 'user@example.com', password: 'password123', role: 'Participant', phone: '1234567890' }
];

async function migrate() {
    console.log("🚀 Starting migration from Local to Cloud...");
    console.log(`📂 Local: ${LOCAL_URI}`);
    console.log(`☁️  Cloud: ${CLOUD_URI.split('@')[1]}`); // Hide credentials

    const { MongoClient } = mongoose.mongo;
    const localClient = new MongoClient(LOCAL_URI);
    const cloudClient = new MongoClient(CLOUD_URI);

    try {
        // 1. Connect
        await localClient.connect();
        console.log('✅ Connected to Local DB');
        const localDb = localClient.db();

        await cloudClient.connect();
        console.log('✅ Connected to Cloud DB');
        const cloudDb = cloudClient.db('behind-the-build'); // Force DB name

        // 2. Collections to migrate
        const collections = ['users', 'tickets', 'colleges', 'categories', 'sponsors', 'stalls', 'influencercoupons', 'pitches'];

        for (const colName of collections) {
            const data = await localDb.collection(colName).find({}).toArray();
            if (data.length > 0) {
                console.log(`📦 Migrating ${data.length} documents from '${colName}'...`);

                const operations = data.map(doc => ({
                    replaceOne: {
                        filter: { _id: doc._id },
                        replacement: doc,
                        upsert: true
                    }
                }));

                await cloudDb.collection(colName).bulkWrite(operations);
                console.log(`   ✨ Synced '${colName}'`);
            } else {
                console.log(`   ⚠️ No data found in '${colName}' (skipping)`);
            }
        }

        // 3. Ensure Default Users Exist (The ones you requested)
        console.log("\n🔒 Verifying Default Credentials in Cloud...");
        const usersCol = cloudDb.collection('users');

        for (const u of defaultUsers) {
            const exists = await usersCol.findOne({ email: u.email });
            if (!exists) {
                console.log(`   ➕ Creating missing user: ${u.email}`);
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(u.password, salt);

                await usersCol.insertOne({
                    ...u,
                    password: hashedPassword,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            } else {
                console.log(`   ✅ User exists: ${u.email}`);
            }
        }

        console.log("\n🎉 Migration & Setup Complete!");

    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        await localClient.close();
        await cloudClient.close();
        process.exit(0);
    }
}

migrate();

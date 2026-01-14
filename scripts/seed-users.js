#!/usr/bin/env node
/**
 * Seed script to create mock users for performance testing
 * Usage: node scripts/seed-users.js [count]
 */

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/postgres';
const userCount = parseInt(process.argv[2] || '100', 10);

const pool = new Pool({ connectionString });

const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Tom', 'Anna', 
    'James', 'Emma', 'Robert', 'Olivia', 'William', 'Sophia', 'Daniel', 'Ava', 'Joseph', 'Mia'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 
    'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'White', 'Harris', 'Clark'];
const statuses = ['active', 'active', 'active', 'inactive', 'suspended']; // Valid: active, inactive, suspended, deleted
const roles = ['user', 'user', 'user', 'admin', 'moderator', 'guest']; // Valid: user, admin, moderator, guest

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateUser(index) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${index}`;
    const email = `${username}@example.com`;
    
    return {
        username,
        email,
        firstName,
        lastName,
        status: randomItem(statuses),
        role: randomItem(roles),
        avatarUrl: `https://i.pravatar.cc/150?u=${username}`,
        bio: `Hi, I'm ${firstName} ${lastName}. This is my bio for testing.`,
    };
}

async function seedUsers() {
    const client = await pool.connect();
    
    try {
        console.log(`🌱 Seeding ${userCount} users...`);
        
        // Check existing count
        const { rows: [{ count: existingCount }] } = await client.query('SELECT COUNT(*) FROM users');
        console.log(`   Existing users: ${existingCount}`);
        
        // Generate and insert users
        const users = [];
        for (let i = 1; i <= userCount; i++) {
            users.push(generateUser(i + parseInt(existingCount, 10)));
        }
        
        // Batch insert using unnest for performance
        const query = `
            INSERT INTO users (username, email, first_name, last_name, status, role, avatar_url, bio)
            SELECT * FROM UNNEST(
                $1::text[], $2::text[], $3::text[], $4::text[], 
                $5::text[], $6::text[], $7::text[], $8::text[]
            )
            ON CONFLICT (username) DO NOTHING
            RETURNING id
        `;
        
        const result = await client.query(query, [
            users.map(u => u.username),
            users.map(u => u.email),
            users.map(u => u.firstName),
            users.map(u => u.lastName),
            users.map(u => u.status),
            users.map(u => u.role),
            users.map(u => u.avatarUrl),
            users.map(u => u.bio),
        ]);
        
        console.log(`✅ Created ${result.rowCount} new users`);
        
        // Show final count
        const { rows: [{ count: finalCount }] } = await client.query('SELECT COUNT(*) FROM users');
        console.log(`📊 Total users in database: ${finalCount}`);
        
        // Show sample by status
        const { rows: statusCounts } = await client.query(
            'SELECT status, COUNT(*) as count FROM users GROUP BY status ORDER BY count DESC'
        );
        console.log('\n📈 Users by status:');
        statusCounts.forEach(row => console.log(`   ${row.status}: ${row.count}`));
        
    } catch (error) {
        console.error('❌ Error seeding users:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

seedUsers()
    .then(() => {
        console.log('\n✨ Seeding complete!');
        process.exit(0);
    })
    .catch(() => {
        process.exit(1);
    });

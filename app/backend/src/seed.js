require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./db');

// --- [เพิ่ม] ฟังก์ชันสำหรับรอ DB ---
const MAX_RETRIES = 15;
const RETRY_DELAY_MS = 3000; // 3 วินาที

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const waitForDatabase = async () => {
    for (let i = 1; i <= MAX_RETRIES; i++) {
        try {
            console.log(`Attempt ${i}/${MAX_RETRIES} to connect to database...`);
            const conn = await pool.getConnection();
            console.log('✅ Database connected.');
            return conn; // คืนค่า connection เมื่อสำเร็จ
        } catch (err) {
            if (err.code === 'ECONNREFUSED') {
                console.warn(`⚠️ Connection refused. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
                await sleep(RETRY_DELAY_MS);
            } else {
                console.error('Non-retriable error connecting to database:', err);
                throw err; // ถ้าเป็น error อื่น (เช่น พาสเวิร์ดผิด) ให้ล้มเหลวทันที
            }
        }
    }
    throw new Error('Database connection failed after all retries.');
};
// --- [สิ้นสุด] ฟังก์ชันสำหรับรอ DB ---


(async () => {
    let conn; // --- [ประกาศ] conn ไว้นอก try
    try {
        const imagesDir = path.join(__dirname, '..', 'seed_images');
        const descPath = path.join(__dirname, 'descriptions.json');

        console.log('Looking for images in:', imagesDir);
        console.log('Exists?', fs.existsSync(imagesDir));

        if (!fs.existsSync(imagesDir)) {
            console.error('seed_images folder not found');
            throw new Error('seed_images folder not found'); // --- [แก้] ใช้ throw
        }

        if (!fs.existsSync(descPath)) {
            console.error('descriptions.json not found');
            throw new Error('descriptions.json not found'); // --- [แก้] ใช้ throw
        }

        const descriptions = JSON.parse(fs.readFileSync(descPath, 'utf8'));
        const files = fs.readdirSync(imagesDir)
            .filter(f => /\.(jpe?g|png|gif|webp)$/i.test(f))
            .sort();

        // --- [แก้ไข] เรียกใช้ฟังก์ชัน waitForDatabase แทน ---
        conn = await waitForDatabase(); 
        // const conn = await pool.getConnection(); // <--- [ลบ] บรรทัดนี้

        await conn.beginTransaction();
        await conn.query('DELETE FROM images');

        for (const filename of files) {
            const filePath = path.join(imagesDir, filename);
            const data = fs.readFileSync(filePath);
            const mime = filename.toLowerCase().endsWith('.png') ? 'image/png'
                : filename.toLowerCase().endsWith('.gif') ? 'image/gif'
                : filename.toLowerCase().endsWith('.webp') ? 'image/webp'
                : 'image/jpeg';

            const description = descriptions[filename] || '';
            await conn.query(
                'INSERT INTO images (filename, mime_type, description, data) VALUES (?, ?, ?, ?)',
                [filename, mime, description, data]
            );
            console.log('Inserted', filename);
        }

        await conn.commit();
        console.log('Seeding done.');
    } catch (e) {
        if (conn) await conn.rollback(); // --- [เพิ่ม] rollback
        console.error(e);
        throw e; // โยน error ออกไปเพื่อให้ entrypoint.sh ล้มเหลว
    } finally {
        if (conn) conn.release(); // --- [แก้] ตรวจสอบว่า conn มีค่าก่อน
        console.log('Seed script finished. Connection released.');
    }
    await pool.end(); 
        console.log('Connection pool ended.');
})();
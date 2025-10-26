require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./db');

(async () => {
    const imagesDir = path.join(__dirname, '..', 'seed_images');
    const descPath = path.join(__dirname, 'descriptions.json');

    console.log('Looking for images in:', imagesDir);
    console.log('Exists?', fs.existsSync(imagesDir));

    if (!fs.existsSync(imagesDir)) {
        console.error('seed_images folder not found');
        process.exit(1);
    }

    if (!fs.existsSync(descPath)) {
        console.error('descriptions.json not found');
        process.exit(1);
    }

    const descriptions = JSON.parse(fs.readFileSync(descPath, 'utf8'));
    const files = fs.readdirSync(imagesDir)
        .filter(f => /\.(jpe?g|png|gif|webp)$/i.test(f))
        .sort();

    const conn = await pool.getConnection();
    try {
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
        await conn.rollback();
        console.error(e);
        process.exit(1);
    } finally {
        conn.release();
        process.exit(0);
    }
})();

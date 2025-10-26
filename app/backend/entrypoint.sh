#!/bin/sh

# ตั้งค่าให้ script หยุดทำงานทันทีถ้ามีคำสั่งใดล้มเหลว
set -e

echo "--- 1. Running Seed Script ---"
node src/seed.js

# ถ้า seed.js ล้มเหลว (throw error) 'set -e' จะทำให้ script หยุด
echo "✅ Seed script finished successfully."

echo "--- 2. Starting Web Server ---"
# 'exec' จะแทนที่ process ของ shell ด้วย process ของ node
# นี่คือวิธีที่ถูกต้องในการรันคำสั่งหลักของ container
exec node src/server.js
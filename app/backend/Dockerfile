FROM node:18

WORKDIR /app

COPY backend/package.json ./
RUN npm install --omit=dev

COPY backend/src ./src

# --- [ส่วนที่เพิ่มเข้ามา] ---

# 1. คัดลอก entrypoint script เข้าไปใน container
COPY backend/entrypoint.sh ./entrypoint.sh

# 2. ให้สิทธิ์ script ในการรัน (executable)
RUN chmod +x ./entrypoint.sh

# 3. ตั้งค่าให้ container เริ่มทำงานด้วย script นี้
ENTRYPOINT ["./entrypoint.sh"]

# --- [ส่วนที่แก้ไข] ---

# ลบ CMD เก่าทิ้ง เพราะ entrypoint.sh จะเป็นคนเรียก server.js เอง
# CMD ["node", "src/server.js"]
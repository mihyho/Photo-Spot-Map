import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create or open the database file
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create spots table
    db.run(`
      CREATE TABLE IF NOT EXISTS spots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        type TEXT DEFAULT 'other',
        info TEXT,
        gear TEXT,
        image TEXT,
        address TEXT
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table', err.message);
      } else {
        // Check if table is empty, if so, insert initial data
        db.get('SELECT COUNT(*) as count FROM spots', (err, row) => {
          if (row && row.count === 0) {
            console.log('Inserting initial data...');
            const initialSpots = [
              {
                name: "인천대공원 벚꽃길",
                lat: 37.4563,
                lng: 126.7052,
                type: "nature",
                info: "봄철 출사 명소. 주말엔 사람이 많아 오전 7시 이전 촬영을 추천합니다.",
                gear: "24-120mm 렌즈 추천",
                image: "https://images.unsplash.com/photo-1522383225653-ed111181a951?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                address: "인천광역시 남동구 무네미로 236"
              },
              {
                name: "송도 센트럴파크 야경",
                lat: 37.3925,
                lng: 126.6396,
                type: "cityscape",
                info: "빌딩 숲과 호수가 어우러진 화려한 야경 스팟입니다. 트라이포드가 필수입니다.",
                gear: "광각 렌즈, 삼각대",
                image: "https://images.unsplash.com/photo-1517713982677-4b66332f98de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                address: "인천광역시 연수구 컨벤시아대로 160"
              },
              {
                name: "강릉 안목해변 카페거리",
                lat: 37.7715,
                lng: 128.9472,
                type: "cafe",
                info: "푸른 바다를 배경으로 예쁜 음료와 디저트 사진을 남기기 좋습니다.",
                gear: "단렌즈(35mm, 50mm) 추천",
                image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                address: "강원특별자치도 강릉시 창해로14번길 20-1"
              }
            ];

            const insertStmt = db.prepare('INSERT INTO spots (name, lat, lng, type, info, gear, image, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
            initialSpots.forEach(spot => {
              insertStmt.run(spot.name, spot.lat, spot.lng, spot.type, spot.info, spot.gear, spot.image, spot.address);
            });
            insertStmt.finalize();
          }
        });
      }
    });
  }
});

export default db;

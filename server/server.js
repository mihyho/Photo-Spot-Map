import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup (주석 처리됨 - 차후 데이터베이스 서버 구성 시 사용)
/*
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
*/

// 1. 지도에 표시할 명소 데이터 불러오기 (GET)
app.get('/api/spots', (req, res) => {
  db.all('SELECT * FROM spots', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 2. 사용자가 새로운 포토 스팟 추가하기 (POST) - 위키 기능
// app.post('/api/spots', upload.single('imageFile'), (req, res) => { // 파일 업로드용
app.post('/api/spots', (req, res) => { // URL 링크용
  let imageUrl = req.body.image || 'https://images.unsplash.com/photo-1516961642265-531546e84af2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  
  /*
  if (req.file) {
    imageUrl = 'http://localhost:8080/uploads/' + req.file.filename;
  }
  */

  const newSpot = {
    name: req.body.name,
    lat: req.body.lat,
    lng: req.body.lng,
    type: req.body.type || 'other',
    info: req.body.info || '',
    gear: req.body.gear || '',
    image: imageUrl,
    address: req.body.address || ''
  };
  
  db.run(
    'INSERT INTO spots (name, lat, lng, type, info, gear, image, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [newSpot.name, newSpot.lat, newSpot.lng, newSpot.type, newSpot.info, newSpot.gear, newSpot.image, newSpot.address],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      newSpot.id = this.lastID;
      res.status(201).json({ message: "성공적으로 등록되었습니다.", spot: newSpot });
    }
  );
});

// 3. 기존 포토 스팟 정보 수정하기 (PUT)
app.put('/api/spots/:id', (req, res) => {
  const { id } = req.params;
  const { name, lat, lng, type, info, gear, image, address } = req.body;

  db.run(
    'UPDATE spots SET name = ?, lat = ?, lng = ?, type = ?, info = ?, gear = ?, image = ?, address = ? WHERE id = ?',
    [name, lat, lng, type, info, gear, image, address, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ message: "해당 스팟을 찾을 수 없습니다." });
        return;
      }
      res.json({ message: "성공적으로 수정되었습니다.", id });
    }
  );
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});

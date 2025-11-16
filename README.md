# 🍜 Sistem Bakso Business Management

Sistem manajemen bisnis bakso berbasis web yang lengkap dengan fitur manajemen stok, transaksi, dan laporan keuangan otomatis.

![Bakso Business](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Platform](https://img.shields.io/badge/Platform-Raspberry%20Pi%20%7C%20Linux%20%7C%20Windows-orange)

## 🌟 Fitur Utama

### 📊 Dashboard Real-time
- Total pendapatan harian
- Laba bersih otomatis
- Bonus karyawan (5% dari laba, maks Rp 10.000)
- Total transaksi
- Quick actions untuk akses cepat

### 📦 Manajemen Stok
- Input stok awal barang bawaan
- Input stok sisa di akhir hari
- Kalkulasi otomatis barang terjual
- Pendapatan otomatis dari stok
- Edit data stok (awal & sisa)
- Export data stok ke Excel

### 💰 Transaksi Paket Bakso
- Pilih harga paket (Rp 5.000 - Rp 15.000)
- Tambah kondimen/item ekstra:
  - Bakso urat: 1 pcs (Rp 2.000)
  - Bakso kecil: 1, 2, 4 pcs (Rp 2.000, 3.000, 5.000)
  - Tahu, Somay, Pangsit, Soun: 1, 2 pcs (Rp 2.000, 3.000)
- Kalkulasi total otomatis
- Support multiple quantity

### 🥤 Transaksi Minuman
- Teh Rosela (Rp 5.000)
- Es Teh Manis (Rp 3.000)
- Input quantity

### 📈 Laporan Lengkap
- **Laporan Harian**: Detail transaksi per hari
- **Laporan Bulanan**: Akumulasi & total bonus karyawan
- Export ke Excel (format professional)
- Filter per tanggal

### 💼 Manajemen Keuangan
- Biaya tetap harian:
  - Sewa: Rp 150.000
  - Gaji Karyawan: Rp 60.000
  - Gaji Owner: Rp 50.000
- Kalkulasi biaya produksi otomatis
- Tracking bonus karyawan bulanan

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **OpenPyXL** - Excel export

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Shadcn/UI** - Component library
- **Tailwind CSS** - Styling
- **date-fns** - Date formatting
- **Sonner** - Toast notifications

## 📋 Prerequisites

### Untuk Development
```bash
# Node.js & npm
node >= 16.x (Rekomendasi: 16 LTS untuk Pi 3B, 18+ untuk PC)
npm >= 8.x (atau yarn >= 1.22)

# Python
Python >= 3.8
pip >= 20.x

# MongoDB
MongoDB >= 4.x
```

### 📦 Node Version Support
- **Node 16 LTS**: ✅ Fully supported (optimized untuk Raspberry Pi 3B)
- **Node 18 LTS**: ✅ Recommended untuk development
- **Node 20**: ✅ Supported
- **Node 14**: ❌ Not supported (EOL)

📄 **Untuk migrate ke Node 16**, lihat: [MIGRATE_NODE16.md](MIGRATE_NODE16.md)

### Untuk Raspberry Pi
```bash
# Raspberry Pi OS (32-bit atau 64-bit)
# Minimal: Raspberry Pi 3 Model B+
# Rekomendasi: Raspberry Pi 4 (4GB RAM)
```

## 🚀 Instalasi

### Instalasi Standard (Linux/Mac/Windows)

Lihat file [INSTALL.md](INSTALL.md) untuk panduan lengkap.

### Instalasi Raspberry Pi

Lihat file [RASPBERRY_PI_INSTALL.md](RASPBERRY_PI_INSTALL.md) untuk panduan khusus Raspberry Pi.

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/yourusername/bakso-business.git
cd bakso-business

# 2. Setup Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env sesuai konfigurasi

# 3. Setup Frontend
cd ../frontend
yarn install
cp .env.example .env
# Edit .env sesuai konfigurasi

# 4. Jalankan MongoDB
mongod --dbpath ./data/db

# 5. Jalankan Backend (terminal baru)
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# 6. Jalankan Frontend (terminal baru)
cd frontend
yarn start
```

Akses aplikasi di: `http://localhost:3000`

## 📁 Struktur Project

```
bakso-business/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── App.css           # Styles
│   │   └── components/ui/    # Shadcn UI components
│   ├── package.json          # Node dependencies
│   └── .env                  # Environment variables
├── docs/
│   ├── API.md                # API Documentation
│   └── USER_GUIDE.md         # User Guide
├── INSTALL.md                # Installation guide
├── RASPBERRY_PI_INSTALL.md   # Raspberry Pi guide
└── README.md                 # This file
```

## 🔧 Konfigurasi

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=bakso_business
CORS_ORIGINS=*
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 📱 Usage

### Workflow Harian

1. **Pagi Hari**
   - Buka menu **Stok**
   - Input stok barang yang dibawa

2. **Siang Hari (Operasional)**
   - **Transaksi Paket**: Input penjualan paket + kondimen
   - **Transaksi Minuman**: Input penjualan minuman

3. **Sore Hari (Tutup)**
   - Buka menu **Stok**
   - Input stok sisa
   - Sistem otomatis hitung pendapatan & bonus

4. **Dashboard**
   - Lihat ringkasan harian
   - Check bonus karyawan

5. **Laporan**
   - Export Excel untuk dokumentasi
   - Lihat laporan bulanan

## 📊 API Endpoints

### Stok
- `POST /api/stock/initial` - Input stok awal
- `PUT /api/stock/remaining/{date}` - Input stok sisa
- `PUT /api/stock/initial/{date}` - Edit stok awal
- `GET /api/stock/{date}` - Get data stok
- `DELETE /api/stock/{date}` - Hapus data stok

### Transaksi
- `POST /api/transactions/package` - Transaksi paket
- `POST /api/transactions/beverage` - Transaksi minuman
- `GET /api/transactions/package/{date}` - Get transaksi paket
- `GET /api/transactions/beverage/{date}` - Get transaksi minuman

### Laporan
- `GET /api/daily-summary/{date}` - Ringkasan harian
- `GET /api/monthly-summary/{year}/{month}` - Ringkasan bulanan

### Export
- `GET /api/export/daily/{date}` - Export laporan harian (Excel)
- `GET /api/export/monthly/{year}/{month}` - Export laporan bulanan (Excel)
- `GET /api/export/stock/{date}` - Export data stok (Excel)

## 🎨 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Transaksi Paket
![Transaksi Paket](docs/screenshots/transaksi-paket.png)

### Manajemen Stok
![Stok](docs/screenshots/stok.png)

### Laporan
![Laporan](docs/screenshots/laporan.png)

## 🐛 Troubleshooting

### MongoDB tidak bisa connect
```bash
# Check status
sudo systemctl status mongodb

# Restart
sudo systemctl restart mongodb
```

### Port sudah digunakan
```bash
# Check port
lsof -i :8001
lsof -i :3000

# Kill process
kill -9 <PID>
```

### CORS Error
- Set `CORS_ORIGINS=*` di backend/.env
- Atau set specific: `CORS_ORIGINS=http://localhost:3000`

## 🔐 Security Notes

### Untuk Production:
1. Ganti `CORS_ORIGINS=*` dengan domain spesifik
2. Gunakan HTTPS
3. Set MongoDB authentication
4. Gunakan environment variables untuk sensitive data
5. Enable firewall

## 🚀 Deployment

### Docker (Recommended)
```bash
# Build & run
docker-compose up -d
```

### PM2 (Linux)
```bash
# Backend
cd backend
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8001" --name bakso-backend

# Frontend (after build)
cd frontend
yarn build
pm2 start "serve -s build -l 3000" --name bakso-frontend
```

### Raspberry Pi
Lihat [RASPBERRY_PI_INSTALL.md](RASPBERRY_PI_INSTALL.md)

## 📝 License

MIT License - lihat [LICENSE](LICENSE) file

## 👥 Author

Developed with ❤️ for small business owners

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

Jika ada pertanyaan atau masalah:
- Create an issue: [GitHub Issues](https://github.com/yourusername/bakso-business/issues)
- Email: your.email@example.com

## 🙏 Acknowledgments

- FastAPI community
- React community
- Shadcn/UI for beautiful components
- All contributors

---

**Built with FastAPI + React + MongoDB** | **Perfect for Raspberry Pi** | **Production Ready**

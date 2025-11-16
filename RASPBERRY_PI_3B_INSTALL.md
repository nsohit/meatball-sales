# 🍓 Instalasi Khusus Raspberry Pi 3 Model B/B+

Panduan instalasi sistem Bakso Business yang **dioptimasi untuk Raspberry Pi 3B/3B+** (RAM 1GB).

---

## ⚠️ Perbedaan Pi 3B vs Pi 4

| Spesifikasi | Pi 3B/3B+ | Pi 4 (4GB) |
|-------------|-----------|------------|
| **RAM** | 1GB | 4GB |
| **CPU** | Quad-core 1.4GHz | Quad-core 1.8GHz |
| **Architecture** | ARMv8 (64-bit) | ARMv8 (64-bit) |
| **USB** | USB 2.0 | USB 3.0 |
| **Ethernet** | 100 Mbps | Gigabit |

**Konsekuensi untuk Pi 3B:**
- ❗ RAM terbatas (1GB) - perlu optimasi agresif
- ❗ CPU lebih lambat - build frontend lebih lama
- ❗ I/O lebih lambat - database perlu tuning
- ✅ Masih bisa berjalan dengan baik jika dikonfigurasi dengan benar!

---

## 📋 Requirements Minimum

### Hardware
- **Raspberry Pi 3 Model B atau B+**
- **MicroSD Card**: 32GB Class 10 (Rekomendasi: 64GB untuk backup)
- **Power Supply**: 5V 2.5A Micro-USB (PENTING: jangan kurang dari 2.5A!)
- **Cooling**: Heatsink + fan (SANGAT DIREKOMENDASIKAN)
- **Display**: Monitor HDMI atau headless via SSH
- **Internet**: Ethernet (lebih stabil dari WiFi)

### Software
- Raspberry Pi OS Lite (32-bit) - **JANGAN pakai Desktop version**
- Minimal 10GB free space setelah install OS

---

## 🚀 Tahap 1: Install & Setup OS

### 1.1 Download Raspberry Pi OS Lite

```bash
# Download Raspberry Pi OS Lite (32-bit)
# URL: https://www.raspberrypi.com/software/operating-systems/

# Pilih: "Raspberry Pi OS Lite (32-bit)"
# JANGAN pilih Desktop version (terlalu berat untuk 1GB RAM)
```

### 1.2 Flash ke SD Card

```bash
# Menggunakan Raspberry Pi Imager:
# 1. Download: https://www.raspberrypi.com/software/
# 2. Choose OS: Raspberry Pi OS (other) → Raspberry Pi OS Lite (32-bit)
# 3. Choose Storage: Your SD Card
# 4. Settings (⚙️):
#    - Enable SSH
#    - Set username & password
#    - Configure WiFi (jika perlu)
#    - Set locale: Asia/Jakarta
# 5. Write!
```

### 1.3 First Boot

```bash
# Boot Pi dengan SD Card
# Login via SSH atau keyboard:

# Default credentials (jika tidak set di imager):
# Username: pi
# Password: raspberry

# WAJIB ganti password!
passwd

# Update system
sudo apt update
sudo apt upgrade -y

# Install essential tools
sudo apt install -y git curl wget vim htop
```

### 1.4 Konfigurasi Dasar

```bash
sudo raspi-config

# Wajib setting:
# 1. System Options → Hostname: "bakso-pos-3b"
# 2. Interface Options → SSH: Enable
# 3. Performance Options → GPU Memory: 16 (karena headless)
# 4. Localisation Options → Timezone: Asia/Jakarta
# 5. Localisation Options → Locale: id_ID.UTF-8
# 6. Advanced Options → Expand Filesystem

# Save & Reboot
sudo reboot
```

---

## 💾 Tahap 2: Optimasi Swap (PENTING!)

Pi 3B hanya punya 1GB RAM, kita perlu swap yang lebih besar.

```bash
# Stop swap
sudo dphys-swapfile swapoff

# Edit config
sudo nano /etc/dphys-swapfile

# Ubah baris ini:
# CONF_SWAPSIZE=100
# Menjadi:
CONF_SWAPSIZE=2048

# Save (Ctrl+O, Enter, Ctrl+X)

# Setup & activate swap baru
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# Verify
free -h
# Swap harus menunjukkan ~2GB
```

---

## 🗑️ Tahap 3: Disable Service yang Tidak Perlu

```bash
# Disable Bluetooth (jika tidak dipakai)
sudo systemctl disable bluetooth
sudo systemctl stop bluetooth

# Disable WiFi (jika pakai Ethernet)
sudo systemctl disable wpa_supplicant
sudo systemctl stop wpa_supplicant

# Disable printing service
sudo systemctl disable cups
sudo systemctl stop cups

# Disable audio
sudo systemctl disable alsa-state
sudo systemctl stop alsa-state
```

---

## 🐍 Tahap 4: Install Python 3

```bash
# Check Python version
python3 --version
# Harus minimal 3.7

# Install Python tools
sudo apt install -y python3-pip python3-venv python3-dev

# Install build dependencies (diperlukan untuk compile packages)
sudo apt install -y build-essential libssl-dev libffi-dev

# Upgrade pip
pip3 install --upgrade pip
```

---

## 🍃 Tahap 5: Install MongoDB (32-bit ARM)

### 5.1 Install MongoDB

```bash
# Untuk Pi 3B (32-bit), kita pakai mongodb dari repo Debian
sudo apt install -y mongodb

# Start & Enable
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Check status
sudo systemctl status mongodb
```

### 5.2 Optimasi MongoDB untuk 1GB RAM

**INI SANGAT PENTING!**

```bash
# Backup config
sudo cp /etc/mongodb.conf /etc/mongodb.conf.backup

# Edit config
sudo nano /etc/mongodb.conf

# Tambahkan/edit baris ini (TANPA # di depan):
storage.wiredTiger.engineConfig.cacheSizeGB=0.25

# Ubah juga (jika ada):
journal=false

# Save & Exit (Ctrl+O, Enter, Ctrl+X)

# Restart MongoDB
sudo systemctl restart mongodb

# Verify berjalan
sudo systemctl status mongodb
```

**Penjelasan:**
- `cacheSizeGB=0.25` = MongoDB hanya pakai 256MB RAM (bukan default 512MB)
- `journal=false` = Matikan journaling untuk performa (trade-off: kurang aman saat crash)

### 5.3 Test MongoDB

```bash
# Test connection
mongo --eval "db.version()"

# Should output: MongoDB shell version 2.4.x atau 3.x

# Check cache size
mongo --eval "db.serverStatus().wiredTiger.cache['maximum bytes configured']"
# Should be around: 268435456 (256MB)
```

---

## 📦 Tahap 6: Install Node.js & Yarn

### 6.1 Install Node.js (versi 16 LTS)

```bash
# Install Node.js 16 (versi 18 terlalu berat untuk Pi 3B)
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # v16.x.x
npm --version   # 8.x.x

# Set npm to use less memory
npm config set cache-min 3600
```

### 6.2 Install Yarn

```bash
sudo npm install -g yarn --prefer-offline

# Verify
yarn --version
```

---

## 📥 Tahap 7: Setup Project

### 7.1 Clone Repository

```bash
# Create project directory
mkdir -p ~/projects
cd ~/projects

# Clone project
git clone https://github.com/yourusername/bakso-business.git
cd bakso-business
```

### 7.2 Setup Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate
source venv/bin/activate

# Install dependencies
# PENTING: Install satu per satu untuk monitor memory
pip install fastapi
pip install uvicorn
pip install motor
pip install pymongo
pip install python-dotenv
pip install pydantic
pip install openpyxl

# Save to requirements
pip freeze > requirements.txt.installed

# Create .env
cat > .env << 'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=bakso_business
CORS_ORIGINS=*
EOF

# Deactivate venv for now
deactivate
```

### 7.3 Setup Frontend (Build OFFLINE)

**PENTING:** Build di Pi 3B memakan waktu 30-45 menit!

```bash
cd ../frontend

# Install dependencies (ini akan lama!)
# Estimasi: 20-30 menit
yarn install --network-timeout 100000

# Jika error "Out of memory", lakukan ini:
# 1. Close semua aplikasi lain
# 2. Pastikan swap aktif
# 3. Coba lagi dengan:
yarn install --network-timeout 100000 --frozen-lockfile

# Create .env
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
EOF

# Build production version (ini juga lama!)
# Estimasi: 15-20 menit
# PENTING: Monitor dengan htop di terminal lain
yarn build

# Jika build gagal karena memory, jalankan dengan limit:
NODE_OPTIONS="--max-old-space-size=768" yarn build
```

**Tips saat build:**
```bash
# Di terminal lain, monitor memory:
watch -n 2 free -h

# Jika hampir kehabisan memory:
# 1. Stop build (Ctrl+C)
# 2. Reboot Pi
# 3. Jangan jalankan aplikasi lain
# 4. Coba build lagi
```

---

## 🔧 Tahap 8: Setup PM2 Service

### 8.1 Install PM2

```bash
sudo npm install -g pm2 --prefer-offline

# Verify
pm2 --version
```

### 8.2 Create Ecosystem File (Optimized for Pi 3B)

```bash
cd ~/projects/bakso-business

# Create ecosystem config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'bakso-backend',
      cwd: './backend',
      script: 'venv/bin/uvicorn',
      args: 'server:app --host 0.0.0.0 --port 8001 --workers 1',
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '400M',
      env: {
        MONGO_URL: 'mongodb://localhost:27017',
        DB_NAME: 'bakso_business',
        CORS_ORIGINS: '*'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      time: true,
      autorestart: true,
      watch: false
    },
    {
      name: 'bakso-frontend',
      cwd: './frontend',
      script: 'npx',
      args: 'serve -s build -l 3000',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      time: true,
      autorestart: true,
      watch: false
    }
  ]
};
EOF

# Create logs directory
mkdir -p logs
```

**Perbedaan dari Pi 4:**
- `--workers 1` = Hanya 1 worker (Pi 4 bisa pakai 2-4)
- `max_memory_restart` lebih kecil
- `instances: 1` = Tidak pakai cluster mode

### 8.3 Start Services

```bash
# Start aplikasi
pm2 start ecosystem.config.js

# Check status
pm2 status

# Monitor resource usage
pm2 monit

# Save PM2 config
pm2 save

# Setup autostart
pm2 startup
# Copy dan jalankan command yang muncul
```

---

## 🌐 Tahap 9: Network & Access

### 9.1 Setup Static IP

```bash
# Edit dhcpcd
sudo nano /etc/dhcpcd.conf

# Tambahkan di akhir (sesuaikan dengan network Anda):
interface eth0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=8.8.8.8 8.8.4.4

# Save & restart
sudo systemctl restart dhcpcd

# Verify
ip addr show eth0
```

### 9.2 Setup Firewall

```bash
# Install UFW
sudo apt install -y ufw

# Allow SSH
sudo ufw allow 22/tcp

# Allow aplikasi dari local network
sudo ufw allow from 192.168.1.0/24 to any port 3000
sudo ufw allow from 192.168.1.0/24 to any port 8001

# Enable firewall
sudo ufw enable

# Check
sudo ufw status
```

### 9.3 Test Akses

```bash
# Get IP address
hostname -I

# Dari browser di komputer lain:
# http://192.168.1.100:3000
```

---

## 📊 Tahap 10: Monitoring & Optimization

### 10.1 Install Monitoring Tools

```bash
# Install htop untuk monitoring
sudo apt install -y htop

# Jalankan
htop

# Monitor:
# - CPU usage (jangan over 80% terus-menerus)
# - Memory (jangan sampai swap penuh)
# - Temperature (jangan over 70°C)
```

### 10.2 Temperature Monitoring

```bash
# Check temperature
vcgencmd measure_temp

# Monitor kontinyu
watch -n 2 vcgencmd measure_temp

# PENTING: Jika > 70°C, tambahkan cooling!
```

### 10.3 Cron Job untuk Maintenance

```bash
# Setup database backup
cat > ~/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups
DATE=$(date +"%Y%m%d_%H%M%S")

mkdir -p $BACKUP_DIR
mongodump --db bakso_business --out $BACKUP_DIR/backup_$DATE

# Keep only last 5 backups (karena space terbatas)
ls -t $BACKUP_DIR | tail -n +6 | xargs -I {} rm -rf $BACKUP_DIR/{}
EOF

chmod +x ~/backup-db.sh

# Setup cron (backup setiap hari jam 23:00)
crontab -e

# Tambahkan:
0 23 * * * /home/pi/backup-db.sh

# Cleanup logs setiap minggu
0 0 * * 0 find ~/projects/bakso-business/logs -name "*.log" -mtime +7 -delete

# Reboot otomatis setiap minggu (Sunday 3 AM) untuk refresh memory
0 3 * * 0 /sbin/shutdown -r now
```

---

## ⚡ Optimasi Performance

### 1. Overclock (Optional - HATI-HATI!)

```bash
sudo nano /boot/config.txt

# Tambahkan (dengan cooling yang baik):
arm_freq=1350
gpu_freq=400
over_voltage=2

# JANGAN overclock jika:
# - Tidak punya heatsink + fan
# - Power supply kurang dari 2.5A
# - Temperature sering > 70°C

# Reboot
sudo reboot

# Check frequency
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq
```

### 2. Reduce System Services

```bash
# Disable avahi-daemon (jika tidak perlu)
sudo systemctl disable avahi-daemon

# Disable triggerhappy
sudo systemctl disable triggerhappy

# Disable rsync
sudo systemctl disable rsync
```

### 3. Optimize MongoDB

```bash
# Edit /etc/mongodb.conf
sudo nano /etc/mongodb.conf

# Set ke 0 untuk disable journaling (faster, tapi less safe)
journal=false

# Limit connections
maxConns=20

# Restart
sudo systemctl restart mongodb
```

---

## 🐛 Troubleshooting Pi 3B

### Issue 1: Out of Memory saat Build

**Gejala:**
```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed
```

**Solusi:**
```bash
# Increase swap
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Set: CONF_SWAPSIZE=3072
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# Build dengan limit memory
NODE_OPTIONS="--max-old-space-size=768" yarn build

# Atau build di komputer lain, lalu copy folder build/
```

### Issue 2: MongoDB Crash

**Gejala:**
```
MongoDB server crashed: Out of memory
```

**Solusi:**
```bash
# Turunkan cache size
sudo nano /etc/mongodb.conf
# Set: storage.wiredTiger.engineConfig.cacheSizeGB=0.2

# Atau disable WiredTiger, pakai MMAPv1
# storageEngine=mmapv1
```

### Issue 3: System Lambat/Freeze

**Penyebab:**
- Swap thrashing (memory penuh, swap penuh)
- Overheating
- Terlalu banyak service

**Solusi:**
```bash
# 1. Check memory
free -h

# 2. Check swap usage
swapon -s

# 3. Check temperature
vcgencmd measure_temp

# 4. Restart services
pm2 restart all

# 5. Clean cache
sudo sync
sudo sh -c 'echo 3 > /proc/sys/vm/drop_caches'

# 6. Reboot jika perlu
sudo reboot
```

### Issue 4: Aplikasi Tidak Response

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs

# Restart aplikasi
pm2 restart all

# Jika masih error, restart MongoDB
sudo systemctl restart mongodb
pm2 restart all
```

---

## 📝 Performance Expectations (Pi 3B)

| Metric | Pi 3B | Pi 4 (4GB) |
|--------|-------|------------|
| **Boot time** | ~45 sec | ~30 sec |
| **Build time** | 30-45 min | 10-15 min |
| **Page load** | 2-3 sec | 1-2 sec |
| **API response** | 100-300ms | 50-150ms |
| **Excel export** | 3-5 sec | 1-2 sec |
| **Max concurrent users** | 3-5 | 10-15 |

**Catatan:** Pi 3B cukup untuk 1-2 kasir aktif bersamaan.

---

## ✅ Checklist Post-Installation

- [ ] Swap 2GB aktif (`free -h`)
- [ ] MongoDB berjalan (`sudo systemctl status mongodb`)
- [ ] MongoDB cache 0.25GB (`mongo --eval "db.serverStatus().wiredTiger.cache"`)
- [ ] PM2 running 2 apps (`pm2 status`)
- [ ] Frontend accessible (http://[IP]:3000)
- [ ] Backend API works (http://[IP]:8001/api/)
- [ ] Temperature < 70°C (`vcgencmd measure_temp`)
- [ ] Autostart configured (`pm2 startup`)
- [ ] Backup cron scheduled (`crontab -l`)
- [ ] Firewall enabled (`sudo ufw status`)
- [ ] Static IP configured (`ip addr`)

---

## 🎯 Tips Penggunaan Harian

### DO's:
- ✅ Monitor temperature secara rutin
- ✅ Reboot seminggu sekali (otomatis via cron)
- ✅ Backup database rutin
- ✅ Gunakan Ethernet (lebih stabil dari WiFi)
- ✅ Tutup tab browser lain saat menggunakan
- ✅ Gunakan power supply berkualitas (2.5A minimum)

### DON'Ts:
- ❌ Jangan jalankan aplikasi berat lainnya
- ❌ Jangan cabut power tanpa shutdown
- ❌ Jangan overclock tanpa cooling
- ❌ Jangan pakai Desktop environment
- ❌ Jangan buka 10+ transaksi sekaligus
- ❌ Jangan update system sembarangan

---

## 🆘 Emergency Procedures

### Jika Pi Freeze:

1. **Hard Reboot** (last resort):
   ```bash
   # Tahan power button 10 detik
   # Atau cabut-colok power
   ```

2. **Check setelah reboot**:
   ```bash
   sudo systemctl status mongodb
   pm2 status
   pm2 logs
   ```

### Jika Database Corrupt:

```bash
# Stop MongoDB
sudo systemctl stop mongodb

# Repair database
sudo -u mongodb mongod --repair --dbpath /var/lib/mongodb

# Restart
sudo systemctl start mongodb

# Restore dari backup jika perlu
mongorestore --db bakso_business ~/backups/backup_YYYYMMDD_HHMMSS/bakso_business/
```

---

## 🎉 Selesai!

Pi 3B Anda sekarang siap digunakan sebagai POS system!

**Performa realistis:**
- Cocok untuk 1-2 user bersamaan
- Response time acceptable (2-3 detik)
- Stabil untuk operasional harian
- Hemat daya (~5W)

**Pertimbangan upgrade ke Pi 4 jika:**
- Butuh lebih dari 2 kasir bersamaan
- Sering generate laporan besar
- Butuh response time lebih cepat
- Mau pakai touchscreen + GUI

---

**Need Help?** Create issue di GitHub atau hubungi support.

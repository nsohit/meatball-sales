# 🥧 Instalasi Sistem Bakso Business di Raspberry Pi

Panduan lengkap instalasi sistem manajemen bakso business di Raspberry Pi untuk digunakan sebagai POS (Point of Sale) system.

## 📋 Requirements

### Hardware
- **Raspberry Pi**: Model 3B+ atau lebih baru (Rekomendasi: Pi 4 dengan 4GB RAM)
- **MicroSD Card**: Minimal 16GB (Rekomendasi: 32GB Class 10)
- **Power Supply**: 5V 3A USB-C (untuk Pi 4) atau 5V 2.5A Micro-USB (untuk Pi 3)
- **Display**: Monitor dengan HDMI atau touchscreen (opsional untuk headless)
- **Keyboard & Mouse**: Untuk setup awal
- **Internet**: WiFi atau Ethernet untuk setup

### Software
- Raspberry Pi OS (32-bit atau 64-bit) - Buster atau Bullseye
- Ruang disk minimal: 8GB tersedia

## 🚀 Tahap 1: Persiapan Raspberry Pi

### 1.1 Install Raspberry Pi OS

**Menggunakan Raspberry Pi Imager (Recommended):**

```bash
# Download dari: https://www.raspberrypi.com/software/

# Pilih OS:
# - Raspberry Pi OS (32-bit) - untuk Pi 3
# - Raspberry Pi OS (64-bit) - untuk Pi 4 (4GB+)

# Flash ke SD Card
# Boot Raspberry Pi dan ikuti setup wizard
```

**Manual Setup:**
```bash
# Download Raspberry Pi OS
wget https://downloads.raspberrypi.org/raspios_arm64/images/raspios_arm64-2024-03-15/2024-03-15-raspios-bookworm-arm64.img.xz

# Flash ke SD Card (ganti /dev/sdX dengan device Anda)
sudo dd if=2024-03-15-raspios-bookworm-arm64.img of=/dev/sdX bs=4M status=progress
sync
```

### 1.2 First Boot & Update

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install essential tools
sudo apt install -y git curl wget vim

# Reboot
sudo reboot
```

### 1.3 Konfigurasi Raspberry Pi

```bash
# Buka raspi-config
sudo raspi-config

# Recommended settings:
# 1. System Options → Hostname → "bakso-pos"
# 2. Interface Options → SSH → Enable
# 3. Performance Options → GPU Memory → 128MB (jika pakai GUI)
# 4. Localisation Options → Timezone → Asia/Jakarta
# 5. Advanced Options → Expand Filesystem

# Reboot
sudo reboot
```

## 🐍 Tahap 2: Install Python & Dependencies

### 2.1 Install Python 3

```bash
# Check Python version (harus >= 3.8)
python3 --version

# Install Python development tools
sudo apt install -y python3-pip python3-venv python3-dev

# Upgrade pip
pip3 install --upgrade pip
```

### 2.2 Install Build Tools

```bash
# Required untuk compile beberapa Python packages
sudo apt install -y build-essential libssl-dev libffi-dev
```

## 📦 Tahap 3: Install MongoDB

### 3.1 Install MongoDB (untuk Raspberry Pi)

```bash
# MongoDB official tidak support ARM32, kita pakai community version

# Untuk Raspberry Pi OS 32-bit:
sudo apt install -y mongodb

# Untuk Raspberry Pi OS 64-bit:
# Download MongoDB Community untuk ARM64
wget https://repo.mongodb.org/apt/ubuntu/dists/focal/mongodb-org/5.0/multiverse/binary-arm64/mongodb-org-server_5.0.14_arm64.deb
sudo dpkg -i mongodb-org-server_5.0.14_arm64.deb
sudo apt install -f
```

### 3.2 Konfigurasi MongoDB

```bash
# Enable MongoDB service
sudo systemctl enable mongodb
sudo systemctl start mongodb

# Check status
sudo systemctl status mongodb

# Test connection
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
```

### 3.3 Optimasi MongoDB untuk Raspberry Pi

```bash
# Edit config
sudo nano /etc/mongodb.conf

# Tambahkan/edit:
# storage:
#   engine: wiredTiger
#   wiredTiger:
#     engineConfig:
#       cacheSizeGB: 0.5  # Sesuaikan RAM Pi Anda

# Restart
sudo systemctl restart mongodb
```

## 🟢 Tahap 4: Install Node.js & Yarn

### 4.1 Install Node.js

```bash
# Install Node.js LTS (menggunakan NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v18.x
npm --version   # Should be v9.x
```

### 4.2 Install Yarn

```bash
# Install Yarn globally
sudo npm install -g yarn

# Verify
yarn --version
```

## 📥 Tahap 5: Download & Setup Project

### 5.1 Clone Repository

```bash
# Buat direktori project
mkdir -p ~/projects
cd ~/projects

# Clone dari GitHub
git clone https://github.com/yourusername/bakso-business.git
cd bakso-business
```

### 5.2 Setup Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=bakso_business
CORS_ORIGINS=*
EOF

# Test backend
uvicorn server:app --host 0.0.0.0 --port 8001
# Ctrl+C untuk stop
```

### 5.3 Setup Frontend

```bash
cd ../frontend

# Install dependencies
yarn install

# Create .env file
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
EOF

# Build production version
yarn build
```

## 🔄 Tahap 6: Setup Service (Auto-start)

### 6.1 Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify
pm2 --version
```

### 6.2 Create PM2 Ecosystem File

```bash
cd ~/projects/bakso-business

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'bakso-backend',
      cwd: './backend',
      script: 'venv/bin/uvicorn',
      args: 'server:app --host 0.0.0.0 --port 8001',
      interpreter: 'none',
      env: {
        MONGO_URL: 'mongodb://localhost:27017',
        DB_NAME: 'bakso_business',
        CORS_ORIGINS: '*'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      time: true
    },
    {
      name: 'bakso-frontend',
      cwd: './frontend',
      script: 'npx',
      args: 'serve -s build -l 3000',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      time: true
    }
  ]
};
EOF

# Create logs directory
mkdir -p logs
```

### 6.3 Start Services dengan PM2

```bash
# Start aplikasi
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs

# Save PM2 configuration
pm2 save

# Setup PM2 startup (auto-start on boot)
pm2 startup
# Copy dan jalankan command yang muncul (sudo ...)
```

## 🌐 Tahap 7: Akses Aplikasi

### 7.1 Cek IP Address Raspberry Pi

```bash
# Get IP address
hostname -I
# Output: 192.168.1.100 (contoh)
```

### 7.2 Akses dari Browser

```
# Dari Raspberry Pi itu sendiri:
http://localhost:3000

# Dari komputer lain di jaringan yang sama:
http://192.168.1.100:3000
```

## 🖥️ Tahap 8: Setup Kiosk Mode (Optional)

Untuk menggunakan Raspberry Pi sebagai dedicated POS terminal:

### 8.1 Install Chromium Kiosk

```bash
# Install Chromium
sudo apt install -y chromium-browser unclutter

# Create autostart script
mkdir -p ~/.config/autostart

cat > ~/.config/autostart/bakso-kiosk.desktop << 'EOF'
[Desktop Entry]
Type=Application
Name=Bakso Business Kiosk
Exec=/home/pi/start-kiosk.sh
X-GNOME-Autostart-enabled=true
EOF

# Create kiosk startup script
cat > ~/start-kiosk.sh << 'EOF'
#!/bin/bash

# Wait for network
sleep 10

# Hide cursor
unclutter -idle 0 &

# Disable screen blanking
xset s off
xset -dpms
xset s noblank

# Start Chromium in kiosk mode
chromium-browser --kiosk \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-restore-session-state \
  --noerrdialogs \
  --disable-translate \
  http://localhost:3000
EOF

chmod +x ~/start-kiosk.sh
```

### 8.2 Disable Screen Saver

```bash
# Edit lightdm config
sudo nano /etc/lightdm/lightdm.conf

# Tambahkan di section [Seat:*]:
# xserver-command=X -s 0 -dpms

# Reboot untuk apply
sudo reboot
```

## 🔒 Tahap 9: Security & Network

### 9.1 Setup Firewall

```bash
# Install UFW
sudo apt install -y ufw

# Allow SSH
sudo ufw allow 22/tcp

# Allow aplikasi (hanya dari local network)
sudo ufw allow from 192.168.1.0/24 to any port 3000
sudo ufw allow from 192.168.1.0/24 to any port 8001

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 9.2 Setup Static IP (Recommended)

```bash
# Edit dhcpcd config
sudo nano /etc/dhcpcd.conf

# Tambahkan di akhir file:
# interface wlan0  # atau eth0 untuk ethernet
# static ip_address=192.168.1.100/24
# static routers=192.168.1.1
# static domain_name_servers=8.8.8.8 8.8.4.4

# Restart networking
sudo systemctl restart dhcpcd
```

## 📊 Tahap 10: Monitoring & Maintenance

### 10.1 Check System Resources

```bash
# CPU & Memory
htop

# Disk usage
df -h

# Temperature
vcgencmd measure_temp
```

### 10.2 PM2 Monitoring

```bash
# Status aplikasi
pm2 status

# Resource usage
pm2 monit

# View logs
pm2 logs bakso-backend
pm2 logs bakso-frontend

# Restart aplikasi
pm2 restart all
```

### 10.3 Database Backup

```bash
# Create backup script
cat > ~/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups
DATE=$(date +"%Y%m%d_%H%M%S")

mkdir -p $BACKUP_DIR
mongodump --db bakso_business --out $BACKUP_DIR/backup_$DATE

# Keep only last 7 backups
ls -t $BACKUP_DIR | tail -n +8 | xargs -I {} rm -rf $BACKUP_DIR/{}
EOF

chmod +x ~/backup-db.sh

# Setup cron job (backup setiap hari jam 23:00)
crontab -e
# Tambahkan:
# 0 23 * * * /home/pi/backup-db.sh
```

## 🔧 Troubleshooting

### Issue: MongoDB gagal start
```bash
# Check logs
sudo journalctl -u mongodb -n 50

# Check disk space
df -h

# Repair MongoDB
sudo systemctl stop mongodb
sudo -u mongodb mongod --repair --dbpath /var/lib/mongodb
sudo systemctl start mongodb
```

### Issue: Backend tidak bisa akses MongoDB
```bash
# Check MongoDB status
sudo systemctl status mongodb

# Test connection
mongo --eval 'db.stats()'

# Check MONGO_URL di .env
cat backend/.env
```

### Issue: Frontend tidak load
```bash
# Check PM2 logs
pm2 logs bakso-frontend

# Rebuild frontend
cd frontend
yarn build
pm2 restart bakso-frontend
```

### Issue: Aplikasi lambat
```bash
# Check temperature (throttling jika > 80°C)
vcgencmd measure_temp

# Add heatsink atau improve cooling
# Overclock (dengan risiko)
sudo raspi-config
# Performance Options → Overclock
```

## 🎯 Optimasi Performance

### 1. Reduce Memory Usage
```bash
# Disable GUI jika tidak perlu
sudo raspi-config
# System Options → Boot → Console

# Reduce GPU memory
sudo raspi-config
# Performance Options → GPU Memory → 16
```

### 2. Use Lightweight Desktop (Optional)
```bash
# Install LXDE (lebih ringan dari default)
sudo apt install -y lxde-core
```

### 3. Swap File
```bash
# Increase swap (untuk Pi dengan RAM kecil)
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Set: CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

## 📱 Akses Remote

### Via SSH
```bash
# Dari komputer lain:
ssh pi@192.168.1.100
```

### Via VNC (untuk GUI)
```bash
# Enable VNC
sudo raspi-config
# Interface Options → VNC → Enable

# Akses dari VNC Viewer
# Download: https://www.realvnc.com/download/viewer/
# Connect to: 192.168.1.100:5900
```

## 🚀 Update Aplikasi

```bash
cd ~/projects/bakso-business

# Pull latest changes
git pull

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
deactivate

# Update frontend
cd ../frontend
yarn install
yarn build

# Restart services
pm2 restart all
```

## 📋 Checklist Post-Installation

- [ ] MongoDB berjalan dan bisa diakses
- [ ] Backend API response di http://localhost:8001/api/
- [ ] Frontend load di http://localhost:3000
- [ ] PM2 services auto-start setelah reboot
- [ ] Firewall configured
- [ ] Static IP configured (jika diperlukan)
- [ ] Database backup scheduled
- [ ] Kiosk mode configured (jika diperlukan)
- [ ] Test semua fitur: Stok, Transaksi, Laporan
- [ ] Export Excel berfungsi

## 🎉 Selesai!

Aplikasi Bakso Business sudah siap digunakan di Raspberry Pi sebagai POS system!

**Akses:**
- Frontend: http://[IP-RASPBERRY-PI]:3000
- Backend API: http://[IP-RASPBERRY-PI]:8001/api/
- API Docs: http://[IP-RASPBERRY-PI]:8001/docs

**Tips:**
- Gunakan touchscreen untuk kemudahan
- Setup backup rutin
- Monitor temperature Raspberry Pi
- Update system secara berkala

---

**Need Help?** Create an issue on GitHub atau contact support.

# 📝 Node 16 Quick Reference Cheatsheet

Quick commands untuk setup dan troubleshooting Node 16.

---

## 🚀 Quick Setup (Automated)

```bash
cd frontend
bash setup-node16.sh
```

**Selesai!** Script akan otomatis:
- Backup files
- Copy config Node 16
- Clean dependencies
- Install packages
- Ready to build!

---

## 📦 Manual Setup (Step-by-step)

### 1. Switch ke Node 16
```bash
# Dengan NVM
nvm install 16
nvm use 16
node --version  # Check: v16.x.x

# Atau install direct (Raspberry Pi)
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Setup Package Files
```bash
cd frontend
cp package.node16.json package.json
cp .npmrc.node16 .npmrc
cp .yarnrc.node16 .yarnrc  # jika pakai yarn
```

### 3. Clean Install
```bash
rm -rf node_modules package-lock.json yarn.lock
npm install --legacy-peer-deps
```

### 4. Build
```bash
# Normal (PC/Pi 4)
npm run build

# Pi 3B (limited memory)
NODE_OPTIONS="--max-old-space-size=768" npm run build

# Pi 3B (very limited)
NODE_OPTIONS="--max-old-space-size=512" npm run build
```

---

## 🐛 Quick Fixes

### Fix: postcss-load-config error
```bash
rm -rf node_modules package-lock.json
cp .npmrc.node16 .npmrc
npm install --legacy-peer-deps
```

### Fix: Out of Memory
```bash
# Increase swap first
sudo dphys-swapfile swapoff
sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# Build with limit
NODE_OPTIONS="--max-old-space-size=512" npm run build
```

### Fix: Engine incompatible
```bash
# Copy config
cp .npmrc.node16 .npmrc

# Install with ignore
npm install --legacy-peer-deps --ignore-scripts
```

### Fix: Peer dependency conflict
```bash
npm install --legacy-peer-deps --force
```

---

## 🔍 Version Check Commands

```bash
# Check versions
node --version        # Should: v16.x.x
npm --version         # Should: 8.x.x
yarn --version        # Should: 1.22.x

# Check packages
npm list react        # Should: 18.2.0
npm list postcss      # Should: 8.4.24
npm list tailwindcss  # Should: 3.3.2

# Check config
cat package.json | grep '"node"'
cat .npmrc
```

---

## 🎯 Build Commands

| Scenario | Command |
|----------|---------|
| **Development** | `npm start` |
| **Production (PC)** | `npm run build` |
| **Pi 4 (4GB)** | `NODE_OPTIONS="--max-old-space-size=1024" npm run build` |
| **Pi 4 (2GB)** | `NODE_OPTIONS="--max-old-space-size=768" npm run build` |
| **Pi 3B (1GB)** | `NODE_OPTIONS="--max-old-space-size=512" npm run build` |

---

## 📊 Memory Monitoring

```bash
# During build, open new terminal and run:

# Option 1: free
watch -n 1 free -h

# Option 2: htop
htop

# Check temperature (Pi only)
watch -n 2 vcgencmd measure_temp
```

---

## 🔄 Rollback to Node 18

```bash
# Restore backup
cp package.json.backup package.json
rm .npmrc .yarnrc

# Switch Node
nvm use 18  # or install Node 18

# Reinstall
rm -rf node_modules
npm install
```

---

## 📋 Package Versions (Node 16)

| Package | Version | Note |
|---------|---------|------|
| **react** | 18.2.0 | ✅ Stable |
| **react-router-dom** | 6.18.0 | ✅ LTS |
| **postcss** | 8.4.24 | ✅ Compatible |
| **tailwindcss** | 3.3.2 | ✅ Compatible |
| **autoprefixer** | 10.4.14 | ✅ Compatible |
| **postcss-load-config** | 4.0.1 | ✅ Forced |

---

## 🆘 Emergency Commands

### Build stuck/frozen
```bash
# Kill process
Ctrl + C

# Reboot Pi
sudo reboot

# Try again with lower memory
NODE_OPTIONS="--max-old-space-size=384" npm run build
```

### Disk space full
```bash
# Check space
df -h

# Clean npm cache
npm cache clean --force

# Clean old builds
rm -rf build/
```

### Corrupted node_modules
```bash
# Nuclear option
rm -rf node_modules package-lock.json yarn.lock ~/.npm
npm cache clean --force
npm install --legacy-peer-deps
```

---

## 📞 Get Help

**Error persists?** Create issue dengan info:
```bash
# Copy paste output dari:
node --version
npm --version
uname -a
free -h
npm install --legacy-peer-deps 2>&1 | tee error.log
```

---

## ✅ Verification Checklist

Quick check setelah setup:

```bash
# Must pass all:
[ ] node --version → v16.x.x
[ ] npm list react → 18.2.0
[ ] npm list postcss → 8.4.24
[ ] cat .npmrc → legacy-peer-deps=true
[ ] npm run build → SUCCESS
[ ] ls build/ → files exist
[ ] npm start → localhost:3000 works
```

---

## 🎓 Pro Tips

### 1. Speed up install
```bash
# Parallel install
npm install --legacy-peer-deps --maxsockets=5

# With cache
npm install --legacy-peer-deps --prefer-offline
```

### 2. Reduce build time
```bash
# Disable source maps (production only!)
GENERATE_SOURCEMAP=false npm run build
```

### 3. Monitor resources
```bash
# One-liner monitoring
watch -n 1 'free -h; echo ""; vcgencmd measure_temp'
```

### 4. Auto cleanup after build
```bash
# Add to package.json scripts:
"postbuild": "npm cache clean --force"
```

---

## 📖 Related Docs

- Full guide: [MIGRATE_NODE16.md](MIGRATE_NODE16.md)
- Pi 3B specific: [RASPBERRY_PI_3B_INSTALL.md](RASPBERRY_PI_3B_INSTALL.md)
- Main README: [README.md](README.md)

---

**Keep this cheatsheet handy!** 📌

Simpan di browser bookmark atau print untuk referensi cepat saat setup di Raspberry Pi.

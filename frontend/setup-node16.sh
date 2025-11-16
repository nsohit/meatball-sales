#!/bin/bash
# Setup script untuk Node 16 compatibility
# Usage: bash setup-node16.sh

set -e

echo "=========================================="
echo "Setup Frontend untuk Node 16"
echo "=========================================="

# Check Node version
NODE_VERSION=$(node --version)
echo "Current Node version: $NODE_VERSION"

if [[ ! $NODE_VERSION == v16.* ]]; then
    echo "⚠️  WARNING: Node 16.x direkomendasikan!"
    echo "Current version: $NODE_VERSION"
    echo ""
    read -p "Lanjutkan? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "Step 1: Backup existing files..."
if [ -f "package.json" ]; then
    cp package.json package.json.backup
    echo "✓ package.json backed up to package.json.backup"
fi

echo ""
echo "Step 2: Copy Node 16 configuration..."
cp package.node16.json package.json
echo "✓ package.json updated for Node 16"

cp .npmrc.node16 .npmrc
echo "✓ .npmrc configured for Node 16"

if command -v yarn &> /dev/null; then
    cp .yarnrc.node16 .yarnrc
    echo "✓ .yarnrc configured for Node 16"
fi

echo ""
echo "Step 3: Clean old dependencies..."
rm -rf node_modules
echo "✓ node_modules removed"

rm -f package-lock.json yarn.lock
echo "✓ Lock files removed"

echo ""
echo "Step 4: Install dependencies..."
echo "This will take 5-10 minutes on Raspberry Pi 3B..."
echo ""

# Detect package manager
if command -v yarn &> /dev/null; then
    echo "Using Yarn..."
    yarn install --ignore-engines
else
    echo "Using npm..."
    npm install --legacy-peer-deps
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Setup completed successfully!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Test development server:"
    echo "   npm start"
    echo ""
    echo "2. Build for production:"
    echo "   NODE_OPTIONS='--max-old-space-size=768' npm run build"
    echo ""
    echo "3. For Raspberry Pi 3B, use:"
    echo "   NODE_OPTIONS='--max-old-space-size=512' npm run build"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "❌ Installation failed!"
    echo "=========================================="
    echo ""
    echo "Troubleshooting:"
    echo "1. Check Node version: node --version (should be 16.x)"
    echo "2. Try manual install:"
    echo "   npm install --legacy-peer-deps"
    echo "3. Check error logs above"
    echo ""
    exit 1
fi

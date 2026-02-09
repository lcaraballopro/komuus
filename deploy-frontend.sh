#!/bin/bash
# =============================================================================
# Komu Frontend Deploy Script
# =============================================================================
# Builds the frontend and outputs directly to /opt/whaticket/frontend/build/
# Caddy serves this directory automatically via bind mount.
#
# Usage:  ./deploy-frontend.sh
# =============================================================================

set -e

FRONTEND_DIR="/opt/whaticket/frontend"
BUILD_DIR="${FRONTEND_DIR}/build"

echo "🔨 Building frontend..."
cd "$FRONTEND_DIR"
npm run build

echo ""
echo "✅ Frontend deployed successfully!"
echo "   Build output: ${BUILD_DIR}"
echo "   Served by Caddy at: https://app.komu.us"
echo ""
echo "💡 Tip: Users may need to hard-refresh (Ctrl+Shift+R) to see changes."

#!/bin/bash
# Persian Connect Backup Script
# Usage: ./backup-script.sh

set -e

# Configuration
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="persian-connect-$TIMESTAMP"

echo "🔄 Starting Persian Connect backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# 1. Git backup with tag
echo "📝 Creating Git backup..."
git add .
git commit -m "🔒 Automated backup - $TIMESTAMP" || echo "No changes to commit"
git tag -a "backup-$TIMESTAMP" -m "Automated backup - $TIMESTAMP"
git push origin main
git push origin "backup-$TIMESTAMP"

# 2. Create project archive
echo "📁 Creating project archive..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=build \
  --exclude=backups \
  .

# 3. Create environment template
echo "🔐 Creating environment template..."
cat > "$BACKUP_DIR/$BACKUP_NAME-env-template.txt" << EOF
# Environment Variables Template - $TIMESTAMP
# Replace with actual values for restore

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_key

# Domain Configuration
DOMAIN=persian-connect.com
EOF

# 4. Create file structure snapshot
echo "📋 Creating file structure snapshot..."
tree -I 'node_modules|.git|dist|build' > "$BACKUP_DIR/$BACKUP_NAME-structure.txt" 2>/dev/null || ls -la > "$BACKUP_DIR/$BACKUP_NAME-structure.txt"

# 5. Create package info
echo "📦 Saving package information..."
cp package.json "$BACKUP_DIR/$BACKUP_NAME-package.json"
cp package-lock.json "$BACKUP_DIR/$BACKUP_NAME-package-lock.json" 2>/dev/null || true

# 6. Create restore instructions
cat > "$BACKUP_DIR/$BACKUP_NAME-RESTORE.md" << EOF
# Persian Connect Restore Instructions
**Backup Created:** $TIMESTAMP

## Quick Restore Steps:

1. **Extract Archive:**
   \`\`\`bash
   tar -xzf $BACKUP_NAME.tar.gz
   cd persian-connect
   \`\`\`

2. **Install Dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Restore Environment:**
   - Copy environment variables from $BACKUP_NAME-env-template.txt
   - Set up Supabase secrets in deployment platform

4. **Deploy:**
   - Push to your Git repository
   - Deploy through your platform (Netlify/Vercel)

## Git Tag for This Backup:
\`backup-$TIMESTAMP\`

## File Structure:
See $BACKUP_NAME-structure.txt
EOF

echo "✅ Backup completed successfully!"
echo "📁 Backup files created in: $BACKUP_DIR/"
echo "🏷️  Git tag created: backup-$TIMESTAMP"
echo ""
echo "📋 Backup includes:"
echo "   - Source code archive: $BACKUP_NAME.tar.gz"
echo "   - Environment template: $BACKUP_NAME-env-template.txt"
echo "   - File structure: $BACKUP_NAME-structure.txt"
echo "   - Restore instructions: $BACKUP_NAME-RESTORE.md"
echo ""
echo "🔒 Store the environment variables separately in a secure location!"
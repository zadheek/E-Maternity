#!/usr/bin/env node
/**
 * Generate secure secrets for production deployment
 * Run with: node scripts/generate-secrets.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('\n🔐 Generating Secure Secrets for E-Maternity System\n');
console.log('=' .repeat(60));

// Generate secrets
const nextAuthSecret = crypto.randomBytes(32).toString('base64');
const jwtSecret = crypto.randomBytes(32).toString('base64');
const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log('\n✅ Generated Secrets:\n');
console.log('NEXTAUTH_SECRET:', nextAuthSecret);
console.log('JWT_SECRET:', jwtSecret);
console.log('ENCRYPTION_KEY:', encryptionKey);

console.log('\n' + '='.repeat(60));
console.log('\n📋 Instructions:\n');
console.log('1. Copy the secrets above');
console.log('2. Update your .env file with these values');
console.log('3. NEVER commit .env to version control');
console.log('4. Store these secrets securely (password manager, secrets vault)');
console.log('5. Restart your application after updating .env');

console.log('\n⚠️  Security Reminders:\n');
console.log('- Each environment (dev, staging, prod) should have DIFFERENT secrets');
console.log('- Rotate secrets regularly (every 90 days recommended)');
console.log('- Use environment variables or secrets manager in production');
console.log('- Never share secrets via email or chat');
console.log('- Keep a secure backup of production secrets');

console.log('\n' + '='.repeat(60));

// Optionally create .env.example with instructions
const envExample = `
# E-Maternity Environment Variables
# Copy this file to .env and replace all placeholder values

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/e_maternity?schema=public

# Authentication Secrets (REQUIRED - Generate using: node scripts/generate-secrets.js)
# NEVER use default values in production!
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=REPLACE_WITH_GENERATED_SECRET_32_CHARS
JWT_SECRET=REPLACE_WITH_GENERATED_SECRET_32_CHARS

# Encryption (REQUIRED - Generate using: node scripts/generate-secrets.js)
ENCRYPTION_KEY=REPLACE_WITH_GENERATED_HEX_64_CHARS

# Email (Resend or EmailJS)
EMAIL_FROM=noreply@e-maternity.lk
RESEND_API_KEY=your_resend_api_key_here

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# Maps (Google Maps API)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Rate Limiting (Optional - defaults are in code)
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_AUTH_INTERVAL=900000
RATE_LIMIT_API_MAX=60
RATE_LIMIT_API_INTERVAL=60000
`;

const examplePath = path.join(process.cwd(), '.env.example');
fs.writeFileSync(examplePath, envExample.trim());

console.log(`\n✅ Created .env.example file at: ${examplePath}`);
console.log('\n🎉 Done! Remember to update your .env file with the generated secrets.\n');

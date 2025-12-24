#!/usr/bin/env node

/**
 * Production Environment Validator
 * Checks all required environment variables and configurations
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found!', 'red');
    log('   Run: cp .env.example .env', 'yellow');
    return false;
  }
  log('✓ .env file exists', 'green');
  return true;
}

function validateEnvVar(name, value, checks = {}) {
  if (!value || value.trim() === '') {
    log(`❌ ${name} is not set`, 'red');
    return false;
  }

  // Check if still using example/default value
  if (checks.notDefault) {
    const defaultValues = [
      'change-this',
      'your-secret',
      'example',
      'localhost',
      'postgres:postgres',
    ];
    if (defaultValues.some(def => value.includes(def))) {
      log(`⚠️  ${name} appears to be using a default/example value`, 'yellow');
      return false;
    }
  }

  // Check minimum length
  if (checks.minLength && value.length < checks.minLength) {
    log(`❌ ${name} must be at least ${checks.minLength} characters`, 'red');
    return false;
  }

  // Check format
  if (checks.format && !checks.format.test(value)) {
    log(`❌ ${name} format is invalid`, 'red');
    return false;
  }

  log(`✓ ${name} is configured`, 'green');
  return true;
}

function validateDatabase() {
  log('\n🗄️  Database Configuration:', 'cyan');
  
  const dbUrl = process.env.DATABASE_URL;
  const isValid = validateEnvVar('DATABASE_URL', dbUrl, {
    format: /^postgresql:\/\/.+:.+@.+:\d+\/.+/,
  });

  if (isValid && process.env.NODE_ENV === 'production') {
    if (dbUrl.includes('localhost') || dbUrl.includes('postgres:postgres')) {
      log('⚠️  Using localhost database in production!', 'yellow');
      return false;
    }
  }

  return isValid;
}

function validateAuthentication() {
  log('\n🔐 Authentication Configuration:', 'cyan');
  
  let isValid = true;
  
  isValid &= validateEnvVar('NEXTAUTH_URL', process.env.NEXTAUTH_URL, {
    format: /^https?:\/\/.+/,
  });
  
  isValid &= validateEnvVar('NEXTAUTH_SECRET', process.env.NEXTAUTH_SECRET, {
    minLength: 32,
    notDefault: true,
  });
  
  isValid &= validateEnvVar('JWT_SECRET', process.env.JWT_SECRET, {
    minLength: 32,
    notDefault: true,
  });

  if (process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL?.startsWith('http://')) {
    log('⚠️  NEXTAUTH_URL should use HTTPS in production!', 'yellow');
    isValid = false;
  }

  return isValid;
}

function validateExternalServices() {
  log('\n📡 External Services Configuration:', 'cyan');
  
  let warnings = [];
  
  // Twilio (SMS)
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    warnings.push('Twilio not configured - SMS notifications will not work');
  } else {
    log('✓ Twilio configured', 'green');
  }
  
  // Resend (Email)
  if (!process.env.RESEND_API_KEY) {
    warnings.push('Resend not configured - Email notifications will not work');
  } else {
    log('✓ Resend configured', 'green');
  }
  
  // Google Maps
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    warnings.push('Google Maps API not configured - Hospital locator will not work');
  } else {
    log('✓ Google Maps configured', 'green');
  }

  if (warnings.length > 0) {
    log('\n⚠️  Warnings:', 'yellow');
    warnings.forEach(w => log(`   - ${w}`, 'yellow'));
  }

  return warnings.length === 0;
}

function validateNodeEnv() {
  log('\n⚙️  Environment Configuration:', 'cyan');
  
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') {
    log('✓ NODE_ENV=production', 'green');
    return true;
  } else {
    log(`⚠️  NODE_ENV=${nodeEnv || 'not set'} (should be 'production' for deployment)`, 'yellow');
    return false;
  }
}

function checkPrismaClient() {
  log('\n🔍 Prisma Configuration:', 'cyan');
  
  const prismaPath = path.join(__dirname, '../node_modules/.prisma/client');
  if (fs.existsSync(prismaPath)) {
    log('✓ Prisma Client generated', 'green');
    return true;
  } else {
    log('❌ Prisma Client not generated', 'red');
    log('   Run: npm run prisma:generate', 'yellow');
    return false;
  }
}

function validateSecurity() {
  log('\n🛡️  Security Checks:', 'cyan');
  
  let isValid = true;
  
  // Check for exposed secrets in code
  const sensitiveFiles = ['.env', '.env.local', '.env.production'];
  const gitignorePath = path.join(__dirname, '../.gitignore');
  
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    const allExcluded = sensitiveFiles.every(file => gitignore.includes(file));
    
    if (allExcluded) {
      log('✓ Sensitive files in .gitignore', 'green');
    } else {
      log('❌ Not all sensitive files are in .gitignore', 'red');
      isValid = false;
    }
  }

  return isValid;
}

function main() {
  log('\n╔════════════════════════════════════════════════╗', 'cyan');
  log('║  E-Maternity Production Environment Validator  ║', 'cyan');
  log('╚════════════════════════════════════════════════╝', 'cyan');

  // Load environment variables
  require('dotenv').config();

  const checks = {
    envFile: checkEnvFile(),
    database: validateDatabase(),
    authentication: validateAuthentication(),
    services: validateExternalServices(),
    nodeEnv: validateNodeEnv(),
    prisma: checkPrismaClient(),
    security: validateSecurity(),
  };

  log('\n' + '='.repeat(50), 'cyan');
  log('📊 Validation Summary:', 'cyan');
  log('='.repeat(50), 'cyan');

  const results = Object.entries(checks);
  const passed = results.filter(([, v]) => v === true).length;
  const total = results.length;

  results.forEach(([name, status]) => {
    const icon = status ? '✓' : '✗';
    const color = status ? 'green' : 'red';
    const label = name.charAt(0).toUpperCase() + name.slice(1);
    log(`${icon} ${label}`, color);
  });

  log('\n' + '='.repeat(50), 'cyan');
  log(`Results: ${passed}/${total} checks passed`, passed === total ? 'green' : 'yellow');
  log('='.repeat(50) + '\n', 'cyan');

  if (passed === total) {
    log('✅ All validation checks passed! Ready for production deployment.', 'green');
    process.exit(0);
  } else {
    log('❌ Some validation checks failed. Please fix the issues above.', 'red');
    process.exit(1);
  }
}

// Run validation
main();

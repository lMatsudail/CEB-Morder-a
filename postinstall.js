#!/usr/bin/env node

/**
 * Post-install script
 * Se ejecuta automáticamente después de npm install
 * Compila React build si no existe
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const buildPath = path.join(__dirname, 'build');

if (!fs.existsSync(buildPath)) {
  console.log('📦 Post-install: Compilando React build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Post-install: React build compilado');
  } catch (err) {
    console.error('⚠️  Post-install: Error compilando build (continuando sin él)');
  }
} else {
  console.log('✅ Post-install: Build ya existe, saltando compilación');
}

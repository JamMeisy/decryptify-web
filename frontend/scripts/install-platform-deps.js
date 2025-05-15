// This script ensures the right platform-specific binaries are installed
const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('Running platform-specific dependency installer...');
console.log(`Detected platform: ${process.platform}-${os.arch()}`);

// Detect if we're running in a Vercel build environment
const isVercel = process.env.VERCEL === '1';

try {
  // Check if we need to clean up existing installations
  const nodeModulesDir = path.join(__dirname, '..', 'node_modules');

  // Only actively manage the platform-specific dependencies in Vercel
  if (isVercel) {
    console.log('Detected Vercel build environment');
    
    // Install the right platform-specific packages for Linux
    console.log('Installing Linux-specific binaries...');
    
    // For lightningcss
    try {
      // If we're on Vercel, force install the Linux binaries
      execSync('npm install lightningcss-linux-x64-gnu@4.1.6', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      console.log('Successfully installed lightningcss for Linux');
    } catch (error) {
      console.error('Error installing lightningcss:', error);
    }
  } else {
    console.log('Not in Vercel environment, using platform-specific packages from package.json');
  }
} catch (error) {
  console.error('Error in platform dependency installation:', error);
}

console.log('Platform-specific dependency installer completed');

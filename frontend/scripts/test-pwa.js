const fs = require('fs');
const path = require('path');

console.log('🔍 Testing PWA Implementation...\n');

// Test 1: Check if manifest.json exists and is valid
function testManifest() {
  console.log('1. Testing Web App Manifest...');
  
  const manifestPath = path.join(__dirname, '../public/manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    console.log('❌ manifest.json not found');
    return false;
  }
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    if (!manifest.icons || manifest.icons.length === 0) {
      console.log('❌ No icons defined in manifest');
      return false;
    }
    
    console.log('✅ Manifest is valid');
    console.log(`   - Name: ${manifest.name}`);
    console.log(`   - Icons: ${manifest.icons.length} defined`);
    console.log(`   - Display: ${manifest.display}`);
    return true;
  } catch (error) {
    console.log(`❌ Invalid JSON in manifest: ${error.message}`);
    return false;
  }
}

// Test 2: Check if service worker exists
function testServiceWorker() {
  console.log('\n2. Testing Service Worker...');
  
  const swPath = path.join(__dirname, '../public/sw.js');
  
  if (!fs.existsSync(swPath)) {
    console.log('❌ sw.js not found');
    return false;
  }
  
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  const requiredFeatures = [
    'addEventListener',
    'install',
    'activate',
    'fetch',
    'caches'
  ];
  
  const missingFeatures = requiredFeatures.filter(feature => !swContent.includes(feature));
  
  if (missingFeatures.length > 0) {
    console.log(`❌ Missing service worker features: ${missingFeatures.join(', ')}`);
    return false;
  }
  
  console.log('✅ Service worker is present and contains required features');
  console.log(`   - File size: ${(swContent.length / 1024).toFixed(2)} KB`);
  return true;
}

// Test 3: Check if PWA icons exist
function testIcons() {
  console.log('\n3. Testing PWA Icons...');
  
  const iconsDir = path.join(__dirname, '../public/icons');
  
  if (!fs.existsSync(iconsDir)) {
    console.log('❌ Icons directory not found');
    return false;
  }
  
  const requiredSizes = ['72x72', '96x96', '128x128', '144x144', '152x152', '192x192', '384x384', '512x512'];
  const missingIcons = [];
  
  requiredSizes.forEach(size => {
    const iconPath = path.join(iconsDir, `icon-${size}.svg`); // We're using SVG placeholders
    if (!fs.existsSync(iconPath)) {
      missingIcons.push(size);
    }
  });
  
  if (missingIcons.length > 0) {
    console.log(`❌ Missing icon sizes: ${missingIcons.join(', ')}`);
    return false;
  }
  
  console.log('✅ All required icon sizes are present');
  console.log(`   - Icons directory: ${iconsDir}`);
  return true;
}

// Test 4: Check PWA components
function testComponents() {
  console.log('\n4. Testing PWA Components...');
  
  const componentsDir = path.join(__dirname, '../src/components');
  const requiredComponents = [
    'PWAInstallPrompt.tsx',
    'PWAUpdatePrompt.tsx',
    'OfflineIndicator.tsx'
  ];
  
  const missingComponents = requiredComponents.filter(component => {
    return !fs.existsSync(path.join(componentsDir, component));
  });
  
  if (missingComponents.length > 0) {
    console.log(`❌ Missing components: ${missingComponents.join(', ')}`);
    return false;
  }
  
  // Check if usePWA hook exists
  const hookPath = path.join(__dirname, '../src/hooks/usePWA.ts');
  if (!fs.existsSync(hookPath)) {
    console.log('❌ usePWA hook not found');
    return false;
  }
  
  console.log('✅ All PWA components are present');
  return true;
}

// Test 5: Check Next.js configuration
function testNextConfig() {
  console.log('\n5. Testing Next.js Configuration...');
  
  const configPath = path.join(__dirname, '../next.config.js');
  
  if (!fs.existsSync(configPath)) {
    console.log('❌ next.config.js not found');
    return false;
  }
  
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  if (!configContent.includes('headers')) {
    console.log('❌ PWA headers not configured');
    return false;
  }
  
  console.log('✅ Next.js configuration includes PWA settings');
  return true;
}

// Test 6: Check layout integration
function testLayoutIntegration() {
  console.log('\n6. Testing Layout Integration...');
  
  const layoutPath = path.join(__dirname, '../src/app/layout.tsx');
  
  if (!fs.existsSync(layoutPath)) {
    console.log('❌ layout.tsx not found');
    return false;
  }
  
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  const requiredIntegrations = [
    'PWAInstallPrompt',
    'OfflineIndicator',
    'manifest'
  ];
  
  const missingIntegrations = requiredIntegrations.filter(integration => 
    !layoutContent.includes(integration)
  );
  
  if (missingIntegrations.length > 0) {
    console.log(`❌ Missing layout integrations: ${missingIntegrations.join(', ')}`);
    return false;
  }
  
  console.log('✅ PWA components are integrated in layout');
  return true;
}

// Run all tests
function runTests() {
  const tests = [
    testManifest,
    testServiceWorker,
    testIcons,
    testComponents,
    testNextConfig,
    testLayoutIntegration
  ];
  
  const results = tests.map(test => test());
  const passed = results.filter(result => result).length;
  const total = results.length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 PWA Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All PWA tests passed! Your app is ready for PWA deployment.');
    console.log('\n📋 Next steps:');
    console.log('   1. Deploy to HTTPS domain');
    console.log('   2. Test installation on different devices');
    console.log('   3. Run Lighthouse PWA audit');
    console.log('   4. Test offline functionality');
  } else {
    console.log('⚠️  Some PWA tests failed. Please fix the issues above.');
  }
  
  console.log('\n🔗 Useful commands:');
  console.log('   npm run generate-icons  # Generate PWA icons');
  console.log('   npm run pwa:build       # Build with PWA optimizations');
  console.log('   npm run dev             # Start development server');
}

// Run the tests
runTests(); 
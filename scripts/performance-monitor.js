#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Performance monitoring script for Next.js app
class PerformanceMonitor {
  constructor() {
    this.buildDir = path.join(process.cwd(), '.next');
    this.staticDir = path.join(this.buildDir, 'static');
  }

  // Get file size in KB
  getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return (stats.size / 1024).toFixed(2);
    } catch (error) {
      return 0;
    }
  }

  // Analyze bundle sizes
  analyzeBundles() {
    console.log('\n📊 Bundle Size Analysis');
    console.log('========================');

    const chunksDir = path.join(this.staticDir, 'chunks');
    
    if (!fs.existsSync(chunksDir)) {
      console.log('❌ Build directory not found. Run "npm run build" first.');
      return;
    }

    const files = fs.readdirSync(chunksDir, { recursive: true });
    const jsFiles = files.filter(file => file.endsWith('.js'));
    
    let totalSize = 0;
    const bundleInfo = [];

    jsFiles.forEach(file => {
      const filePath = path.join(chunksDir, file);
      const size = parseFloat(this.getFileSize(filePath));
      totalSize += size;
      
      bundleInfo.push({
        name: file,
        size: size,
        path: filePath
      });
    });

    // Sort by size (largest first)
    bundleInfo.sort((a, b) => b.size - a.size);

    console.log(`\n📦 Total Bundle Size: ${totalSize.toFixed(2)} KB`);
    console.log('\n🔍 Largest Bundles:');
    
    bundleInfo.slice(0, 10).forEach((bundle, index) => {
      const percentage = ((bundle.size / totalSize) * 100).toFixed(1);
      console.log(`${index + 1}. ${bundle.name}: ${bundle.size} KB (${percentage}%)`);
    });

    // Check for potential issues
    this.checkForIssues(bundleInfo, totalSize);
  }

  // Check for common performance issues
  checkForIssues(bundleInfo, totalSize) {
    console.log('\n⚠️  Performance Warnings:');
    
    // Check for large bundles
    const largeBundles = bundleInfo.filter(bundle => bundle.size > 500);
    if (largeBundles.length > 0) {
      console.log(`❌ Found ${largeBundles.length} bundles larger than 500KB:`);
      largeBundles.forEach(bundle => {
        console.log(`   - ${bundle.name}: ${bundle.size} KB`);
      });
    }

    // Check total bundle size
    if (totalSize > 2000) {
      console.log(`❌ Total bundle size (${totalSize.toFixed(2)} KB) exceeds recommended 2MB`);
    } else if (totalSize > 1000) {
      console.log(`⚠️  Total bundle size (${totalSize.toFixed(2)} KB) is getting large`);
    } else {
      console.log(`✅ Total bundle size (${totalSize.toFixed(2)} KB) is within acceptable range`);
    }
  }

  // Generate performance report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      bundles: [],
      recommendations: []
    };

    console.log('\n📋 Performance Report Generated');
    console.log('================================');
    
    // Add recommendations
    const recommendations = [
      '🚀 Use dynamic imports for heavy libraries (xlsx, jspdf, recharts)',
      '📦 Implement code splitting for route-based chunks',
      '🖼️  Optimize images with Next.js Image component',
      '💾 Add database query caching',
      '⚡ Use React.memo for expensive components',
      '🔄 Implement pagination for large data sets',
      '📊 Monitor Core Web Vitals in production'
    ];

    recommendations.forEach(rec => console.log(rec));

    return report;
  }

  // Run all analyses
  run() {
    console.log('🔍 Starting Performance Analysis...');
    this.analyzeBundles();
    this.generateReport();
    console.log('\n✅ Performance analysis complete!');
  }
}

// Run if called directly
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  monitor.run();
}

module.exports = PerformanceMonitor; 
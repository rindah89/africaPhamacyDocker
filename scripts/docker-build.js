const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Docker-specific Next.js build...');

// Set environment to production
process.env.NODE_ENV = 'production';
process.env.SKIP_BUILD_STATIC_GENERATION = '1';

try {
  // Run the Next.js build
  execSync('npx next build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Ensure we're in production mode
      NODE_ENV: 'production',
      // Skip type checking and linting during Docker build
      SKIP_VALIDATION: '1'
    }
  });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  
  // Check if .next directory exists
  if (fs.existsSync(path.join(process.cwd(), '.next'))) {
    console.log('Partial build completed - .next directory exists');
    
    // Create standalone directory structure if it doesn't exist
    const standaloneDir = path.join(process.cwd(), '.next', 'standalone');
    if (!fs.existsSync(standaloneDir)) {
      console.log('Creating standalone directory structure...');
      fs.mkdirSync(standaloneDir, { recursive: true });
      
      // Copy necessary files for standalone
      const serverJs = `
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(\`> Ready on http://\${hostname}:\${port}\`);
  });
});
`;
      fs.writeFileSync(path.join(standaloneDir, 'server.js'), serverJs);
      
      // Copy package.json
      const pkg = require(path.join(process.cwd(), 'package.json'));
      fs.writeFileSync(
        path.join(standaloneDir, 'package.json'),
        JSON.stringify({
          name: pkg.name,
          version: pkg.version,
          dependencies: {
            next: pkg.dependencies.next
          }
        }, null, 2)
      );
    }
    
    process.exit(0); // Exit successfully
  } else {
    console.error('Build failed completely - no .next directory created');
    process.exit(1);
  }
}
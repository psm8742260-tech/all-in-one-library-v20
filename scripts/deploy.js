import * as ftp from 'basic-ftp';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const host = process.env.FTP_HOST || process.env.FTP_SERVER || 'ftp.phrscrowd.online';
const user = process.env.FTP_USER || process.env.FTP_USERNAME;
const password = process.env.FTP_PASSWORD;
const port = parseInt(process.env.FTP_PORT || '21', 10);
const remoteDir = process.env.FTP_DIR || '/public_html/aiol.phrscrowd.online';

async function deploy() {
  console.log('🚀 Starting deployment for aiol.phrscrowd.online...');

  if (!user || !password) {
    console.error('❌ Error: FTP_USER / FTP_USERNAME and FTP_PASSWORD environment variables are required.');
    console.error('Please configure them in your .env file or environment.');
    process.exit(1);
  }

  console.log('🔨 Building project with production settings...');
  execSync('npm run build', { stdio: 'inherit', cwd: rootDir });

  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    console.log(`📡 Connecting to FTP server: ${host}:${port}...`);
    await client.access({
      host,
      user,
      password,
      port,
      secure: false
    });

    console.log(`📁 Ensuring remote directory exists: ${remoteDir}`);
    await client.ensureDir(remoteDir);

    console.log(`🚚 Uploading build files from dist/ to ${remoteDir}...`);
    await client.uploadFromDir(distDir, remoteDir);

    console.log('✅ Deployment to aiol.phrscrowd.online completed successfully!');
  } catch (err) {
    console.error('❌ Deployment failed:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();

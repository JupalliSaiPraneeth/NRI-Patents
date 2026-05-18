import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import archiver from 'archiver';
import util from 'util';
import dotenv from 'dotenv';

dotenv.config();

const execPromise = util.promisify(exec);

// Paths
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

import { supabase } from '../db.js';

// Ensure backup dir exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export const createBackup = async () => {
    try {
        console.log('🔄 Starting full system backup process...');
        const dateStr = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const zipFileName = `backup-${dateStr}.zip`;
        const zipFilePath = path.join(BACKUP_DIR, zipFileName);

        // 1. Fetch tables from Supabase
        console.log('📡 Fetching tables from Supabase...');
        const { data: patents, error: pErr } = await supabase.from('patents').select('*');
        if (pErr) throw pErr;

        const { data: admins, error: aErr } = await supabase.from('admins').select('*');
        if (aErr) throw aErr;

        const { data: logs, error: lErr } = await supabase.from('audit_logs').select('*');
        if (lErr) throw lErr;

        // Write temp JSON files in the backup directory
        const patentsPath = path.join(BACKUP_DIR, 'patents.json');
        const adminsPath = path.join(BACKUP_DIR, 'admins.json');
        const logsPath = path.join(BACKUP_DIR, 'audit_logs.json');

        fs.writeFileSync(patentsPath, JSON.stringify(patents, null, 2));
        fs.writeFileSync(adminsPath, JSON.stringify(admins, null, 2));
        fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));

        // 2. Compress JSON Files & Uploads to ZIP
        console.log(`📦 Zipping database JSONs and uploads into ${zipFileName}...`);
        
        await new Promise((resolve, reject) => {
            const output = fs.createWriteStream(zipFilePath);
            const archive = archiver('zip', {
                zlib: { level: 9 } // Maximum compression
            });

            output.on('close', () => {
                console.log(`✅ Zipping complete. Archive is ${archive.pointer()} total bytes.`);
                resolve();
            });

            archive.on('error', (err) => {
                reject(err);
            });

            archive.pipe(output);

            // Add the SQL dump to the root of the ZIP
            archive.file(patentsPath, { name: 'database/patents.json' });
            archive.file(adminsPath, { name: 'database/admins.json' });
            archive.file(logsPath, { name: 'database/audit_logs.json' });

            // Add the uploads folder to the root of the ZIP
            if (fs.existsSync(UPLOADS_DIR)) {
                archive.directory(UPLOADS_DIR, 'uploads');
            }

            archive.finalize();
        });

        // 3. Cleanup the temporary raw .json files
        if (fs.existsSync(patentsPath)) fs.unlinkSync(patentsPath);
        if (fs.existsSync(adminsPath)) fs.unlinkSync(adminsPath);
        if (fs.existsSync(logsPath)) fs.unlinkSync(logsPath);

        console.log(`✨ Backup process finished successfully: ${zipFileName}`);
        
        // 4. Auto-Rotation (3 Days)
        autoRotateBackups();

        return { success: true, message: "Backup completed successfully", file: zipFileName };

    } catch (error) {
        console.error('❌ Backup process failed:', error);
        return { success: false, message: "Backup process failed", error: error.message };
    }
};

function autoRotateBackups() {
    console.log('🧹 Running 3-Day Backup Auto-Rotation...');
    const RETENTION_DAYS = 3;
    const now = Date.now();
    const KEEP_TIME_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

    try {
        const files = fs.readdirSync(BACKUP_DIR);
        let deletedCount = 0;

        files.forEach(file => {
            if (file.endsWith('.zip') && file.startsWith('backup-')) {
                const filePath = path.join(BACKUP_DIR, file);
                const stats = fs.statSync(filePath);
                
                // Calculate age of file in milliseconds
                const fileAge = now - stats.mtimeMs;
                
                if (fileAge > KEEP_TIME_MS) {
                    fs.unlinkSync(filePath);
                    console.log(`🗑️ Deleted old backup: ${file}`);
                    deletedCount++;
                }
            }
        });

        console.log(`✅ Rotation complete. Deleted ${deletedCount} old backup(s).`);
    } catch (err) {
        console.error('❌ Auto-rotation failed to clean up old files:', err);
    }
};

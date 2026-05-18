import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireSuperAdmin, requireAnyAdmin } from "../middleware/authorization.js";
import { supabase } from "../db.js";
import bcrypt from "bcryptjs";
import { logAction } from "../utils/logger.js";
import { createBackup } from "../services/backupService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current user info
router.get("/me", verifyToken, requireAnyAdmin, async (req, res) => {
  try {
    const { data: admins, error } = await supabase
      .from('admins')
      .select('id, email, role, department, created_at')
      .eq('email', req.user.userEmail);

    if (error) throw error;

    if (!admins || admins.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(admins[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch user info" });
  }
});

// Get all admins (super admin only) — supports pagination
router.get("/admins", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 0;

    let query = supabase
      .from('admins')
      .select('id, email, role, department, created_at, creator:admins!created_by(email)', { count: 'exact' })
      .order('role', { ascending: false })
      .order('created_at', { ascending: true });

    if (page > 0 && limit > 0) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
      
      const { data: admins, count, error } = await query;
      if (error) throw error;

      // Map the nested join to match the expected format
      const mappedAdmins = admins.map(a => ({
        ...a,
        created_by_email: a.creator?.email || null,
        creator: undefined
      }));

      return res.status(200).json({
        data: mappedAdmins,
        pagination: { 
          total: count, 
          page, 
          limit, 
          totalPages: Math.ceil(count / limit) 
        }
      });
    } else {
      const { data: admins, error } = await query;
      if (error) throw error;

      const mappedAdmins = admins.map(a => ({
        ...a,
        created_by_email: a.creator?.email || null,
        creator: undefined
      }));

      return res.status(200).json(mappedAdmins);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch admins" });
  }
});

// Add super admin (super admin only)
router.post("/super-admin", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email.toLowerCase().trim());
    
    if (checkError) throw checkError;
    if (existing && existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    // Insert new super admin
    const { error: insertError } = await supabase
      .from('admins')
      .insert([
        { 
          email: email.toLowerCase().trim(), 
          password_hash: passwordHash, 
          role: 'super_admin', 
          department: null, 
          created_by: req.user.adminId || null 
        }
      ]);

    if (insertError) throw insertError;

    await logAction(req.user.userEmail, "CREATE_SUPER_ADMIN", `Created super admin: ${email}`);

    return res.status(200).json({ message: "Super admin created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create super admin" });
  }
});

// Add sub admin (super admin only)
router.post("/sub-admin", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { email, password, department } = req.body;

    if (!email || !password || !department) {
      return res.status(400).json({ message: "Email, password, and department are required" });
    }

    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email.toLowerCase().trim());
    
    if (checkError) throw checkError;
    if (existing && existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    // Insert new sub admin
    const { error: insertError } = await supabase
      .from('admins')
      .insert([
        { 
          email: email.toLowerCase().trim(), 
          password_hash: passwordHash, 
          role: 'sub_admin', 
          department: department, 
          created_by: req.user.adminId || null 
        }
      ]);

    if (insertError) throw insertError;

    await logAction(req.user.userEmail, "CREATE_SUB_ADMIN", `Created sub admin for ${department}: ${email}`);

    return res.status(200).json({ message: "Sub admin created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create sub admin" });
  }
});

// Update admin password (super admin can update any, users can update own)
router.put("/:id/password", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // Get target admin
    const { data: targetAdmins, error: fetchError } = await supabase
      .from('admins')
      .select('id, email, role')
      .eq('id', id);
    
    if (fetchError) throw fetchError;
    if (!targetAdmins || targetAdmins.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const targetAdmin = targetAdmins[0];

    // Check permissions
    const isSelf = req.user.adminId === parseInt(id);
    const isSuper = req.user.role === 'super_admin';

    if (!isSelf && !isSuper) {
      return res.status(403).json({ message: "You can only change your own password" });
    }

    // Super admins cannot change other super admins' passwords (except their own)
    if (!isSelf && targetAdmin.role === 'super_admin') {
      return res.status(403).json({ message: "Cannot change another super admin's password" });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    // Update password
    const { error: updateError } = await supabase
      .from('admins')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) throw updateError;

    const actionDetail = isSelf
      ? "Changed own password"
      : `Reset password for ${targetAdmin.email}`;

    await logAction(req.user.userEmail, "PASSWORD_CHANGE", actionDetail);

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update password" });
  }
});

// Change own password
router.put("/my-password", verifyToken, requireAnyAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    // Get current user
    const { data: admins, error: fetchError } = await supabase
      .from('admins')
      .select('id, email, password_hash')
      .eq('id', req.user.adminId);

    if (fetchError) throw fetchError;
    if (!admins || admins.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const admin = admins[0];

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    // Update password
    const { error: updateError } = await supabase
      .from('admins')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', admin.id);

    if (updateError) throw updateError;

    await logAction(req.user.userEmail, "PASSWORD_CHANGE", "Changed own password");

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to change password" });
  }
});

// DELETE /admin/orphaned-files
router.delete("/orphaned-files", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { files } = req.body; // [{ filename, folder }]

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: "No files specified for deletion" });
    }

    // Re-query DB references
    const { data: rows, error: fetchError } = await supabase
      .from('patents')
      .select('documentlink, grantdocumentlink');
    
    if (fetchError) throw fetchError;

    const dbReferencedFilenames = new Set();
    for (const row of rows) {
      if (row.documentlink) dbReferencedFilenames.add(path.basename(row.documentlink));
      if (row.grantdocumentlink) dbReferencedFilenames.add(path.basename(row.grantdocumentlink));
    }

    const uploadsBase = path.join(__dirname, '../uploads');
    const allowedFolders = ['proof_of_publish', 'proof_of_grant'];
    const deleted = [];
    const skipped = [];

    for (const { filename, folder } of files) {
      if (!allowedFolders.includes(folder) || filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
        skipped.push({ filename, reason: 'Security violation' });
        continue;
      }

      if (dbReferencedFilenames.has(filename)) {
        skipped.push({ filename, reason: 'File referenced in DB' });
        continue;
      }

      const filePath = path.join(uploadsBase, folder, filename);
      if (!fs.existsSync(filePath)) {
        skipped.push({ filename, reason: 'File not found' });
        continue;
      }

      fs.unlinkSync(filePath);
      deleted.push(filename);
    }

    await logAction(req.user.userEmail, "ORPHAN_CLEANUP", `Deleted ${deleted.length} orphaned file(s)`);

    return res.status(200).json({ message: `Deleted ${deleted.length} file(s)`, deleted, skipped });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete orphaned files" });
  }
});

// Delete admin (super admin only)
router.delete("/:id", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.adminId === parseInt(id)) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    const { data: admins, error: fetchError } = await supabase
      .from('admins')
      .select('email, role')
      .eq('id', id);
    
    if (fetchError) throw fetchError;
    if (!admins || admins.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const deletedAdmin = admins[0];

    const { error: deleteError } = await supabase
      .from('admins')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    await logAction(req.user.userEmail, "DELETE_ADMIN", `Deleted ${deletedAdmin.role}: ${deletedAdmin.email}`);

    return res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete admin" });
  }
});

// Update sub admin department (super admin only)
router.put("/:id/department", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { department } = req.body;

    if (!department) {
      return res.status(400).json({ message: "Department is required" });
    }

    const { data: admins, error: fetchError } = await supabase
      .from('admins')
      .select('email, role')
      .eq('id', id);
    
    if (fetchError) throw fetchError;
    if (!admins || admins.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admins[0].role === 'super_admin') {
      return res.status(400).json({ message: "Cannot assign department to super admin" });
    }

    const { error: updateError } = await supabase
      .from('admins')
      .update({ department: department, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) throw updateError;

    await logAction(req.user.userEmail, "UPDATE_DEPARTMENT", `Changed department for ${admins[0].email} to ${department}`);

    return res.status(200).json({ message: "Department updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update department" });
  }
});

// Get audit logs
router.get("/logs", verifyToken, requireAnyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false });

    if (req.user.role === 'sub_admin') {
      query = query.ilike('details', `%${req.user.department}%`);
    }

    const { data: logs, count, error } = await query.range(from, to);
    if (error) throw error;

    return res.json({
      logs,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch logs" });
  }
});

// Delete all patents (super admin only)
router.post("/deleteAll", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const publishDir = path.join(__dirname, '../uploads/proof_of_publish');
    const grantDir = path.join(__dirname, '../uploads/proof_of_grant');

    const cleanDir = (dir) => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          fs.unlinkSync(path.join(dir, file));
        }
      }
    };

    cleanDir(publishDir);
    cleanDir(grantDir);

    const { error: deleteError } = await supabase
      .from('patents')
      .delete()
      .neq('id', 0); // Delete all hack

    if (deleteError) throw deleteError;

    await logAction(req.user.userEmail, "DELETE_ALL", "Deleted all patents and associated files");
    return res.status(200).json({ message: "All patents and files deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete all" });
  }
});

// Dashboard stats
router.get("/stats", verifyToken, requireAnyAdmin, async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'super_admin';
    const dept = req.user.department;

    let patentQuery = supabase.from('patents').select('*', { count: 'exact', head: true });
    if (!isSuperAdmin && dept) patentQuery = patentQuery.eq('department', dept);
    const { count: totalPatents, error: pErr } = await patentQuery;
    if (pErr) throw pErr;

    let adminQuery = supabase.from('admins').select('*', { count: 'exact', head: true });
    const { count: totalAdmins, error: aErr } = await adminQuery;
    if (aErr) throw aErr;

    let logQuery = supabase.from('audit_logs').select('*', { count: 'exact', head: true });
    if (!isSuperAdmin && dept) logQuery = logQuery.ilike('details', `%${dept}%`);
    const { count: totalLogs, error: lErr } = await logQuery;
    if (lErr) throw lErr;

    let deptQuery = supabase.from('patents').select('department', { count: 'exact' });
    const { data: depts, error: dErr } = await deptQuery;
    if (dErr) throw dErr;
    const totalDepartments = new Set(depts.map(d => d.department).filter(Boolean)).size;

    return res.status(200).json({
      totalPatents,
      totalAdmins,
      totalLogs,
      totalDepartments,
      department: dept || null
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// Audit Log Cleanup
router.post("/logs/cleanup", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const retentionMonths = parseInt(req.body.retentionMonths) || 6;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - retentionMonths);

    const { count, error } = await supabase
      .from('audit_logs')
      .delete()
      .lt('timestamp', cutoff.toISOString());

    if (error) throw error;

    await logAction(req.user.userEmail, "CLEANUP", `Cleaned up logs older than ${retentionMonths} months`);
    return res.status(200).json({ message: "Cleanup completed", deletedCount: count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to clean up logs" });
  }
});

// Get departments
router.get("/departments", verifyToken, requireAnyAdmin, async (req, res) => {
  try {
    const { data: pDepts, error: pErr } = await supabase.from('patents').select('department');
    if (pErr) throw pErr;
    const { data: aDepts, error: aErr } = await supabase.from('admins').select('department').eq('role', 'sub_admin');
    if (aErr) throw aErr;

    const deptSet = new Set();
    pDepts.forEach(d => d.department && deptSet.add(d.department));
    aDepts.forEach(d => d.department && deptSet.add(d.department));

    return res.status(200).json(Array.from(deptSet).sort());
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch departments" });
  }
});

// Orphaned Scan
router.get("/orphaned-files", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const uploadsBase = path.join(__dirname, '../uploads');
    const folders = ['proof_of_publish', 'proof_of_grant'];
    const diskFiles = [];
    
    for (const folder of folders) {
      const folderPath = path.join(uploadsBase, folder);
      if (!fs.existsSync(folderPath)) continue;
      fs.readdirSync(folderPath).forEach(filename => {
        const stat = fs.statSync(path.join(folderPath, filename));
        if (stat.isFile()) diskFiles.push({ filename, folder, size: stat.size, lastModified: stat.mtime });
      });
    }

    const { data: rows, error } = await supabase.from('patents').select('documentlink, grantdocumentlink');
    if (error) throw error;

    const dbRefs = new Set();
    rows.forEach(r => {
      if (r.documentlink) dbRefs.add(path.basename(r.documentlink));
      if (r.grantdocumentlink) dbRefs.add(path.basename(r.grantdocumentlink));
    });

    const orphaned = diskFiles.filter(f => !dbRefs.has(f.filename));
    return res.status(200).json({ orphaned, total: diskFiles.length, orphanedCount: orphaned.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to scan orphans" });
  }
});

// Trigger full system backup (super admin only)
router.post("/backup", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    console.log(`[BACKUP REQUEST] Triggered manually by ${req.user.userEmail}`);
    const result = await createBackup();
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to execute backup" });
  }
});

export default router;

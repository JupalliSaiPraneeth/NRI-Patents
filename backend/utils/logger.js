import { supabase } from "../db.js";

export const logAction = async (userEmail, action, details) => {
  try {
    const { error } = await supabase.from('audit_logs').insert([
      { 
        user_email: userEmail, 
        action: action, 
        details: details,
        timestamp: new Date().toISOString()
      }
    ]);

    if (error) throw error;
  } catch (err) {
    console.error("Error logging action:", err.message);
  }
};

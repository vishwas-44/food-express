
import supabase from '../config/supabase.js';

// ============================================
// GET ADMIN NOTIFICATIONS
// ============================================

export const getAdminNotificationsController = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_type', 'admin')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return res.status(200).json({
      message: 'Admin notifications fetched successfully',
      success: true,
      error: false,
      data: data || [],
    });
  } catch (error) {
    console.error('Get admin notifications error:', error);

    return res.status(500).json({
      message: 'Failed to fetch admin notifications',
      success: false,
      error: true,
    });
  }
};

// ============================================
// GET CUSTOMER NOTIFICATIONS
// ============================================

export const getCustomerNotificationsController = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Customer authentication required',
        success: false,
        error: true,
      });
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_type', 'customer')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return res.status(200).json({
      message: 'Customer notifications fetched successfully',
      success: true,
      error: false,
      data: data || [],
    });
  } catch (error) {
    console.error('Get customer notifications error:', error);

    return res.status(500).json({
      message: 'Failed to fetch customer notifications',
      success: false,
      error: true,
    });
  }
};

// ============================================
// MARK ADMIN NOTIFICATION AS READ
// ============================================

export const markAdminNotificationReadController = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('recipient_type', 'admin')
      .select('*')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: 'Admin notification not found',
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: 'Notification marked as read',
      success: true,
      error: false,
      data,
    });
  } catch (error) {
    console.error('Mark admin notification read error:', error);

    return res.status(500).json({
      message: 'Failed to mark notification as read',
      success: false,
      error: true,
    });
  }
};

// ============================================
// MARK CUSTOMER NOTIFICATION AS READ
// ============================================

export const markCustomerNotificationReadController = async (req, res) => {
  try {
    const userId = req.userId;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: 'Customer authentication required',
        success: false,
        error: true,
      });
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('recipient_type', 'customer')
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: 'Customer notification not found',
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: 'Notification marked as read',
      success: true,
      error: false,
      data,
    });
  } catch (error) {
    console.error('Mark customer notification read error:', error);

    return res.status(500).json({
      message: 'Failed to mark notification as read',
      success: false,
      error: true,
    });
  }
};

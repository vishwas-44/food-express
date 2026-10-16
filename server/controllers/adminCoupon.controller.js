
import supabase from '../config/supabase.js';

const normalizeCoupon = (coupon) => ({
  code: String(coupon.code || '').trim().toUpperCase(),
  description: coupon.description?.trim() || null,
  discount_type: coupon.discount_type,
  discount_value: Number(coupon.discount_value),
  minimum_order_amount: Number(coupon.minimum_order_amount ?? 0),

  maximum_discount:
    coupon.maximum_discount === '' ||
    coupon.maximum_discount === null ||
    coupon.maximum_discount === undefined
      ? null
      : Number(coupon.maximum_discount),

  usage_limit:
    coupon.usage_limit === '' ||
    coupon.usage_limit === null ||
    coupon.usage_limit === undefined
      ? null
      : Number(coupon.usage_limit),

  // Validate the date before converting it to ISO format.
  expires_at: coupon.expires_at
    ? Number.isNaN(new Date(coupon.expires_at).getTime())
      ? 'INVALID_DATE'
      : new Date(coupon.expires_at).toISOString()
    : null,
});

const validateCouponInput = (coupon) => {
  if (!coupon || typeof coupon !== 'object' || Array.isArray(coupon)) {
    return { error: 'Invalid coupon data.' };
  }

  const normalized = normalizeCoupon(coupon);

  if (!/^[A-Z0-9_-]{2,40}$/.test(normalized.code)) {
    return {
      error:
        'Coupon code must contain 2–40 letters, numbers, hyphens, or underscores.',
    };
  }

  if (!['percentage', 'fixed'].includes(normalized.discount_type)) {
    return { error: 'Choose percentage or fixed discount.' };
  }

  if (
    !Number.isFinite(normalized.discount_value) ||
    normalized.discount_value <= 0
  ) {
    return { error: 'Discount value must be greater than zero.' };
  }

  if (
    normalized.discount_type === 'percentage' &&
    normalized.discount_value > 100
  ) {
    return { error: 'Percentage discount cannot exceed 100%.' };
  }

  if (
    !Number.isFinite(normalized.minimum_order_amount) ||
    normalized.minimum_order_amount < 0
  ) {
    return { error: 'Minimum order amount cannot be negative.' };
  }

  if (
    normalized.maximum_discount !== null &&
    (!Number.isFinite(normalized.maximum_discount) ||
      normalized.maximum_discount <= 0)
  ) {
    return { error: 'Maximum discount must be greater than zero.' };
  }

  if (
    normalized.discount_type === 'fixed' &&
    normalized.maximum_discount !== null
  ) {
    return {
      error:
        'Maximum discount is only applicable to percentage coupons. Leave it blank for fixed discounts.',
    };
  }

  if (
    normalized.usage_limit !== null &&
    (!Number.isInteger(normalized.usage_limit) ||
      normalized.usage_limit <= 0)
  ) {
    return {
      error: 'Usage limit must be a positive whole number.',
    };
  }

  // Return a validation error instead of allowing an invalid date
  // to cause a RangeError when calling toISOString().
  if (
    normalized.expires_at === 'INVALID_DATE' ||
    (normalized.expires_at &&
      Number.isNaN(new Date(normalized.expires_at).getTime()))
  ) {
    return { error: 'Expiry date is invalid.' };
  }

  return { value: normalized };
};

// GET /api/admin/coupons
export const getAdminCouponsController = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Coupons fetched successfully.',
      data: data || [],
    });
  } catch (error) {
    console.error('Get admin coupons error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons.',
    });
  }
};

// POST /api/admin/coupons
export const createAdminCouponController = async (req, res) => {
  try {
    const result = validateCouponInput(req.body);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    const coupon = result.value;

    const { data: existing, error: findError } = await supabase
      .from('coupons')
      .select('id')
      .ilike('code', coupon.code)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A coupon with this code already exists.',
      });
    }

    const { data, error } = await supabase
      .from('coupons')
      .insert({
        ...coupon,
        is_active: req.body.is_active !== false,
        used_count: 0,
      })
      .select('*')
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      data,
    });
  } catch (error) {
    console.error('Create admin coupon error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create coupon.',
    });
  }
};

// PUT /api/admin/coupons/:couponId
export const updateAdminCouponController = async (req, res) => {
  try {
    const { couponId } = req.params;
    const result = validateCouponInput(req.body);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    const coupon = result.value;

    const { data: existing, error: findError } = await supabase
      .from('coupons')
      .select('id, used_count')
      .eq('id', couponId)
      .maybeSingle();

    if (findError) throw findError;

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      });
    }

    if (
      coupon.usage_limit !== null &&
      coupon.usage_limit < Number(existing.used_count)
    ) {
      return res.status(400).json({
        success: false,
        message: `Usage limit cannot be less than the ${existing.used_count} times this coupon has already been used.`,
      });
    }

    const { data: duplicate, error: duplicateError } = await supabase
      .from('coupons')
      .select('id')
      .ilike('code', coupon.code)
      .neq('id', couponId)
      .maybeSingle();

    if (duplicateError) throw duplicateError;

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: 'Another coupon already uses this code.',
      });
    }

    const { data, error } = await supabase
      .from('coupons')
      .update({
        ...coupon,
        is_active: req.body.is_active !== false,
      })
      .eq('id', couponId)
      .select('*')
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Coupon updated successfully.',
      data,
    });
  } catch (error) {
    console.error('Update admin coupon error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update coupon.',
    });
  }
};

// PATCH /api/admin/coupons/:couponId/active
export const toggleAdminCouponController = async (req, res) => {
  try {
    const { couponId } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_active must be true or false.',
      });
    }

    const { data, error } = await supabase
      .from('coupons')
      .update({ is_active })
      .eq('id', couponId)
      .select('*')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Coupon ${is_active ? 'activated' : 'deactivated'} successfully.`,
      data,
    });
  } catch (error) {
    console.error('Toggle admin coupon error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to change coupon status.',
    });
  }
};

// DELETE /api/admin/coupons/:couponId
export const deleteAdminCouponController = async (req, res) => {
  try {
    const { couponId } = req.params;

    const { data: coupon, error: findError } = await supabase
      .from('coupons')
      .select('id, code')
      .eq('id', couponId)
      .maybeSingle();

    if (findError) throw findError;

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      });
    }

    // Preserve order history and coupon references.
    const { data: linkedOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('coupon_code', coupon.code)
      .limit(1);

    if (ordersError) throw ordersError;

    if (linkedOrders?.length) {
      return res.status(409).json({
        success: false,
        message:
          'This coupon is linked to an order and cannot be deleted. Deactivate it instead.',
      });
    }

    const { error: deleteError } = await supabase
      .from('coupons')
      .delete()
      .eq('id', couponId);

    if (deleteError) throw deleteError;

    return res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully.',
    });
  } catch (error) {
    console.error('Delete admin coupon error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete coupon.',
    });
  }
};

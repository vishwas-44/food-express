
import supabase from '../config/supabase.js';

export const validateCouponController = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code || orderAmount === undefined || orderAmount === null) {
      return res.status(400).json({
        message: 'Coupon code and order amount are required.',
      });
    }

    const amount = Number(orderAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: 'Please provide a valid order amount.',
      });
    }

    const normalizedCode = String(code).trim().toUpperCase();

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', normalizedCode)
      .maybeSingle();

    if (error) {
      console.error('Coupon lookup error:', error.message);

      return res.status(500).json({
        message: 'Unable to validate coupon right now.',
      });
    }

    if (!coupon || !coupon.is_active) {
      return res.status(400).json({
        message: 'Invalid or inactive coupon code.',
      });
    }

    if (
      coupon.expires_at &&
      new Date(coupon.expires_at).getTime() <= Date.now()
    ) {
      return res.status(400).json({
        message: 'This coupon has expired.',
      });
    }

    if (
      coupon.usage_limit !== null &&
      coupon.used_count >= coupon.usage_limit
    ) {
      return res.status(400).json({
        message: 'This coupon has reached its usage limit.',
      });
    }

    const minimumAmount = Number(coupon.minimum_order_amount || 0);

    if (amount < minimumAmount) {
      return res.status(400).json({
        message: `Minimum order amount for this coupon is ₹${minimumAmount.toFixed(2)}.`,
      });
    }

    let discount = 0;

    if (coupon.discount_type === 'percentage') {
      discount = (amount * Number(coupon.discount_value)) / 100;

      if (coupon.maximum_discount !== null) {
        discount = Math.min(
          discount,
          Number(coupon.maximum_discount)
        );
      }
    } else if (coupon.discount_type === 'fixed') {
      discount = Number(coupon.discount_value);
    }

    discount = Math.min(
      Math.round((discount + Number.EPSILON) * 100) / 100,
      amount
    );

    return res.status(200).json({
      message: 'Coupon applied successfully.',
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountValue: Number(coupon.discount_value),
      },
      discount,
      finalAmount: Math.round((amount - discount + Number.EPSILON) * 100) / 100,
    });
  } catch (error) {
    console.error('Validate coupon error:', error);

    return res.status(500).json({
      message: 'An unexpected error occurred while validating the coupon.',
    });
  }
};

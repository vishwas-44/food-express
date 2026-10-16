import supabase from '../config/supabase.js';

// ============================================
// DELIVERY CALCULATION HELPER
// ============================================

const calculateOrderDelivery = (subtotal, latitude, longitude) => {
  const restaurantLat = Number(process.env.RESTAURANT_LAT);
  const restaurantLng = Number(process.env.RESTAURANT_LNG);

  const baseFee = 40;
  const baseRadius = 3;
  const extraPerKm = 10;
  const freeDeliveryThreshold = 499;

  const preparationMinutes = Number(
    process.env.PREPARATION_TIME_MINUTES ?? 15
  );

  const baseTravelMinutes = Number(
    process.env.BASE_TRAVEL_TIME_MINUTES ?? 25
  );

  const lat = Number(latitude);
  const lng = Number(longitude);

  // Validate restaurant and customer coordinates.
  if (
    !Number.isFinite(restaurantLat) ||
    !Number.isFinite(restaurantLng) ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    throw new Error(
      'Valid restaurant and delivery coordinates are required.'
    );
  }

  // Convert degrees to radians.
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  // Calculate straight-line distance using Haversine formula.
  const earthRadiusKm = 6371;

  const latitudeDifference = toRadians(lat - restaurantLat);
  const longitudeDifference = toRadians(lng - restaurantLng);

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(restaurantLat)) *
      Math.cos(toRadians(lat)) *
      Math.sin(longitudeDifference / 2) ** 2;

  const distanceKm =
    earthRadiusKm *
    2 *
    Math.atan2(
      Math.sqrt(haversine),
      Math.sqrt(Math.max(0, 1 - haversine))
    );

  // Charge ₹10 for each additional started kilometre
  // beyond the base 3 km radius.
  const additionalKm = Math.max(
    0,
    Math.ceil(distanceKm - baseRadius - 1e-9)
  );

  // Free delivery is based on food subtotal before coupon.
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;

  const deliveryFee = isFreeDelivery
    ? 0
    : baseFee + additionalKm * extraPerKm;

  // Estimate travel time plus preparation time.
  const extraTravelBlocks = Math.floor(distanceKm / 3);

  const estimatedDeliveryMinutes =
    preparationMinutes +
    baseTravelMinutes +
    extraTravelBlocks * 5;

  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    deliveryFee: Number(deliveryFee.toFixed(2)),
    isFreeDelivery,
    estimatedDeliveryMinutes,
  };
};

// ============================================
// ADD NEW DELIVERY ADDRESS
// ============================================

export const addAddressController = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      address_line1,
      city,
      state,
      pincode,
      country,
      mobile,
      landmark,
      address_type,
    } = req.body;

    if (
      !address_line1 ||
      !city ||
      !state ||
      !pincode ||
      !country ||
      !mobile
    ) {
      return res.status(400).json({
        message: 'Please provide all required address fields',
        error: true,
      });
    }

    const { data: savedAddress, error: addressError } =
      await supabase
        .from('addresses')
        .insert({
          user_id: userId,
          address_line1,
          city,
          state,
          pincode,
          country,
          mobile,
          landmark: landmark || null,
          address_type: address_type || 'Home',
        })
        .select('*')
        .single();

    if (addressError) throw addressError;

    return res.status(201).json({
      message: 'Address saved successfully',
      success: true,
      error: false,
      data: savedAddress,
    });
  } catch (error) {
    console.error('Add address error:', error);

    return res.status(500).json({
      message: error.message || 'Failed to save address',
      error: true,
    });
  }
};

// ============================================
// CREATE FOOD ORDER
// ============================================

export const createOrderController = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      products,
      delivery_address,
      payment_status,
      coupon_code,
    } = req.body;

    // Validate order details.
    if (
      !Array.isArray(products) ||
      products.length === 0 ||
      !delivery_address ||
      typeof delivery_address !== 'object'
    ) {
      return res.status(400).json({
        message: 'Invalid order payload',
        error: true,
      });
    }

    // Validate product details.
    for (const item of products) {
      const quantity = Number(item.quantity);
      const price = Number(item.price);

      if (
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isInteger(quantity) ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        return res.status(400).json({
          message: 'Invalid product quantity or price',
          error: true,
        });
      }
    }

    // Calculate food subtotal on the server.
    const subtotal = Number(
      products
        .reduce(
          (sum, item) =>
            sum + Number(item.price) * Number(item.quantity),
          0
        )
        .toFixed(2)
    );

    // Calculate delivery fee using the server's coordinates
    // and configuration, not a fee supplied by the frontend.
    let delivery;

    try {
      delivery = calculateOrderDelivery(
        subtotal,
        delivery_address.latitude,
        delivery_address.longitude
      );
    } catch (error) {
      return res.status(400).json({
        message: error.message,
        error: true,
      });
    }

    const shippingFee = delivery.deliveryFee;
    const tax = Number((subtotal * 0.08).toFixed(2));

    let discount = 0;
    let normalizedCouponCode = null;
    let couponRecord = null;

    // ============================================
    // REVALIDATE COUPON ON THE SERVER
    // ============================================

    if (
      typeof coupon_code === 'string' &&
      coupon_code.trim()
    ) {
      normalizedCouponCode = coupon_code.trim().toUpperCase();

      const { data: coupon, error: couponError } =
        await supabase
          .from('coupons')
          .select('*')
          .ilike('code', normalizedCouponCode)
          .maybeSingle();

      if (couponError) throw couponError;

      if (!coupon) {
        return res.status(400).json({
          message: 'Coupon code is invalid',
          error: true,
        });
      }

      if (!coupon.is_active) {
        return res.status(400).json({
          message: 'This coupon is inactive',
          error: true,
        });
      }

      if (
        coupon.expires_at &&
        new Date(coupon.expires_at).getTime() <= Date.now()
      ) {
        return res.status(400).json({
          message: 'This coupon has expired',
          error: true,
        });
      }

      if (
        coupon.usage_limit !== null &&
        Number(coupon.used_count) >= Number(coupon.usage_limit)
      ) {
        return res.status(400).json({
          message: 'This coupon has reached its usage limit',
          error: true,
        });
      }

      if (
        subtotal < Number(coupon.minimum_order_amount || 0)
      ) {
        return res.status(400).json({
          message: `Minimum order amount for this coupon is ₹${Number(
            coupon.minimum_order_amount
          ).toFixed(2)}`,
          error: true,
        });
      }

      if (coupon.discount_type === 'percentage') {
        discount =
          subtotal * (Number(coupon.discount_value) / 100);

        if (coupon.maximum_discount !== null) {
          discount = Math.min(
            discount,
            Number(coupon.maximum_discount)
          );
        }
      } else if (coupon.discount_type === 'fixed') {
        discount = Number(coupon.discount_value);
      }

      // A coupon cannot discount more than the food subtotal.
      discount = Math.min(discount, subtotal);
      discount = Math.max(0, discount);

      couponRecord = coupon;
    }

    discount = Number(discount.toFixed(2));

    // Calculate final amount on the server.
    const totalAmount = Math.max(
      0,
      Number(
        (subtotal + shippingFee + tax - discount).toFixed(2)
      )
    );

    // ============================================
    // SAVE ORDER
    // ============================================

    const { data: savedOrder, error: orderError } =
      await supabase
        .from('orders')
        .insert({
          user_id: userId,
          products,
          delivery_address,
          total_amount: totalAmount,
          payment_status: payment_status || 'Cash on Delivery',
          order_status: 'Processing',
          coupon_code: normalizedCouponCode,
          discount_amount: discount,
        })
        .select('*')
        .single();

    if (orderError) throw orderError;

    // ============================================
    // CREATE ADMIN NOTIFICATION
    // ============================================

    // Notify the admin when a new order is placed.
    // Notification failure should not cancel the order.
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        recipient_type: 'admin',
        user_id: null,
        order_id: savedOrder.id,
        title: 'New Order Received',
        message: `A new order #${savedOrder.id} has been placed.`,
        is_read: false,
      });

    if (notificationError) {
      console.error(
        'Admin notification creation error:',
        notificationError
      );
    }

    // ============================================
    // SAVE INITIAL ORDER STATUS IN HISTORY
    // ============================================

    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: savedOrder.id,
        status: 'Order Placed',
      });

    if (historyError) {
      console.error(
        'Order status history error:',
        historyError
      );
    }

    // ============================================
    // INCREMENT COUPON USAGE
    // ============================================

    if (couponRecord) {
      const { error: usageError } = await supabase
        .from('coupons')
        .update({
          used_count: Number(couponRecord.used_count) + 1,
        })
        .eq('id', couponRecord.id);

      if (usageError) {
        console.error(
          'Coupon usage update error:',
          usageError
        );
      }
    }

    // ============================================
    // RETURN ORDER AND PRICING DETAILS
    // ============================================

    return res.status(201).json({
      message: 'Order placed successfully!',
      success: true,
      error: false,
      data: savedOrder,
      pricing: {
        subtotal,
        distanceKm: delivery.distanceKm,
        shippingFee,
        isFreeDelivery: delivery.isFreeDelivery,
        estimatedDeliveryMinutes:
          delivery.estimatedDeliveryMinutes,
        tax,
        discount,
        totalAmount,
        couponCode: normalizedCouponCode,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);

    return res.status(500).json({
      message: error.message || 'Failed to create order',
      error: true,
    });
  }
};

// ============================================
// GET USER ORDERS
// ============================================

export const getOrdersController = async (req, res) => {
  try {
    const userId = req.userId;

    const { data: orders, error: ordersError } =
      await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    const ordersWithHistory = await Promise.all(
      (orders || []).map(async (order) => {
        const {
          data: statusHistory,
          error: historyError,
        } = await supabase
          .from('order_status_history')
          .select('id, status, created_at')
          .eq('order_id', order.id)
          .order('created_at', { ascending: true });

        if (historyError) {
          console.error(
            'Get order status history error:',
            historyError
          );
        }

        return {
          ...order,
          status_history: statusHistory || [],
        };
      })
    );

    return res.status(200).json({
      message: 'Orders fetched successfully',
      success: true,
      error: false,
      data: ordersWithHistory,
    });
  } catch (error) {
    console.error('Get orders error:', error);

    return res.status(500).json({
      message: error.message || 'Failed to fetch orders',
      error: true,
    });
  }
};

// ============================================
// CANCEL CUSTOMER ORDER
// ============================================

export const cancelOrderController = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        message: 'Order ID is required',
        error: true,
      });
    }

    const {
      data: existingOrder,
      error: findError,
    } = await supabase
      .from('orders')
      .select('id, user_id, order_status')
      .eq('id', orderId)
      .eq('user_id', userId)
      .maybeSingle();

    if (findError) throw findError;

    if (!existingOrder) {
      return res.status(404).json({
        message: 'Order not found',
        error: true,
      });
    }

    const cancellableStatuses = [
      'Processing',
      'Confirmed',
      'Preparing',
    ];

    if (
      !cancellableStatuses.includes(existingOrder.order_status)
    ) {
      return res.status(400).json({
        message: 'This order can no longer be cancelled.',
        error: true,
      });
    }

    const {
      data: cancelledOrder,
      error: updateError,
    } = await supabase
      .from('orders')
      .update({
        order_status: 'Cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (updateError) throw updateError;

    // Save cancellation in order status history.
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status: 'Cancelled',
      });

    if (historyError) {
      console.error(
        'Cancel order history error:',
        historyError
      );
    }

    return res.status(200).json({
      message: 'Order cancelled successfully',
      success: true,
      error: false,
      data: cancelledOrder,
    });
  } catch (error) {
    console.error('Cancel order error:', error);

    return res.status(500).json({
      message: error.message || 'Failed to cancel order',
      error: true,
    });
  }
};
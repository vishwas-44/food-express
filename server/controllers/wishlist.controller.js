import supabase from '../config/supabase.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Validate the authenticated customer ID.
const validateCustomerId = (userId) => {
  return typeof userId === 'string' && UUID_REGEX.test(userId);
};

// ============================================
// GET: Fetch the logged-in customer's wishlist
// ============================================

export const getWishlistController = async (req, res) => {
  try {
    const userId = req.userId;

    if (!validateCustomerId(userId)) {
      return res.status(403).json({
        success: false,
        message: 'A valid customer account is required to access the wishlist.',
      });
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        id,
        product_id,
        created_at,
        products (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get wishlist error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch wishlist.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Wishlist fetched successfully.',
      data: data || [],
    });
  } catch (error) {
    console.error('Get wishlist server error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist.',
    });
  }
};

// ============================================
// POST: Add a product to the wishlist
// ============================================

export const addToWishlistController = async (req, res) => {
  try {
    const userId = req.userId;
    const { product_id } = req.body || {};

    if (!validateCustomerId(userId)) {
      return res.status(403).json({
        success: false,
        message: 'A valid customer account is required to manage the wishlist.',
      });
    }

    if (
      typeof product_id !== 'string' ||
      !UUID_REGEX.test(product_id)
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid product ID is required.',
      });
    }

    // Confirm that the product exists.
    const {
      data: product,
      error: productError,
    } = await supabase
      .from('products')
      .select('id')
      .eq('id', product_id)
      .maybeSingle();

    if (productError) {
      console.error('Product lookup error:', {
        message: productError.message,
        code: productError.code,
        details: productError.details,
        hint: productError.hint,
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to verify product.',
      });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Check whether this product is already in the wishlist.
    const {
      data: existing,
      error: existingError,
    } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .maybeSingle();

    if (existingError) {
      console.error('Wishlist lookup error:', {
        message: existingError.message,
        code: existingError.code,
        details: existingError.details,
        hint: existingError.hint,
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to check wishlist.',
      });
    }

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Product is already in your wishlist.',
        data: existing,
      });
    }

    // Add the product.
    const {
      data,
      error,
    } = await supabase
      .from('wishlists')
      .insert({
        user_id: userId,
        product_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Add wishlist error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      // PostgreSQL unique-constraint violation.
      if (error.code === '23505') {
        return res.status(200).json({
          success: true,
          message: 'Product is already in your wishlist.',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to add product to wishlist.',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist.',
      data,
    });
  } catch (error) {
    console.error('Add wishlist server error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while adding to wishlist.',
    });
  }
};

// ============================================
// DELETE: Remove a product from the wishlist
// ============================================

export const removeFromWishlistController = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    if (!validateCustomerId(userId)) {
      return res.status(403).json({
        success: false,
        message: 'A valid customer account is required to manage the wishlist.',
      });
    }

    if (
      typeof productId !== 'string' ||
      !UUID_REGEX.test(productId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid product ID is required.',
      });
    }

    const {
      data,
      error,
    } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
      .select('id');

    if (error) {
      console.error('Remove wishlist error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to remove product from wishlist.',
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product was not found in your wishlist.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist.',
    });
  } catch (error) {
    console.error('Remove wishlist server error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while removing from wishlist.',
    });
  }
};

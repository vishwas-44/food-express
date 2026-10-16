
import supabase from '../config/supabase.js';

// GET: Fetch the logged-in user's wishlist
export const getWishlistController = async (req, res) => {
  try {
    const userId = req.userId;

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
      console.error('Get wishlist error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch wishlist.',
      });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Get wishlist error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist.',
    });
  }
};

// POST: Add a product to the wishlist
export const addToWishlistController = async (req, res) => {
  try {
    const userId = req.userId;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.',
      });
    }

    // Confirm that the product exists
    const { data: product, error: productError } =
      await supabase
        .from('products')
        .select('id')
        .eq('id', product_id)
        .maybeSingle();

    if (productError) {
      console.error('Product lookup error:', productError);

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

    // Prevent duplicate wishlist entries
    const { data: existing, error: existingError } =
      await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', product_id)
        .maybeSingle();

    if (existingError) {
      console.error('Wishlist lookup error:', existingError);

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

    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: userId,
        product_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Add wishlist error:', error);

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
    console.error('Add wishlist error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while adding to wishlist.',
    });
  }
};

// DELETE: Remove a product from the wishlist
export const removeFromWishlistController = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.',
      });
    }

    const { data, error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
      .select('id');

    if (error) {
      console.error('Remove wishlist error:', error);

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
    console.error('Remove wishlist error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while removing from wishlist.',
    });
  }
};

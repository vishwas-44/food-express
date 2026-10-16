import supabase from '../config/supabase.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

/*
=====================================================
  Admin Login
=====================================================
*/

export const adminLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Admin email and password are required',
        error: true,
      });
    }

    if (
      email.trim().toLowerCase() !==
      process.env.ADMIN_EMAIL?.trim().toLowerCase()
    ) {
      return res.status(401).json({
        message: 'Invalid admin credentials',
        error: true,
      });
    }

    const passwordMatch = await bcryptjs.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid admin credentials',
        error: true,
      });
    }

    const accessToken = jwt.sign(
      {
        id: 'env-admin',
        role: 'Admin',
        isAdmin: true,
      },
      process.env.JWT_SECRET_KEY_ACCESS_TOKEN,
      {
        expiresIn: '5h',
      }
    );

    const refreshToken = jwt.sign(
      {
        id: 'env-admin',
        role: 'Admin',
        isAdmin: true,
      },
      process.env.JWT_SECRET_KEY_REFRESH_TOKEN,
      {
        expiresIn: '7d',
      }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite:
        process.env.NODE_ENV === 'production'
          ? 'none'
          : 'lax',
      maxAge: 5 * 60 * 60 * 1000,
    };

    res.cookie('accessToken', accessToken, cookieOptions);

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Admin login successful',
      success: true,
      error: false,
      data: {
        email: process.env.ADMIN_EMAIL,
        role: 'Admin',
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);

    return res.status(500).json({
      message: error.message || 'Admin login failed',
      error: true,
    });
  }
};

/*
=====================================================
  Create Category
=====================================================
*/

export const createCategoryController = async (
  req,
  res
) => {
  try {
    const { name, image } = req.body;

    if (!name) {
      return res.status(400).json({
        message: 'Category name is required',
        error: true,
      });
    }

    const categoryName = name.trim();

    const {
      data: existingCategory,
      error: existingError,
    } = await supabase
      .from('categories')
      .select('id, name')
      .eq('name', categoryName)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingCategory) {
      return res.status(400).json({
        message: 'Category already exists',
        error: true,
      });
    }

    const {
      data: savedCategory,
      error: insertError,
    } = await supabase
      .from('categories')
      .insert({
        name: categoryName,
        image: image || '',
      })
      .select('*')
      .single();

    if (insertError) {
      throw insertError;
    }

    return res.status(201).json({
      message: 'Category created successfully',
      success: true,
      error: false,
      data: savedCategory,
    });
  } catch (error) {
    console.error('Create category error:', error);

    return res.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
};

/*
=====================================================
  Get All Categories
=====================================================
*/

export const getAllCategoriesController = async (
  req,
  res
) => {
  try {
    const {
      data: categories,
      error: categoriesError,
    } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'Active')
      .order('created_at', {
        ascending: true,
      });

    if (categoriesError) {
      throw categoriesError;
    }

    return res.status(200).json({
      message: 'Categories fetched successfully',
      success: true,
      error: false,
      data: categories || [],
    });
  } catch (error) {
    console.error('Get categories error:', error);

    return res.status(500).json({
      message:
        error.message ||
        'Failed to fetch categories',
      error: true,
    });
  }
};

/*
=====================================================
  Update Category
=====================================================
*/

export const updateCategoryController = async (
  req,
  res
) => {
  try {
    const { categoryId } = req.params;
    const { name, image } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        message: 'Category ID is required',
        error: true,
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Category name is required',
        error: true,
      });
    }

    const categoryName = name.trim();

    // Check whether the category exists.
    const {
      data: existingCategory,
      error: findError,
    } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', categoryId)
      .eq('status', 'Active')
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!existingCategory) {
      return res.status(404).json({
        message: 'Category not found',
        error: true,
      });
    }

    // Check for duplicate category names.
    const {
      data: duplicateCategory,
      error: duplicateError,
    } = await supabase
      .from('categories')
      .select('id, name')
      .eq('name', categoryName)
      .neq('id', categoryId)
      .maybeSingle();

    if (duplicateError) {
      throw duplicateError;
    }

    if (duplicateCategory) {
      return res.status(400).json({
        message:
          'Another category with this name already exists',
        error: true,
      });
    }

    // Update category.
    const {
      data: updatedCategory,
      error: updateError,
    } = await supabase
      .from('categories')
      .update({
        name: categoryName,
        image: image || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', categoryId)
      .select('*')
      .single();

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({
      message: 'Category updated successfully',
      success: true,
      error: false,
      data: updatedCategory,
    });
  } catch (error) {
    console.error('Update category error:', error);

    return res.status(500).json({
      message:
        error.message ||
        'Failed to update category',
      error: true,
    });
  }
};

/*
=====================================================
  Delete Category
=====================================================
*/

export const deleteCategoryController = async (
  req,
  res
) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({
        message: 'Category ID is required',
        error: true,
      });
    }

    // Check whether the category exists.
    const {
      data: existingCategory,
      error: findError,
    } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', categoryId)
      .eq('status', 'Active')
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!existingCategory) {
      return res.status(404).json({
        message: 'Category not found',
        error: true,
      });
    }

    // Soft delete: mark the category as Inactive.
    const {
      data: deletedCategory,
      error: deleteError,
    } = await supabase
      .from('categories')
      .update({
        status: 'Inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', categoryId)
      .select('*')
      .single();

    if (deleteError) {
      throw deleteError;
    }

    return res.status(200).json({
      message: 'Category deleted successfully',
      success: true,
      error: false,
      data: deletedCategory,
    });
  } catch (error) {
    console.error('Delete category error:', error);

    return res.status(500).json({
      message:
        error.message ||
        'Failed to delete category',
      error: true,
    });
  }
};

/*
=====================================================
  Create Product
=====================================================
*/

export const createProductController = async (
  req,
  res
) => {
  try {
    const {
      title,
      category,
      price,
      rating,
      description,
      image,
    } = req.body;

    if (
      !title ||
      !category ||
      price === undefined ||
      !description
    ) {
      return res.status(400).json({
        message:
          'Please provide all required product fields',
        error: true,
      });
    }

    const {
      data: savedProduct,
      error: insertError,
    } = await supabase
      .from('products')
      .insert({
        title: title.trim(),
        category: category.trim(),
        price: Number(price),
        rating:
          rating !== undefined && rating !== ''
            ? Number(rating)
            : 4.8,
        description: description.trim(),
        image: image || '',
      })
      .select('*')
      .single();

    if (insertError) {
      throw insertError;
    }

    return res.status(201).json({
      message: 'Product created successfully',
      success: true,
      error: false,
      data: savedProduct,
    });
  } catch (error) {
    console.error('Create product error:', error);

    return res.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
};

/*
=====================================================
  Get All Products
=====================================================
*/

export const getAllProductsController = async (
  req,
  res
) => {
  try {
    const {
      data: products,
      error: productsError,
    } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'Active')
      .order('created_at', {
        ascending: false,
      });

    if (productsError) {
      throw productsError;
    }

    return res.status(200).json({
      message: 'Products fetched successfully',
      success: true,
      error: false,
      data: products || [],
    });
  } catch (error) {
    console.error('Get products error:', error);

    return res.status(500).json({
      message:
        error.message ||
        'Failed to fetch products',
      error: true,
    });
  }
};

/*
=====================================================
  Update Product
=====================================================
*/

export const updateProductController = async (
  req,
  res
) => {
  try {
    const { productId } = req.params;

    const {
      title,
      category,
      price,
      rating,
      description,
      image,
    } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: 'Product ID is required',
        error: true,
      });
    }

    if (
      !title ||
      !category ||
      price === undefined ||
      !description
    ) {
      return res.status(400).json({
        message:
          'Please provide all required product fields',
        error: true,
      });
    }

    const {
      data: existingProduct,
      error: findError,
    } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .eq('status', 'Active')
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!existingProduct) {
      return res.status(404).json({
        message: 'Product not found',
        error: true,
      });
    }

    const {
      data: updatedProduct,
      error: updateError,
    } = await supabase
      .from('products')
      .update({
        title: title.trim(),
        category: category.trim(),
        price: Number(price),
        rating:
          rating !== undefined && rating !== ''
            ? Number(rating)
            : 4.8,
        description: description.trim(),
        image: image || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select('*')
      .single();

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({
      message: 'Product updated successfully',
      success: true,
      error: false,
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Update product error:', error);

    return res.status(500).json({
      message:
        error.message ||
        'Failed to update product',
      error: true,
    });
  }
};

/*
=====================================================
  Delete Product
=====================================================
*/

export const deleteProductController = async (
  req,
  res
) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        message: 'Product ID is required',
        error: true,
      });
    }

    const {
      data: existingProduct,
      error: findError,
    } = await supabase
      .from('products')
      .select('id, title')
      .eq('id', productId)
      .eq('status', 'Active')
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!existingProduct) {
      return res.status(404).json({
        message: 'Product not found',
        error: true,
      });
    }

    // Soft delete: mark the product as Inactive.
    const {
      data: deletedProduct,
      error: deleteError,
    } = await supabase
      .from('products')
      .update({
        status: 'Inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select('*')
      .single();

    if (deleteError) {
      throw deleteError;
    }

    return res.status(200).json({
      message: 'Product deleted successfully',
      success: true,
      error: false,
      data: deletedProduct,
    });
  } catch (error) {
    console.error('Delete product error:', error);

    return res.status(500).json({
      message:
        error.message ||
        'Failed to delete product',
      error: true,
    });
  }
};

/*
=====================================================
  Get All Orders
=====================================================
*/

export const getAllOrdersController = async (req, res) => {
  try {
    const {
      data: orders,
      error: ordersError,
    } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', {
        ascending: false,
      });

    if (ordersError) {
      throw ordersError;
    }

    // Add customer details and order status history.
    const ordersWithDetails = await Promise.all(
      (orders || []).map(async (order) => {
        const {
          data: user,
          error: userError,
        } = await supabase
          .from('users')
          .select('id, name, email, mobile')
          .eq('id', order.user_id)
          .maybeSingle();

        if (userError) {
          console.error(
            'Get order user error:',
            userError
          );
        }

        const {
          data: statusHistory,
          error: historyError,
        } = await supabase
          .from('order_status_history')
          .select('id, order_id, status, created_at')
          .eq('order_id', order.id)
          .order('created_at', {
            ascending: true,
          });

        if (historyError) {
          console.error(
            'Get order status history error:',
            historyError
          );
        }

        return {
          ...order,
          user: user || null,
          status_history: statusHistory || [],
        };
      })
    );

    return res.status(200).json({
      message: 'All orders fetched successfully',
      success: true,
      error: false,
      data: ordersWithDetails,
    });
  } catch (error) {
    console.error('Get all orders error:', error);

    return res.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
};

/*
=====================================================
  Update Order Status
=====================================================
*/

/*
=====================================================
  Update Order Status
=====================================================
*/

export const updateOrderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { order_status } = req.body;

    if (!orderId) {
      return res.status(400).json({
        message: 'Order ID is required',
        error: true,
      });
    }

    if (!order_status) {
      return res.status(400).json({
        message: 'Order status is required',
        error: true,
      });
    }

    const allowedStatuses = [
      'Processing',
      'Confirmed',
      'Preparing',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!allowedStatuses.includes(order_status)) {
      return res.status(400).json({
        message: 'Invalid order status',
        error: true,
      });
    }

    // Get the existing order and customer ID.
    const {
      data: existingOrder,
      error: findError,
    } = await supabase
      .from('orders')
      .select('id, user_id, order_status')
      .eq('id', orderId)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!existingOrder) {
      return res.status(404).json({
        message: 'Order not found',
        error: true,
      });
    }

    // Prevent changes after delivery.
    if (existingOrder.order_status === 'Delivered') {
      return res.status(400).json({
        message: 'Delivered orders cannot be changed.',
        error: true,
      });
    }

    // Prevent changes after cancellation.
    if (existingOrder.order_status === 'Cancelled') {
      return res.status(400).json({
        message: 'Cancelled orders cannot be changed.',
        error: true,
      });
    }

    // Prevent duplicate status updates.
    if (existingOrder.order_status === order_status) {
      return res.status(400).json({
        message: 'Order is already in this status.',
        error: true,
      });
    }

    // Update the order status.
    const {
      data: updatedOrder,
      error: updateError,
    } = await supabase
      .from('orders')
      .update({
        order_status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select('*')
      .single();

    if (updateError) {
      throw updateError;
    }

    // Save the status change in order history.
    const {
      error: historyError,
    } = await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status: order_status,
      });

    if (historyError) {
      console.error(
        'Order status history error:',
        historyError
      );
    }

    // Notification messages for each order status.
    const statusMessages = {
      Confirmed: {
        title: 'Order Confirmed',
        message:
          'Your order has been confirmed and is being prepared.',
      },

      Preparing: {
        title: 'Order Being Prepared',
        message:
          'Our kitchen is preparing your order with care.',
      },

      'Out for Delivery': {
        title: 'Out for Delivery',
        message:
          'Your order is on its way! Please be ready to receive it.',
      },

      Delivered: {
        title: 'Order Delivered',
        message:
          'Your order has been delivered successfully. Enjoy your meal!',
      },

      Cancelled: {
        title: 'Order Cancelled',
        message:
          'Your order has been cancelled.',
      },
    };

    const notificationContent =
      statusMessages[updatedOrder.order_status] || {
        title: 'Order Status Updated',
        message: `Your order status has changed to ${updatedOrder.order_status}.`,
      };

    // Create a customer notification.
    // Notification failure must not undo the order update.
    const {
      error: notificationError,
    } = await supabase
      .from('notifications')
      .insert({
        recipient_type: 'customer',
        user_id: existingOrder.user_id,
        order_id: updatedOrder.id,
        title: notificationContent.title,
        message: notificationContent.message,
        is_read: false,
      });

    if (notificationError) {
      console.error(
        'Customer notification creation error:',
        notificationError
      );
    }

    return res.status(200).json({
      message: 'Order status updated successfully',
      success: true,
      error: false,
      data: updatedOrder,
    });
  } catch (error) {
    console.error(
      'Update order status error:',
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        'Failed to update order status',
      error: true,
    });
  }
};
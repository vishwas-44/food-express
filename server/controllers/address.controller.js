import supabase from '../config/supabase.js';

// Get all addresses of logged-in user
export const getAddressesController = async (
  req,
  res
) => {
  try {
    const userId = req.userId;

    const {
      data: addresses,
      error,
    } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', {
        ascending: false,
      })
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      message: 'Addresses fetched successfully',
      success: true,
      error: false,
      data: addresses || [],
    });
  } catch (error) {
    console.error(
      'Get addresses error:',
      error
    );

    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};


// Add new address
export const addAddressController = async (
  req,
  res
) => {
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
      is_default,
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
        message:
          'Please fill all required address fields.',
        success: false,
        error: true,
      });
    }

    // If this address is set as default,
    // remove default from existing addresses
    if (is_default === true) {
      const {
        error: resetError,
      } = await supabase
        .from('addresses')
        .update({
          is_default: false,
        })
        .eq('user_id', userId);

      if (resetError) {
        throw resetError;
      }
    }

    const {
      data: address,
      error,
    } = await supabase
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
        address_type:
          address_type || 'Home',
        is_default:
          is_default === true,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      message: 'Address added successfully',
      success: true,
      error: false,
      data: address,
    });
  } catch (error) {
    console.error(
      'Add address error:',
      error
    );

    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};


// Update address
export const updateAddressController = async (
  req,
  res
) => {
  try {
    const userId = req.userId;
    const { addressId } = req.params;

    const {
      address_line1,
      city,
      state,
      pincode,
      country,
      mobile,
      landmark,
      address_type,
      is_default,
    } = req.body;

    // Check that the address belongs to
    // the logged-in user
    const {
      data: existingAddress,
      error: findError,
    } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .eq('user_id', userId)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!existingAddress) {
      return res.status(404).json({
        message: 'Address not found.',
        success: false,
        error: true,
      });
    }

    // If setting this address as default,
    // remove default from other addresses
    if (is_default === true) {
      const {
        error: resetError,
      } = await supabase
        .from('addresses')
        .update({
          is_default: false,
        })
        .eq('user_id', userId)
        .neq('id', addressId);

      if (resetError) {
        throw resetError;
      }
    }

    const updateData = {
      address_line1,
      city,
      state,
      pincode,
      country,
      mobile,
      landmark:
        landmark || null,
      address_type:
        address_type || 'Home',
      is_default:
        is_default === true,
      updated_at:
        new Date().toISOString(),
    };

    const {
      data: updatedAddress,
      error: updateError,
    } = await supabase
      .from('addresses')
      .update(updateData)
      .eq('id', addressId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({
      message:
        'Address updated successfully',
      success: true,
      error: false,
      data: updatedAddress,
    });
  } catch (error) {
    console.error(
      'Update address error:',
      error
    );

    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};


// Delete address
export const deleteAddressController = async (
  req,
  res
) => {
  try {
    const userId = req.userId;
    const { addressId } = req.params;

    const {
      data: existingAddress,
      error: findError,
    } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', addressId)
      .eq('user_id', userId)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!existingAddress) {
      return res.status(404).json({
        message: 'Address not found.',
        success: false,
        error: true,
      });
    }

    const {
      error: deleteError,
    } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', userId);

    if (deleteError) {
      throw deleteError;
    }

    return res.status(200).json({
      message:
        'Address deleted successfully',
      success: true,
      error: false,
    });
  } catch (error) {
    console.error(
      'Delete address error:',
      error
    );

    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};


// Set address as default
export const setDefaultAddressController = async (
  req,
  res
) => {
  try {
    const userId = req.userId;
    const { addressId } = req.params;

    // Check address ownership
    const {
      data: address,
      error: findError,
    } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', addressId)
      .eq('user_id', userId)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!address) {
      return res.status(404).json({
        message: 'Address not found.',
        success: false,
        error: true,
      });
    }

    // Remove default from all user's addresses
    const {
      error: resetError,
    } = await supabase
      .from('addresses')
      .update({
        is_default: false,
      })
      .eq('user_id', userId);

    if (resetError) {
      throw resetError;
    }

    // Set selected address as default
    const {
      data: updatedAddress,
      error: updateError,
    } = await supabase
      .from('addresses')
      .update({
        is_default: true,
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', addressId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({
      message:
        'Default address updated successfully',
      success: true,
      error: false,
      data: updatedAddress,
    });
  } catch (error) {
    console.error(
      'Set default address error:',
      error
    );

    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};
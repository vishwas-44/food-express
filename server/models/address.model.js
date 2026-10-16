import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    address_line1: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    mobile: {
      type: Number,
      required: true,
    },

    status: {
      type: Boolean,
      default: true,
    },

    selected: {
      type: Boolean,
      default: false,
    },

    landmark: {
      type: String,
      default: '',
    },

    address_type: {
      type: String,
      default: 'Home',
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

const AddressModel =
  mongoose.models.Address || mongoose.model('Address', addressSchema);

export default AddressModel;
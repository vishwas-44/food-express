import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    products: [
      {
        product_id: {
          type: String,
          required: true,
        },

        product_title: {
          type: String,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        image: {
          type: String,
          required: true,
        },

        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],

    payment_id: {
      type: String,
      default: '',
    },

    payment_status: {
      type: String,
      default: 'Pending',
    },

    order_status: {
      type: String,
      default: 'Processing',
    },

    delivery_address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
    },

    total_amount: {
      type: Number,
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

const OrderModel =
  mongoose.models.Order || mongoose.model('Order', orderSchema);

export default OrderModel;
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Provide product title'],
      trim: true,
    },

    category: {
      type: String,
      required: [true, 'Provide product category'],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, 'Provide product price'],
    },

    rating: {
      type: Number,
      default: 4.8,
    },

    description: {
      type: String,
      required: [true, 'Provide product description'],
      trim: true,
    },

    image: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const ProductModel =
  mongoose.models.Product ||
  mongoose.model('Product', productSchema);

export default ProductModel;
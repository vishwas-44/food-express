import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Provide category name'],
      unique: true,
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

const CategoryModel =
  mongoose.models.Category ||
  mongoose.model('Category', categorySchema);

export default CategoryModel;
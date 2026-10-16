import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Provide name [4]'],
    },

    email: {
      type: String,
      required: [true, 'Provide email [4]'],
      unique: true,
    },

    password: {
      type: String,
      required: [true, 'Provide password [12]'],
    },

    avatar: {
      type: String,
      default: '',
    },

    mobile: {
      type: Number,
      default: null,
    },

    verifyEmail: {
      type: Boolean,
      default: false,
    },

    access_token: {
      type: String,
      default: '',
    },

    refresh_token: {
      type: String,
      default: '',
    },

    last_login_date: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },

    address_details: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
      },
    ],

    order_history: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],

    otp: {
      type: String,
      default: null,
    },

    otp_expire: {
      type: Date,
      default: null,
    },

    role: {
      type: String,
      enum: ['Admin', 'User'],
      default: 'User',
    },

    signup_with_google: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

const UserModel =
  mongoose.models.User || mongoose.model('User', userSchema);

export default UserModel;
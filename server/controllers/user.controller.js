import supabase from '../config/supabase.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

/*
 * =====================================================
 * REGISTER USER & SEND EMAIL OTP
 * =====================================================
 */

export const registerUserController = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          'Provide name, email, and password',
        error: true,
      });
    }

    const {
      data: existingUser,
      error: existingUserError,
    } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (existingUserError) {
      throw existingUserError;
    }

    if (existingUser) {
      return res.status(400).json({
        message:
          'Email already registered',
        error: true,
      });
    }

    const salt =
      await bcryptjs.genSalt(10);

    const hashedPassword =
      await bcryptjs.hash(
        password,
        salt
      );

    const otp = Math.floor(
      100000 +
        Math.random() * 900000
    ).toString();

    const otp_expire =
      new Date(
        Date.now() +
          10 * 60 * 1000
      ).toISOString();

    const {
      data: newUser,
      error: insertError,
    } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword,
        otp,
        otp_expire,
        verify_email: false,
      })
      .select('id, email')
      .single();

    if (insertError) {
      throw insertError;
    }

    const emailHtml = `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
        "
      >
        <h2 style="color: #ff5722;">
          Welcome to Food Express, ${name}!
        </h2>

        <p>
          Thank you for signing up.
          Please use the following 6-digit OTP
          to verify your email address:
        </p>

        <h1
          style="
            display: inline-block;
            padding: 12px 25px;
            background: #ff5722;
            color: white;
            border-radius: 8px;
            letter-spacing: 5px;
          "
        >
          ${otp}
        </h1>

        <p>
          This code is valid for 10 minutes.
        </p>
      </div>
    `;

    await sendEmail({
      sendTo: email,
      subject:
        'Verify your email - Food Express',
      html: emailHtml,
    });

    return res.status(201).json({
      message:
        'User registered successfully. Verification OTP sent to email.',
      error: false,
      success: true,
      data: {
        userId: newUser.id,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(
      'Register error:',
      error
    );

    return res.status(500).json({
      message:
        error.message || error,
      error: true,
    });
  }
};

/*
 * =====================================================
 * VERIFY EMAIL OTP
 * =====================================================
 */

export const verifyEmailController = async (
  req,
  res
) => {
  try {
    const {
      email,
      otp,
    } = req.body;

    const {
      data: user,
      error: userError,
    } = await supabase
      .from('users')
      .select(
        'id, email, otp, otp_expire, verify_email'
      )
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return res.status(400).json({
        message:
          'User not found',
        error: true,
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message:
          'Invalid OTP code',
        error: true,
      });
    }

    if (
      !user.otp_expire ||
      new Date(
        user.otp_expire
      ) < new Date()
    ) {
      return res.status(400).json({
        message:
          'OTP has expired. Please request a new one.',
        error: true,
      });
    }

    const {
      error: updateError,
    } = await supabase
      .from('users')
      .update({
        verify_email: true,
        otp: null,
        otp_expire: null,
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return res.json({
      message:
        'Email verified successfully!',
      success: true,
      error: false,
    });
  } catch (error) {
    console.error(
      'Verify email error:',
      error
    );

    return res.status(500).json({
      message:
        error.message || error,
      error: true,
    });
  }
};

/*
 * =====================================================
 * LOGIN USER
 * =====================================================
 */

export const loginController = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          'Email and password are required',
        error: true,
      });
    }

    /*
     * =================================================
     * ADMIN LOGIN
     * =================================================
     */

    const isAdminEmail =
      email
        .trim()
        .toLowerCase() ===
      process.env.ADMIN_EMAIL
        ?.trim()
        .toLowerCase();

    if (isAdminEmail) {
      const adminPasswordMatch =
        await bcryptjs.compare(
          password,
          process.env
            .ADMIN_PASSWORD_HASH
        );

      if (!adminPasswordMatch) {
        return res.status(400).json({
          message:
            'Invalid credentials',
          error: true,
        });
      }

      const accessToken =
        jwt.sign(
          {
            id: 'env-admin',
            role: 'Admin',
            isAdmin: true,
          },
          process.env
            .JWT_SECRET_KEY_ACCESS_TOKEN,
          {
            expiresIn: '5h',
          }
        );

      const refreshToken =
        jwt.sign(
          {
            id: 'env-admin',
            role: 'Admin',
            isAdmin: true,
          },
          process.env
            .JWT_SECRET_KEY_REFRESH_TOKEN,
          {
            expiresIn: '7d',
          }
        );

      const cookieOptions = {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          'production',
        sameSite:
          process.env.NODE_ENV ===
          'production'
            ? 'none'
            : 'lax',
        maxAge:
          5 * 60 * 60 * 1000,
      };

      res.cookie(
        'accessToken',
        accessToken,
        cookieOptions
      );

      res.cookie(
        'refreshToken',
        refreshToken,
        {
          ...cookieOptions,
          maxAge:
            7 *
            24 *
            60 *
            60 *
            1000,
        }
      );

      return res.json({
        message:
          'Login successful!',
        success: true,
        error: false,
        data: {
          name: 'Administrator',
          email:
            process.env.ADMIN_EMAIL,
          role: 'Admin',
          isAdmin: true,
        },
      });
    }

    /*
     * =================================================
     * NORMAL USER LOGIN
     * =================================================
     */

    const {
      data: user,
      error: userError,
    } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return res.status(400).json({
        message:
          'Invalid credentials',
        error: true,
      });
    }

    if (!user.verify_email) {
      return res.status(400).json({
        message:
          'Please verify your email before logging in.',
        error: true,
      });
    }

    const checkPassword =
      await bcryptjs.compare(
        password,
        user.password
      );

    if (!checkPassword) {
      return res.status(400).json({
        message:
          'Invalid credentials',
        error: true,
      });
    }

    const accessToken =
      jwt.sign(
        {
          id: user.id,
          role: user.role,
        },
        process.env
          .JWT_SECRET_KEY_ACCESS_TOKEN,
        {
          expiresIn: '5h',
        }
      );

    const refreshToken =
      jwt.sign(
        {
          id: user.id,
        },
        process.env
          .JWT_SECRET_KEY_REFRESH_TOKEN,
        {
          expiresIn: '7d',
        }
      );

    const {
      error: updateError,
    } = await supabase
      .from('users')
      .update({
        access_token: accessToken,
        refresh_token: refreshToken,
        last_login_date:
          new Date().toISOString(),
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    const cookieOptions = {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        'production',
      sameSite:
        process.env.NODE_ENV ===
        'production'
          ? 'none'
          : 'lax',
      maxAge:
        5 * 60 * 60 * 1000,
    };

    res.cookie(
      'accessToken',
      accessToken,
      cookieOptions
    );

    res.cookie(
      'refreshToken',
      refreshToken,
      {
        ...cookieOptions,
        maxAge:
          7 *
          24 *
          60 *
          60 *
          1000,
      }
    );

    return res.json({
      message:
        'Login successful!',
      success: true,
      error: false,
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      'Login error:',
      error
    );

    return res.status(500).json({
      message:
        error.message || error,
      error: true,
    });
  }
};

/*
 * =====================================================
 * FORGOT PASSWORD - SEND OTP
 * =====================================================
 */

export const forgotPasswordController =
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message:
            'Email is required',
          error: true,
        });
      }

      const {
        data: user,
        error: userError,
      } = await supabase
        .from('users')
        .select(
          'id, name, email, verify_email'
        )
        .eq('email', email)
        .maybeSingle();

      if (userError) {
        throw userError;
      }

      if (!user) {
        return res.status(404).json({
          message:
            'No account found with this email address.',
          error: true,
        });
      }

      if (!user.verify_email) {
        return res.status(400).json({
          message:
            'Please verify your email address first.',
          error: true,
        });
      }

      const resetOtp =
        Math.floor(
          100000 +
            Math.random() *
              900000
        ).toString();

      const resetOtpExpire =
        new Date(
          Date.now() +
            10 * 60 * 1000
        ).toISOString();

      const {
        error: updateError,
      } = await supabase
        .from('users')
        .update({
          reset_otp: resetOtp,
          reset_otp_expire:
            resetOtpExpire,
          updated_at:
            new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      const emailHtml = `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            border: 1px solid #e5e5e5;
            border-radius: 12px;
          "
        >
          <h2
            style="
              color: #ff5722;
            "
          >
            Food Express
          </h2>

          <h3>
            Password Reset Request
          </h3>

          <p>
            Hello ${user.name || 'Customer'},
          </p>

          <p>
            We received a request to reset
            your Food Express password.
            Use the following 6-digit OTP:
          </p>

          <h1
            style="
              display: inline-block;
              padding: 12px 25px;
              background: #ff5722;
              color: white;
              border-radius: 8px;
              letter-spacing: 5px;
            "
          >
            ${resetOtp}
          </h1>

          <p>
            This OTP is valid for 10 minutes.
          </p>

          <p>
            If you did not request a password
            reset, you can safely ignore this email.
          </p>
        </div>
      `;

      await sendEmail({
        sendTo: email,
        subject:
          'Password Reset OTP - Food Express',
        html: emailHtml,
      });

      return res.json({
        message:
          'Password reset OTP sent to your email.',
        success: true,
        error: false,
      });
    } catch (error) {
      console.error(
        'Forgot password error:',
        error
      );

      return res.status(500).json({
        message:
          error.message || error,
        error: true,
      });
    }
  };

/*
 * =====================================================
 * VERIFY PASSWORD RESET OTP
 * =====================================================
 */

export const verifyResetOtpController =
  async (req, res) => {
    try {
      const {
        email,
        otp,
      } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          message:
            'Email and OTP are required',
          error: true,
        });
      }

      const {
        data: user,
        error: userError,
      } = await supabase
        .from('users')
        .select(
          'id, reset_otp, reset_otp_expire'
        )
        .eq('email', email)
        .maybeSingle();

      if (userError) {
        throw userError;
      }

      if (!user) {
        return res.status(400).json({
          message:
            'User not found',
          error: true,
        });
      }

      if (
        !user.reset_otp ||
        user.reset_otp !== otp
      ) {
        return res.status(400).json({
          message:
            'Invalid OTP code',
          error: true,
        });
      }

      if (
        !user.reset_otp_expire ||
        new Date(
          user.reset_otp_expire
        ) < new Date()
      ) {
        return res.status(400).json({
          message:
            'OTP has expired. Please request a new one.',
          error: true,
        });
      }

      return res.json({
        message:
          'OTP verified successfully.',
        success: true,
        error: false,
      });
    } catch (error) {
      console.error(
        'Verify reset OTP error:',
        error
      );

      return res.status(500).json({
        message:
          error.message || error,
        error: true,
      });
    }
  };

/*
 * =====================================================
 * RESET PASSWORD
 * =====================================================
 */

export const resetPasswordController =
  async (req, res) => {
    try {
      const {
        email,
        otp,
        newPassword,
      } = req.body;

      if (
        !email ||
        !otp ||
        !newPassword
      ) {
        return res.status(400).json({
          message:
            'Email, OTP and new password are required',
          error: true,
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message:
            'Password must be at least 6 characters long.',
          error: true,
        });
      }

      const {
        data: user,
        error: userError,
      } = await supabase
        .from('users')
        .select(
          'id, reset_otp, reset_otp_expire'
        )
        .eq('email', email)
        .maybeSingle();

      if (userError) {
        throw userError;
      }

      if (!user) {
        return res.status(400).json({
          message:
            'User not found',
          error: true,
        });
      }

      if (
        !user.reset_otp ||
        user.reset_otp !== otp
      ) {
        return res.status(400).json({
          message:
            'Invalid OTP code',
          error: true,
        });
      }

      if (
        !user.reset_otp_expire ||
        new Date(
          user.reset_otp_expire
        ) < new Date()
      ) {
        return res.status(400).json({
          message:
            'OTP has expired. Please request a new one.',
          error: true,
        });
      }

      const salt =
        await bcryptjs.genSalt(10);

      const hashedPassword =
        await bcryptjs.hash(
          newPassword,
          salt
        );

      const {
        error: updateError,
      } = await supabase
        .from('users')
        .update({
          password:
            hashedPassword,
          reset_otp: null,
          reset_otp_expire: null,
          access_token: null,
          refresh_token: null,
          updated_at:
            new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      return res.json({
        message:
          'Password reset successfully. Please login with your new password.',
        success: true,
        error: false,
      });
    } catch (error) {
      console.error(
        'Reset password error:',
        error
      );

      return res.status(500).json({
        message:
          error.message || error,
        error: true,
      });
    }
  };

/*
 * =====================================================
 * CHANGE PASSWORD - LOGGED IN USER
 * =====================================================
 */

export const changePasswordController =
  async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword,
      } = req.body;

      if (
        !currentPassword ||
        !newPassword
      ) {
        return res.status(400).json({
          message:
            'Current password and new password are required.',
          error: true,
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message:
            'New password must be at least 6 characters long.',
          error: true,
        });
      }

      const userId =
        req.userId;

      if (!userId) {
        return res.status(401).json({
          message:
            'Authentication required.',
          error: true,
        });
      }

      const {
        data: user,
        error: userError,
      } = await supabase
        .from('users')
        .select(
          'id, password'
        )
        .eq('id', userId)
        .maybeSingle();

      if (userError) {
        throw userError;
      }

      if (!user) {
        return res.status(404).json({
          message:
            'User not found.',
          error: true,
        });
      }

      const passwordMatch =
        await bcryptjs.compare(
          currentPassword,
          user.password
        );

      if (!passwordMatch) {
        return res.status(400).json({
          message:
            'Current password is incorrect.',
          error: true,
        });
      }

      const salt =
        await bcryptjs.genSalt(10);

      const hashedPassword =
        await bcryptjs.hash(
          newPassword,
          salt
        );

      const {
        error: updateError,
      } = await supabase
        .from('users')
        .update({
          password:
            hashedPassword,
          updated_at:
            new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      return res.json({
        message:
          'Password changed successfully.',
        success: true,
        error: false,
      });
    } catch (error) {
      console.error(
        'Change password error:',
        error
      );

      return res.status(500).json({
        message:
          error.message || error,
        error: true,
      });
    }
  };

/*
 * =====================================================
 * LOGOUT
 * =====================================================
 */

export const logoutController = async (
  req,
  res
) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        'production',
      sameSite:
        process.env.NODE_ENV ===
        'production'
          ? 'none'
          : 'lax',
    };

    res.clearCookie(
      'accessToken',
      cookieOptions
    );

    res.clearCookie(
      'refreshToken',
      cookieOptions
    );

    return res.json({
      message:
        'Logout successful',
      success: true,
      error: false,
    });
  } catch (error) {
    console.error(
      'Logout error:',
      error
    );

    return res.status(500).json({
      message:
        error.message || error,
      error: true,
    });
  }
};
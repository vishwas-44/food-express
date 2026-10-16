import nodemailer from 'nodemailer';

const sendEmail = async ({ sendTo, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Food Express" <${process.env.EMAIL_USER}>`,
      to: sendTo,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error(error.message);
  }
};

export default sendEmail;
// ANCHOR -- Require Modules --
const nodemailer = require('nodemailer');

// SECTION == Functions ==

// ANCHOR -- Send Email --
const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail 'less secure app' option to use nodemailer with gmail
  });
  // 2) Define the email Options
  const mailOptions = {
    from: 'Jake Nichols <admin@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3) actually send the email
  await transporter.sendMail(mailOptions);
};

// SECTION == Export ==
module.exports = sendEmail;

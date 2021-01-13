// ANCHOR -- Require Modules --
const nodemailer = require('nodemailer');

// new Email(user, url).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Jake Nichols <${process.env.EMAIL_FROM}>`,
  }

  createTransport() {
    if(process.env.NODE_ENV === 'production') {
      // Sendgrid
      return 1;
    }

    return transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  send(template, subject) {
    // send the actual email
  }
};

// SECTION == Functions ==

// ANCHOR -- Send Email --
const sendEmail = async (options) => {
  // 1) Create a transporter
  // const transporter = nodemailer.createTransport({
  //   host: process.env.EMAIL_HOST,
  //   port: process.env.EMAIL_PORT,
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  //   // Activate in gmail 'less secure app' option to use nodemailer with gmail
  // });
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

// !SECTION

// ANCHOR -- Export --
// module.exports = sendEmail;

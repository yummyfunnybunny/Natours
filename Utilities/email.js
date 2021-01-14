// ANCHOR -- Require Modules --
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

// ANCHOR -- Create Email Class --
module.exports = class Email {
  // 1) Create the Constructor
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Jake Nichols <${process.env.EMAIL_FROM}>`;
  }
  // 2) Prototype Methods

  // ANCHOR -- Create Transporter --
  // create different transports for different environments
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Production Mode Use SendGrid:
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    // Development Mode: Use MailTrap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // ANCHOR -- Send Email --
  async send(template, subject) {
    // A) render HTML based on the chosen pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject: subject,
      }
    );

    // B) Define email options
    const mailOptions = {
      // from: this.from,
      from: process.env.SENDGRID_EMAIL_FROM,
      to: this.to,
      subject: subject,
      html: html,
      text: htmlToText.fromString(html),
    };

    // C) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  // ANCHOR -- Welcome Email --
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASS must be set in the environment.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

app.post('/sendReminder', async (req, res) => {
  const { email, subject, message } = req.body;

  if (!email || !subject || !message) {
    return res.status(400).json({ error: 'The request body must include email, subject, and message.' });
  }

  if (typeof email !== 'string' || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'The email address is invalid.' });
  }

  if (typeof subject !== 'string' || subject.trim().length === 0) {
    return res.status(400).json({ error: 'The subject must be a non-empty string.' });
  }

  if (typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'The message must be a non-empty string.' });
  }

  try {
    const transporter = getTransporter();
    const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

    const info = await transporter.sendMail({
      from,
      to: email,
      subject,
      text: message,
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: error.message || 'Unable to send email reminder.' });
  }
});

app.listen(port, () => {
  console.log(`Notification backend running on http://localhost:${port}`);
});

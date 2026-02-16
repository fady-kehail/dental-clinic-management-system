require('dotenv').config();
const nodemailer = require('nodemailer');

async function debugAuth() {
  console.log('--- SMTP DEBUGGER ---');
  
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;

  console.log(`Host: ${host}`);
  console.log(`Port: ${port}`);
  console.log(`User: ${user ? user : 'MISSING'}`);
  
  if (!pass) {
    console.log('Password: MISSING');
  } else {
    console.log(`Password Length: ${pass.length}`);
    const hasSpaces = /\s/.test(pass);
    console.log(`Password Has Spaces: ${hasSpaces ? 'YES (This is likely the issue)' : 'NO'}`);
    
    if (hasSpaces) {
      console.log('SUGGESTION: Remove spaces from SMTP_PASS in .env');
    }
  }

  console.log('\nAttempting Transporter Verification...');
  
  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: user,
      pass: pass?.trim(), // Try trimming to see if it fixes it
    },
  });

  try {
    await transporter.verify();
    console.log('✅ Connection Successful! (Using trimmed password)');
  } catch (error) {
    console.error('❌ Connection Failed:', error.message);
    if (error.response) {
      console.error('Server Response:', error.response);
    }
  }
}

debugAuth();

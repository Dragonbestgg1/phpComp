// pages/api/setCookie.js
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default function handler(req, res) {
  // Extract data from query parameters or request body if needed
  const { user_id, token } = req.query;

  const data = {
    userId: user_id,
    token: token,
  };

  console.log('Data to be set in cookie:', data);

  // Serialize the cookie value
  const cookieValue = serialize('userData', JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 4, 
    path: '/',
    sameSite: 'lax',
  });  

  // Set the cookie header
  res.setHeader('Set-Cookie', cookieValue);

  // Redirect to the homepage or another page
  res.writeHead(302, { Location: '/' });
  res.end();
}

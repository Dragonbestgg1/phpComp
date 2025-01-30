import cookie from 'cookie';

export default async function handler(req, res) {
  const { query } = req;

  const data = {
    userId: query.user_id,
    token: query.token,
  };

  console.log('Data to be set in cookie:', data);

  res.setHeader('Set-Cookie', cookie.serialize('test', 'hello', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    maxAge: 14400,
    path: '/',
  }));

  res.setHeader('Set-Cookie', cookieValue);

  // Redirect to the homepage
  res.writeHead(302, { Location: '/' });
  res.end();
}
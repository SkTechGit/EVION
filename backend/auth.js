res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV !== 'development', // true on Render, false locally
  sameSite: process.env.NODE_ENV !== 'development' ? 'None' : 'Lax',
});
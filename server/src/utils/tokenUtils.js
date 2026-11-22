import jwt from 'jsonwebtoken';

/**
 * Generate a cryptographically signed JSON Web Token
 * @param {Object} payload - { id, email, role }
 * @returns {string} Signed JWT
 */
export const signToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    }
  );
};

/**
 * Configure standard HttpOnly cookie options for JWT transmission
 * @returns {Object} Cookie options
 */
export const getCookieOptions = () => {
  const days = Number(process.env.JWT_COOKIE_EXPIRES_IN_DAYS) || 1;
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: days * 24 * 60 * 60 * 1000, // in milliseconds
  };
};

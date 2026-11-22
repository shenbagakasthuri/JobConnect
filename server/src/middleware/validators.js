import { body, validationResult } from 'express-validator';

/**
 * Middleware to check validation results from express-validator
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Rules for registration
 */
export const registerValidator = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters.'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter.')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number.')
    .matches(/[\W_]/)
    .withMessage('Password must contain at least one special character.'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your password.')
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),

  body('role')
    .notEmpty()
    .withMessage('Role selection is required.')
    .custom((value) => {
      // Strictly prevent public ADMIN registration
      if (value === 'ADMIN') {
        throw new Error('Public registration as ADMIN is not permitted.');
      }
      if (!['JOB_SEEKER', 'EMPLOYER'].includes(value)) {
        throw new Error('Role must be either JOB_SEEKER or EMPLOYER.');
      }
      return true;
    }),

  handleValidationErrors,
];

/**
 * Rules for login
 */
export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required.'),

  handleValidationErrors,
];

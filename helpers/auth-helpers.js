const jwt = require('jsonwebtoken');
const moment = require('moment');
const path = require('path');
const PropertiesReader = require('properties-reader');

const properties = PropertiesReader(path.resolve('app.properties'));

exports.SALT_WORK_FACTOR = Number(properties.get('auth.SALT_WORK_FACTOR') || 10);

exports.PWD_MAX_LOGIN_ATTEMPTS = Number(properties.get('auth.PWD_MAX_LOGIN_ATTEMPTS') || 10);
exports.PWD_LOCK_TIME = moment.duration({ minute: Number(properties.get('auth.PWD_LOCK_TIME') || 5) });

exports.PWD_RESET_TOKEN_EXP = moment.duration({ hours: Number(properties.get('auth.PWD_RESET_TOKEN_EXP') || 5) });
exports.JWT_SECRET = properties.get('auth.JWT_SECRET') || 'XYZ';
exports.JWT_ISSUER = properties.get('auth.JWT_ISSUER') || 'xyz';

/**
 * Verify reset token and returns the payload
 *
 * @param {string} token
 * @returns {Promise<{ valid: boolean, payload: PasswordResetTokenPayload, err: any }>}
 */
exports.verifyResetToken = function verifyResetToken(token) {
  return new Promise((resolve) =>
    jwt.verify(token, module.JWT_SECRET, (err, payload) => {
      if (err) {
        return resolve({ err, valid: false });
      }

      return resolve({ payload, valid: true });
    })
  );
};

/**
 * Set use session, automatically submitted to db by next-session
 * @typedef {Object} UserSession
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @param req
 * @param {{ id: string, email: string, name: string }} user
 */
exports.setUserSession = function setUserSession(req, user) {
  if (user) {
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };
  }
};

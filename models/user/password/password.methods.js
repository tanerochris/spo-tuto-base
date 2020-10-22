const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const {
  JWT_ISSUER,
  JWT_SECRET,
  PWD_LOCK_TIME,
  PWD_MAX_LOGIN_ATTEMPTS,
  PWD_RESET_TOKEN_EXP
} = require('../../../helpers/auth-helpers');

const PasswordMethods = {
  isLocked() {
    return moment(this.lockUntil).isAfter(moment());
  },

  /**
   * Compare user passwords
   * @param {string} candidatePassword value to test
   * @returns {*}
   */
  comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.value);
  },

  /**
   * Generate a reset token based on a strategy
   *
   * @typedef {Object} PasswordResetTokenPayload
   * @property {string} uid - The id of user this token belongs to
   * @property {string} strategy - The reset strategy
   * @param strategy
   * @returns {Promise<string>}
   */
  async generatePasswordResetToken(strategy) {
    const payload = { strategy, uid: this.ownerDocument().id };
    const JWTOptions = {
      issuer: JWT_ISSUER,
      expiresIn: moment().add(PWD_RESET_TOKEN_EXP).valueOf()
    };

    const resetToken = jwt.sign(payload, JWT_SECRET, JWTOptions);

    this.newPasswordRequest = { token: resetToken, strategy, date: new Date() };

    await this.ownerDocument().save();

    return resetToken;
  },

  validateResetToken(token) {
    return this.newPasswordRequest && this.newPasswordRequest.token === token;
  },

  /**
   * Reset the password, could be update (manual) or from token
   * @param {String} resetCred.password
   * @param {'email' | 'manual'} resetCred.strategy
   * @returns {*}
   */
  resetPassword(resetCred) {
    const modification = {
      setDate: new Date(),
      strategy: resetCred.strategy,
      requestDate: this.newPasswordRequest ? this.newPasswordRequest.date : new Date()
    };

    this.value = resetCred.password;
    this.lockUntil = 1;
    this.loginAttempts = 0;
    this.newPasswordRequest = {};

    // trigger and run middleware
    this.save({ suppressWarning: true });

    return this.ownerDocument()
      .save()
      .then(() =>
        this.ownerDocument()
          .updateOne({ $push: { 'password.modifications': modification } })
          .exec()
      );
  },

  incLoginAttempts() {
    // if we have previous lock that had expired
    if (this.lockUntil > 1 && !this.isLocked()) {
      return this.resetPasswordLock();
    }

    const update = {
      $inc: { 'password.loginAttempts': 1 }
    };

    // lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts >= PWD_MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
      // TODO: Implement send mail to client.
      // TODO: Implement log Account Locks.
      update.$set = {
        'password.lockUntil': moment().add(PWD_LOCK_TIME).valueOf()
      };
    }

    return this.ownerDocument().updateOne(update).exec();
  },

  resetPasswordLock() {
    this.lockUntil = 1;
    this.loginAttempts = 0;

    return this.ownerDocument().save();
  }
};

module.exports = PasswordMethods;

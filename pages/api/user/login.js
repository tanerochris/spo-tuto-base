import moment from 'moment';
import mongoose from 'mongoose';
import { ApiResponseError } from '../../../helpers/api-errors';
import { setUserSession } from '../../../helpers/auth-helpers';
import Middleware from '../../../middlewares';

const User = mongoose.model('User');

/**
 * Logs in, set user information on session object
 *
 * @param req
 * @param {'POST'} req.method
 * @param {string} req.body.email
 * @param {string} req.body.password
 * @param res
 * @returns {Promise<void>}
 */
async function SignInHandler({ req, res }) {
  let errorResponse = '';
  if (req.method === 'POST') {
    const user = await User.findOne({
      email: req.body.email,
      providerUserId: req.body.userId || req.body.googleId }).select('-password').exec();
    if ( user ) {
      setUserSession(req, user);
      return res.json(user);
    }
    const alternativeProvider = req.body.provider === 'facebook'? 'google' : 'facebook';
    errorResponse = ApiResponseError.getError({
      name: 'AuthorizationError',
      message: `Unknown user, ${req.body.name}. Try login with ${alternativeProvider}.`
    });
    return res.json(errorResponse);
  }
  return null;
}

export default Middleware(SignInHandler);

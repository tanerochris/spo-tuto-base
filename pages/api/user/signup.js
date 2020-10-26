import { ApiResponseError } from '../../../helpers/api-errors';
import Middleware from '../../../middlewares';
import User from '../../../models/user/user.model';

async function SignUpHandler({ req, res }) {
  let user = null;
  console.log(req.body);

  try {
    if (req.method === 'POST') {

      const emailExist = await User.findOne({ email: req.body.email });
      if (emailExist) {
        const errorResponse = ApiResponseError.getError({
          name: 'ForbiddenError',
          message: `${req.body.email} already taken, try another email.`
        });
        return res.json(errorResponse);
      }
      if (req.body.provider === 'facebook') {
        req.body.profilePic = req.body.picture.data.url;
        req.body.providerUserId = req.body.userId;
        user = new User(req.body);
      }
      await user.save();
      return res.json({id: user.id, name: user.name, email: user.email, profilePic: user.profilePic});
    }
  } catch(message) {
    const errorResponse = ApiResponseError.getError({
      name: 'ServerError',
      message
    });
    return res.json(errorResponse);
  }
}
export default Middleware(SignUpHandler);

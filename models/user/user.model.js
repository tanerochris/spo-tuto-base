import mongoose from 'mongoose';
import UserStatics from './user.statics';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      index: true,
      unique: true,
      required: true,
      validate: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Must be a valid email address.'
      ]
    },
    provider: {
      type: String,
      enum: ['facebook', 'google', 'twitter']
    },
    providerAccessToken: String,
    providerUserId: String,
    profilePic: String,
  },
  {
    timestamps: true
  }
);

UserSchema.statics = UserStatics;

export default mongoose.models.User || mongoose.model('User', UserSchema);
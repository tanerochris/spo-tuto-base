const mongoose = require('mongoose');
const PasswordSchema = require('./password/password.schema');
const UserStatics = require('./user.statics');

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
    password: {
      type: PasswordSchema
    }
  },
  {
    timestamps: true
  }
);

UserSchema.statics = UserStatics;
const User = mongoose.model('User', UserSchema);

module.exports = User;

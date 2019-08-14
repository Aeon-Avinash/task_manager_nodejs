const mongoose = require("mongoose");
const Validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { Task } = require("./task");

const userSchemaObj = {
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator(value) {
        return Validator.isEmail(value);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  age: {
    type: String,
    default: 0,
    validate: {
      validator(value) {
        return Validator.isInt(value, { min: 0 });
      },
      message: `Age must be a positive number!`
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    validate: {
      validator(value) {
        return !value.match(/password/i);
      },
      message: props => `${props.value} is not a valid password!`
    }
  },
  avatar: {
    type: Buffer
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ]
};

const userSchemaFields = Object.keys(userSchemaObj);

const userSchema = new mongoose.Schema(userSchemaObj, {
  timestamps: true
});

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner"
});
//? Find tasks where localField is equal to foreignField

userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET
    // , {
    //   expiresIn: "3600 seconds"
    // }
  );
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.methods.toJSON = function() {
  const user = this;
  const userProfile = user.toObject();
  delete userProfile.password;
  delete userProfile.tokens;
  delete userProfile.avatar;
  return userProfile;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to login!");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unable to login!");
  }
  return user;
};

//? Hash the password before saving
userSchema.pre("save", async function(next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

//? Delete user tasks when user is removed
userSchema.pre("remove", async function(next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model(`User`, userSchema);

module.exports = { User, userSchemaFields };

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: function () {
        // Name required only for email signup; mobile users can set it later
        return this.authMethod === 'email';
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true, // allows multiple docs with no email (mobile-only users)
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: 6,
      select: false, // never return password by default
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // allows multiple docs with no phone (email-only users)
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    authMethod: {
      type: String,
      enum: ['email', 'mobile', 'google'],
      default: 'email',
    },
    avatar: {
      type: String,
      default: '',
    },
    addresses: [
      {
        label: { type: String, default: 'Home' },
        firstName: String,
        lastName: String,
        phone: String,
        street: String,
        city: String,
        state: String,
        pin: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
  },
  { timestamps: true }
);

// Hash password before saving (only if modified and present)
// NOTE: Mongoose 9+ removed support for the next() callback in async pre-hooks —
// an async function automatically signals completion when it returns / resolves.
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare plaintext password against stored hash
userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// Strip sensitive fields whenever a user doc is sent as JSON
userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

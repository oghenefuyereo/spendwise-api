const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    // Custom validator: only require minlength if password is provided
    validate: {
      validator: function(value) {
        // If googleId exists (OAuth user), password not required
        if (this.googleId) return true;
        return typeof value === "string" && value.length >= 6;
      },
      message: "Password must be at least 6 characters long",
    },
    required: function() {
      return !this.googleId;
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // allows multiple null values
  },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving, only if modified and password exists
userSchema.pre("save", async function(next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare candidate password with hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false; // OAuth user has no password
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    minlength: 3,  // Correct spelling is minlength, not minLenght
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]  // ✅ generates on document creation
  }
});

module.exports = mongoose.model("Account", userSchema);
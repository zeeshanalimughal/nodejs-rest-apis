const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  address: { type: String },
  education: { type: String, default: '' },
  job: { type: String, default: '' },
  pic: { type: String, default: '' },
  password: { type: String, required: true },
  status: { type: Number, default: 0 },
  otp: { type: Number, default: null },
  token: { type: String },
  seats: { type: Array },
  rides: { type: Array },
  requests: [{
    requestFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reqStatus: { type: String }
  }]
},
  { timeseries: true });

module.exports = mongoose.model("User", userSchema);
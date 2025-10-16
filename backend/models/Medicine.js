const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genericName: String,
  brandName: String,
  description: String,
  dosageForm: String,     // e.g., tablet, syrup, capsule
  strength: String,       // e.g., 500mg, 5ml

  quantityInStock: { type: Number, default: 0 }, // capsules available
  boxesInStock: { type: Number, default: 0 },    // unopened boxes
  capsulesPerBox: { type: Number, default: 0 },  // capsules per box

  unit: String,           // e.g., pcs, bottles, strips
  expiryDate: Date,
  available: { type: Boolean, default: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, enum: ['equipment', 'lab', 'stationery'], required: true },
  quantity: { type: Number, required: true },
  supplier: { type: String },
  purchaseDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  cost: { type: Number },
  location: { type: String },
  status: { type: String, enum: ['in_stock', 'out_of_stock', 'damaged'], default: 'in_stock' },
});

module.exports = mongoose.model('Inventory', inventorySchema);
const express = require('express');
const Inventory = require('../models/Inventory');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all inventory items
router.get('/', auth, async (req, res) => {
  try {
    const inventory = await Inventory.find({});
    res.send(inventory);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Get inventory by category
router.get('/category/:category', auth, async (req, res) => {
  try {
    const inventory = await Inventory.find({ category: req.params.category });
    res.send(inventory);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Create inventory item
router.post('/', auth, async (req, res) => {
  try {
    const item = new Inventory(req.body);
    await item.save();
    res.status(201).send(item);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Update inventory item
router.patch('/:id', auth, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).send();
    }
    res.send(item);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete inventory item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).send();
    }
    res.send(item);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Update quantity
router.patch('/:id/quantity', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Inventory.findByIdAndUpdate(req.params.id, { quantity }, { new: true });
    if (!item) {
      return res.status(404).send();
    }
    res.send(item);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
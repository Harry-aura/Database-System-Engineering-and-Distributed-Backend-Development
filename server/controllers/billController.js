/**
 * Bill controller: maintenance dues and payments with proof attachment, bulk generation & soft-delete.
 * @module controllers/billController
 */
const asyncHandler = require('express-async-handler');
const Bill = require('../models/Bill');
const User = require('../models/User');
const Notice = require('../models/Notice');
const { Roles } = require('../utils/roles');

/**
 * GET /api/bills
 * Admin: all active bills. Resident: active bills for their own flat.
 * @access Private
 */
const getBills = asyncHandler(async (req, res) => {
  const filter = { isDeleted: { $ne: true } };

  if (req.query.flatNumber) {
    filter.flatNumber = req.query.flatNumber;
  } else if (req.user.role === Roles.RESIDENT) {
    filter.flatNumber = req.user.flatNumber || req.user.flat;
  }

  const bills = await Bill.find(filter)
    .populate('user', 'name email flatNumber flat')
    .sort({ dueDate: -1 });

  res.json(bills);
});

/**
 * POST /api/bills
 * Issue bills with optional image proof to a single flat or broadcast to ALL flats (admin only).
 * @access Private/Admin
 */
const createBill = asyncHandler(async (req, res) => {
  const residentId = req.body.residentId || req.body.resident;
  const { type, amount, dueDate, description } = req.body;
  const proofUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const billType = type || 'Maintenance';
  const billTitle = `${billType} Bill`;

  if (!residentId || !amount || !dueDate) {
    res.status(400);
    throw new Error('Resident selection, amount, and due date are required.');
  }

  // 1. Bulk creation for ALL resident flats
  if (residentId === 'ALL') {
    const residents = await User.find({ role: Roles.RESIDENT });

    if (!residents.length) {
      res.status(400);
      throw new Error('No residents registered in the society.');
    }

    const billDocs = residents.map((resUser) => ({
      user: resUser._id,
      title: billTitle,
      type: billType,
      amount: Number(amount),
      dueDate,
      flatNumber: resUser.flatNumber || resUser.flat || 'N/A',
      description: description || '',
      proofUrl,
      status: 'pending',
    }));

    const createdBills = await Bill.insertMany(billDocs);

    // Auto-create notice alert for all residents
    await Notice.create({
      title: `New ${billType} Invoices Issued`,
      content: `A ${billType} bill of ₹${amount} is due on ${dueDate}. Please check the My Bills section.`,
      category: 'Billing',
      author: req.user._id,
    });

    return res.status(201).json(createdBills);
  }

  // 2. Individual flat bill creation
  const resident = await User.findById(residentId);
  if (!resident) {
    res.status(404);
    throw new Error('Target resident not found.');
  }

  const bill = await Bill.create({
    user: resident._id,
    title: billTitle,
    type: billType,
    amount: Number(amount),
    dueDate,
    flatNumber: resident.flatNumber || resident.flat || 'N/A',
    description: description || '',
    proofUrl,
    status: 'pending',
  });

  // Notice alert for individual resident
  await Notice.create({
    title: `New ${billType} Bill for Flat ${bill.flatNumber}`,
    content: `Invoice amount: ₹${amount} due on ${dueDate}.`,
    category: 'Billing',
    author: req.user._id,
  });

  res.status(201).json(bill);
});

/**
 * PUT /api/bills/:id
 * Mark a bill as paid.
 * @access Private
 */
const updateBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);

  if (!bill || bill.isDeleted) {
    res.status(404);
    throw new Error('Bill not found');
  }

  if (bill.status === 'paid') {
    return res.json(bill);
  }

  bill.status = 'paid';
  bill.paidAt = new Date();
  const updatedBill = await bill.save();
  res.json(updatedBill);
});

/**
 * DELETE /api/bills/:id
 * Soft delete a bill.
 * Admin: can delete any bill (pending or paid).
 * Resident: can delete only paid bills for their own flat.
 * @access Private
 */
const deleteBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);

  if (!bill || bill.isDeleted) {
    res.status(404);
    throw new Error('Bill not found');
  }

  if (req.user.role === Roles.RESIDENT) {
    const userFlat = req.user.flatNumber || req.user.flat;
    if (bill.flatNumber !== userFlat) {
      res.status(403);
      throw new Error('Not authorized to delete bills for another flat.');
    }
    if (bill.status !== 'paid') {
      res.status(400);
      throw new Error('Residents can only delete paid bills.');
    }
  }

  bill.isDeleted = true;
  bill.deletedAt = new Date();
  bill.deletedBy = req.user._id;
  await bill.save();

  res.json({ message: 'Bill removed successfully' });
});

module.exports = {
  getBills,
  createBill,
  updateBill,
  deleteBill,
};
/**
 * Database seeder.
 * Wipes existing collections and re-creates realistic test data.
 * Run with: node server/seeders/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Visitor = require('../models/Visitor');
const Notice = require('../models/Notice');
const AmenityBooking = require('../models/AmenityBooking');
const Bill = require('../models/Bill');

connectDB();

/** Test credentials used by the client quick-login buttons. */
const ADMIN = { name: 'Admin Officer', email: 'admin@society.com', password: 'Admin@123', role: 'admin' };
const RESIDENT = { name: 'John Doe', email: 'resident@society.com', password: 'Resident@123', role: 'resident', flatNumber: '402', block: 'B' };
const SECURITY = { name: 'Guard Ramesh', email: 'guard@society.com', password: 'Guard@123', role: 'security', gate: 'Gate 1 Main Entry' };

/**
 * Seeds the database with users and supporting records.
 * @returns {Promise<void>}
 */
const seedData = async () => {
  try {
    // Wipe everything to guarantee deterministic state.
    await User.deleteMany();
    await Visitor.deleteMany();
    await Notice.deleteMany();
    await AmenityBooking.deleteMany();
    await Bill.deleteMany();

    // Create the three role accounts.
    const adminUser = await User.create(ADMIN);
    const residentUser = await User.create(RESIDENT);
    const securityUser = await User.create(SECURITY);

    // Visitors: one pending (needs resident approval) and one approved (ready to check in).
    await Visitor.create([
      {
        guardId: securityUser._id,
        name: 'Rahul Sharma',
        phone: '9876543210',
        flatNumber: '402',
        purpose: 'Delivery',
        status: 'pending',
      },
      {
        guardId: securityUser._id,
        name: 'Priya Verma',
        phone: '9123456789',
        flatNumber: '402',
        purpose: 'Guest',
        status: 'approved',
      },
      {
        guardId: securityUser._id,
        name: 'Arjun Mehta',
        phone: '9000000000',
        flatNumber: '402',
        purpose: 'Cab / Taxi',
        status: 'checked-out',
        checkedInAt: new Date(Date.now() - 120 * 60000),
        checkedOutAt: new Date(Date.now() - 30 * 60000),
      },
    ]);

    // Bills for the resident flat (one pending, one paid).
    await Bill.create([
      {
        user: residentUser._id,
        flatNumber: '402',
        title: 'March 2026 Maintenance',
        amount: 2500,
        dueDate: new Date('2026-03-31'),
        status: 'pending',
      },
      {
        user: residentUser._id,
        flatNumber: '402',
        title: 'February 2026 Maintenance',
        amount: 2500,
        dueDate: new Date('2026-02-28'),
        status: 'paid',
        paidAt: new Date('2026-02-27'),
      },
    ]);

    // Society notices.
    await Notice.create([
      {
        author: adminUser._id,
        title: 'Water Supply Maintenance',
        content:
          'Water supply will be suspended between 10 AM to 2 PM due to overhead tank cleaning.',
      },
      {
        author: adminUser._id,
        title: 'Annual General Meeting',
        content:
          'All residents are requested to attend the AGM in the clubhouse at 5 PM this Saturday.',
      },
    ]);

    // A confirmed amenity booking.
    await AmenityBooking.create([
      {
        resident: residentUser._id,
        amenity: 'Clubhouse Party Hall',
        date: '2026-03-22',
        time: 'Evening (6 PM - 10 PM)',
        status: 'Confirmed',
      },
    ]);

    console.log(
      'Database seeded: users, visitors, notices, bills, and amenity bookings created.'
    );
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
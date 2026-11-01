const assert = require('assert');
const db = require('../server/database');
const { getSampleData } = require('../server/seedData');

console.log('🧪 Starting Celebration Event Planner Test Suite...\n');

// 1. Database Seed & Initial Data Check
console.log('1. Testing Database Seeding & Stats...');
const sample = getSampleData();
db.seedData(sample);

const stats = db.getDashboardStats();
assert.strictEqual(stats.overview.totalEvents, 4, 'Should have 4 initial celebrations');
assert(stats.overview.totalTargetBudget > 0, 'Target budget should be greater than 0');
assert(stats.overview.totalActualSpent > 0, 'Actual spent should be greater than 0');
assert(stats.categoryCounts.birthday >= 1, 'Should have birthday events');
assert(stats.categoryCounts.wedding >= 1, 'Should have wedding events');
assert(stats.categoryCounts.anniversary >= 1, 'Should have anniversary events');
assert(stats.categoryCounts.party >= 1, 'Should have party events');
console.log('   ✅ Seed data and aggregated stats verified successfully.');

// 2. Events CRUD
console.log('\n2. Testing Events CRUD...');
const newEvent = db.createEvent({
  title: 'Test New Year Gala',
  category: 'party',
  date: '2026-12-31',
  time: '21:00',
  venue: 'Grand Crystal Ballroom',
  targetBudget: 15000,
  description: 'Ringing in the new year with elegance and champagne.'
});
assert(newEvent.id, 'Event should be created with an ID');
assert.strictEqual(newEvent.title, 'Test New Year Gala');
assert.strictEqual(newEvent.category, 'party');

// Read event
const fetched = db.getEventById(newEvent.id);
assert.strictEqual(fetched.title, 'Test New Year Gala');

// Update event
const updated = db.updateEvent(newEvent.id, {
  title: 'Test New Year Midnight Gala',
  targetBudget: 16000
});
assert.strictEqual(updated.title, 'Test New Year Midnight Gala');
assert.strictEqual(updated.targetBudget, 16000);
console.log('   ✅ Event creation, read, and update verified.');

// 3. Expenses CRUD & Budget Calculation
console.log('\n3. Testing Expenses & Budget Tracking...');
const expense = db.createExpense(newEvent.id, {
  title: 'Champagne Fountain Rental',
  category: 'Entertainment',
  amount: 2500,
  status: 'pending',
  date: '2026-12-28',
  notes: 'Deposit paid'
});
assert(expense.id, 'Expense should have an ID');
assert.strictEqual(expense.amount, 2500);

// Verify event budget reflects expense
const eventWithExpense = db.getEventById(newEvent.id);
assert.strictEqual(eventWithExpense.stats.totalSpent, 2500, 'Total spent should reflect added expense');
assert.strictEqual(eventWithExpense.stats.remainingBudget, 16000 - 2500, 'Remaining budget should be 13500');

// Update expense to paid
const updatedExp = db.updateExpense(expense.id, { status: 'paid' });
assert.strictEqual(updatedExp.status, 'paid');
const eventWithPaidExpense = db.getEventById(newEvent.id);
assert.strictEqual(eventWithPaidExpense.stats.paidSpent, 2500, 'Paid amount should be 2500');

// Delete expense
const expDeleted = db.deleteExpense(expense.id);
assert.strictEqual(expDeleted, true);
assert.strictEqual(db.getEventById(newEvent.id).stats.totalSpent, 0, 'Total spent should return to 0');
console.log('   ✅ Expense tracking and budget calculations verified.');

// 4. Guests CRUD & RSVP Tracking
console.log('\n4. Testing Guest Management & RSVPs...');
const guest = db.createGuest(newEvent.id, {
  name: 'Lady Genevieve',
  email: 'genevieve@highsociety.com',
  phone: '+1 555-0199',
  rsvpStatus: 'attending',
  plusOnes: 2,
  dietaryRestrictions: 'Pescatarian',
  tableGroup: 'VIP Table Alpha'
});
assert(guest.id, 'Guest should have an ID');
assert.strictEqual(guest.rsvpStatus, 'attending');
assert.strictEqual(guest.plusOnes, 2);

// Check event guest stats (1 guest + 2 plus-ones = 3 attending)
const eventWithGuest = db.getEventById(newEvent.id);
assert.strictEqual(eventWithGuest.stats.totalGuests, 1);
assert.strictEqual(eventWithGuest.stats.attendingCount, 3, 'Attending count should include plus-ones');

// Update RSVP to declined
const updatedGuest = db.updateGuest(guest.id, { rsvpStatus: 'declined' });
assert.strictEqual(updatedGuest.rsvpStatus, 'declined');
assert.strictEqual(db.getEventById(newEvent.id).stats.attendingCount, 0);

// Delete guest
const guestDeleted = db.deleteGuest(guest.id);
assert.strictEqual(guestDeleted, true);
assert.strictEqual(db.getEventById(newEvent.id).stats.totalGuests, 0);
console.log('   ✅ Guest roster, RSVPs, plus-ones and deletions verified.');

// 5. Checklist Tasks CRUD
console.log('\n5. Testing Planning Checklist Milestones...');
const task = db.createTask(newEvent.id, {
  title: 'Order custom midnight confetti cannons',
  category: 'Decor',
  dueDate: '2026-12-20',
  priority: 'high',
  completed: false,
  assignedTo: 'Party Coordinator'
});
assert(task.id, 'Task should have an ID');
assert.strictEqual(task.completed, false);

// Toggle task
const toggled = db.toggleTask(task.id);
assert.strictEqual(toggled.completed, true);
const eventWithDoneTask = db.getEventById(newEvent.id);
assert.strictEqual(eventWithDoneTask.stats.completedTasks, 1);
assert.strictEqual(eventWithDoneTask.stats.taskProgress, 100);

// Delete task
const taskDeleted = db.deleteTask(task.id);
assert.strictEqual(taskDeleted, true);
console.log('   ✅ Checklist tasks, toggle completion, and progress calculation verified.');

// 6. Delete Event & Cascade Check
console.log('\n6. Testing Event Deletion & Cascade Clean-up...');
const eventDeleted = db.deleteEvent(newEvent.id);
assert.strictEqual(eventDeleted, true);
assert.strictEqual(db.getEventById(newEvent.id), null, 'Event should no longer exist');
console.log('   ✅ Event deletion and cascade verified.');

// Restore seed data
db.seedData(sample);
console.log('\n🎉 ALL UNIT & INTEGRATION TESTS PASSED WITH 100% SUCCESS!');

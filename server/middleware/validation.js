function validateEvent(req, res, next) {
  const { title, category, date, targetBudget } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Event title is required.' });
  } else if (title.trim().length > 120) {
    errors.push({ field: 'title', message: 'Event title cannot exceed 120 characters.' });
  }

  const validCategories = ['birthday', 'wedding', 'anniversary', 'party'];
  if (category && !validCategories.includes(category.toLowerCase())) {
    errors.push({ field: 'category', message: `Category must be one of: ${validCategories.join(', ')}` });
  }

  if (!date || typeof date !== 'string') {
    errors.push({ field: 'date', message: 'Event date is required (YYYY-MM-DD).' });
  } else {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      errors.push({ field: 'date', message: 'Invalid event date format.' });
    }
  }

  if (targetBudget !== undefined && targetBudget !== null && targetBudget !== '') {
    const num = Number(targetBudget);
    if (isNaN(num) || num < 0) {
      errors.push({ field: 'targetBudget', message: 'Target budget must be a non-negative number.' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0].message });
  }

  next();
}

function validateExpense(req, res, next) {
  const { title, amount, status } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Expense title / vendor name is required.' });
  }

  if (amount === undefined || amount === null || amount === '') {
    errors.push({ field: 'amount', message: 'Expense amount is required.' });
  } else {
    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      errors.push({ field: 'amount', message: 'Expense amount must be a positive number greater than 0.' });
    }
  }

  if (status && !['paid', 'pending'].includes(status)) {
    errors.push({ field: 'status', message: 'Status must be "paid" or "pending".' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0].message });
  }

  next();
}

function validateGuest(req, res, next) {
  const { name, email, rsvpStatus, plusOnes } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Guest name is required.' });
  }

  if (email && typeof email === 'string' && email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push({ field: 'email', message: 'Please provide a valid email address.' });
    }
  }

  if (rsvpStatus && !['attending', 'pending', 'declined'].includes(rsvpStatus)) {
    errors.push({ field: 'rsvpStatus', message: 'RSVP status must be "attending", "pending", or "declined".' });
  }

  if (plusOnes !== undefined && plusOnes !== null && plusOnes !== '') {
    const num = parseInt(plusOnes, 10);
    if (isNaN(num) || num < 0) {
      errors.push({ field: 'plusOnes', message: 'Plus ones must be a non-negative integer.' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0].message });
  }

  next();
}

function validateTask(req, res, next) {
  const { title, priority, dueDate } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Task description is required.' });
  }

  if (priority && !['high', 'medium', 'low'].includes(priority)) {
    errors.push({ field: 'priority', message: 'Priority must be "high", "medium", or "low".' });
  }

  if (dueDate && typeof dueDate === 'string' && dueDate.trim().length > 0) {
    const parsed = new Date(dueDate);
    if (isNaN(parsed.getTime())) {
      errors.push({ field: 'dueDate', message: 'Invalid due date format.' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0].message });
  }

  next();
}

module.exports = {
  validateEvent,
  validateExpense,
  validateGuest,
  validateTask
};

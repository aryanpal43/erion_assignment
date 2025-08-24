const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Lead = require('../models/Lead');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get all leads for analytics (no pagination limits)
router.get('/analytics', async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ created_at: -1 });
    res.json({
      message: 'Analytics data retrieved successfully',
      data: leads,
      total: leads.length
    });
  } catch (error) {
    console.error('Analytics data fetch error:', error);
    res.status(500).json({
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
});

// Create lead
router.post('/', [
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('company')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('City name cannot exceed 50 characters'),
  body('state')
    .optional()
    .isLength({ max: 50 })
    .withMessage('State name cannot exceed 50 characters'),
  body('source')
    .isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'])
    .withMessage('Invalid source value'),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'lost', 'won'])
    .withMessage('Invalid status value'),
  body('score')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
  body('lead_value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Lead value must be a positive number'),
  body('is_qualified')
    .optional()
    .isBoolean()
    .withMessage('is_qualified must be a boolean'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const leadData = req.body;
    
    // Check if email already exists
    const existingLead = await Lead.findOne({ email: leadData.email });
    if (existingLead) {
      return res.status(400).json({
        message: 'Lead with this email already exists'
      });
    }

    // Set default values
    if (!leadData.status) leadData.status = 'new';
    if (!leadData.score) leadData.score = 0;
    if (!leadData.lead_value) leadData.lead_value = 0;
    if (!leadData.is_qualified) leadData.is_qualified = false;

    const lead = new Lead(leadData);
    await lead.save();

    res.status(201).json({
      message: 'Lead created successfully',
      lead
    });
  } catch (error) {
    console.error('Create lead error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Lead with this email already exists'
      });
    }
    res.status(500).json({
      message: 'Internal server error while creating lead'
    });
  }
});

// Get leads with pagination and filtering
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'lost', 'won'])
    .withMessage('Invalid status value'),
  query('source')
    .optional()
    .isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'])
    .withMessage('Invalid source value'),
  query('is_qualified')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('is_qualified must be true or false'),
  query('score_min')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Score min must be between 0 and 100'),
  query('score_max')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Score max must be between 0 and 100'),
  query('value_min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Value min must be a positive number'),
  query('value_max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Value max must be a positive number'),
  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO date'),
  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO date')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      search,
      status,
      source,
      is_qualified,
      score_min,
      score_max,
      value_min,
      value_max,
      date_from,
      date_to,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // String search filters
    if (search) {
      filter.$or = [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }

    // Exact match filters
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (is_qualified !== undefined) filter.is_qualified = is_qualified === 'true';

    // Range filters
    if (score_min || score_max) {
      filter.score = {};
      if (score_min) filter.score.$gte = parseInt(score_min);
      if (score_max) filter.score.$lte = parseInt(score_max);
    }

    if (value_min || value_max) {
      filter.lead_value = {};
      if (value_min) filter.lead_value.$gte = parseFloat(value_min);
      if (value_max) filter.lead_value.$lte = parseFloat(value_max);
    }

    // Date filters
    if (date_from || date_to) {
      filter.created_at = {};
      if (date_from) filter.created_at.$gte = new Date(date_from);
      if (date_to) filter.created_at.$lte = new Date(date_to);
    }

    // Build sort object
    const sort = {};
    sort[sort_by] = sort_order === 'asc' ? 1 : -1;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assigned_to', 'first_name last_name email'),
      Lead.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      data: leads,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      message: 'Internal server error while fetching leads'
    });
  }
});

// Get single lead by ID
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assigned_to', 'first_name last_name email');

    if (!lead) {
      return res.status(404).json({
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      lead
    });
  } catch (error) {
    console.error('Get lead error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        message: 'Invalid lead ID'
      });
    }
    res.status(500).json({
      message: 'Internal server error while fetching lead'
    });
  }
});

// Update lead
router.put('/:id', [
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('company')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('City name cannot exceed 50 characters'),
  body('state')
    .optional()
    .isLength({ max: 50 })
    .withMessage('State name cannot exceed 50 characters'),
  body('source')
    .optional()
    .isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'])
    .withMessage('Invalid source value'),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'lost', 'won'])
    .withMessage('Invalid status value'),
  body('score')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
  body('lead_value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Lead value must be a positive number'),
  body('is_qualified')
    .optional()
    .isBoolean()
    .withMessage('is_qualified must be a boolean'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        message: 'Lead not found'
      });
    }

    // Check if email is being updated and if it already exists
    if (req.body.email && req.body.email !== lead.email) {
      const existingLead = await Lead.findOne({ email: req.body.email });
      if (existingLead) {
        return res.status(400).json({
          message: 'Lead with this email already exists'
        });
      }
    }

    // Update lead
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: new Date() },
      { new: true, runValidators: true }
    ).populate('assigned_to', 'first_name last_name email');

    res.status(200).json({
      message: 'Lead updated successfully',
      lead: updatedLead
    });
  } catch (error) {
    console.error('Update lead error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Lead with this email already exists'
      });
    }
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        message: 'Invalid lead ID'
      });
    }
    res.status(500).json({
      message: 'Internal server error while updating lead'
    });
  }
});

// Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        message: 'Lead not found'
      });
    }

    await Lead.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        message: 'Invalid lead ID'
      });
    }
    res.status(500).json({
      message: 'Internal server error while deleting lead'
    });
  }
});

module.exports = router;

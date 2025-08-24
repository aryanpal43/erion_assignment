const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  city: {
    type: String,
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters']
  },
  state: {
    type: String,
    trim: true,
    maxlength: [50, 'State name cannot exceed 50 characters']
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    enum: {
      values: ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'],
      message: 'Source must be one of: website, facebook_ads, google_ads, referral, events, other'
    }
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['new', 'contacted', 'qualified', 'lost', 'won'],
      message: 'Status must be one of: new, contacted, qualified, lost, won'
    },
    default: 'new'
  },
  score: {
    type: Number,
    min: [0, 'Score cannot be less than 0'],
    max: [100, 'Score cannot exceed 100'],
    default: 0
  },
  lead_value: {
    type: Number,
    min: [0, 'Lead value cannot be negative'],
    default: 0
  },
  last_activity_at: {
    type: Date,
    default: null
  },
  is_qualified: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index for better query performance
leadSchema.index({ status: 1, source: 1 });
leadSchema.index({ company: 1 });
leadSchema.index({ city: 1, state: 1 });
leadSchema.index({ created_at: -1 });
leadSchema.index({ last_activity_at: -1 });

// Virtual for full name
leadSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

// Ensure virtual fields are serialized
leadSchema.set('toJSON', { virtuals: true });
leadSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Lead', leadSchema);

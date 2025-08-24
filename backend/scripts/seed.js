const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const Lead = require('../models/Lead');
const User = require('../models/User');

// Sample data arrays
const sources = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
const statuses = ['new', 'contacted', 'qualified', 'lost', 'won'];
const companies = [
  'TechCorp', 'InnovateLabs', 'Digital Solutions', 'Future Systems', 'SmartTech',
  'Global Innovations', 'NextGen Corp', 'Elite Technologies', 'Prime Solutions', 'Apex Systems',
  'Dynamic Corp', 'Strategic Partners', 'Vision Tech', 'Core Systems', 'Peak Innovations',
  'Summit Solutions', 'Pinnacle Tech', 'Crest Corp', 'Vertex Systems', 'Nexus Technologies'
];
const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
  'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
  'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington'
];
const states = [
  'NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'NC', 'WA', 'CO', 'GA', 'MI', 'OR',
  'TN', 'VA', 'NJ', 'MN', 'WI', 'MD', 'CO', 'AZ', 'NV', 'UT', 'ID', 'MT', 'WY', 'ND'
];

// Generate a single lead
function generateLead() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName });
  
  return {
    first_name: firstName,
    last_name: lastName,
    email: email,
    phone: faker.phone.number('###-###-####'),
    company: faker.helpers.arrayElement(companies),
    city: faker.helpers.arrayElement(cities),
    state: faker.helpers.arrayElement(states),
    source: faker.helpers.arrayElement(sources),
    status: faker.helpers.arrayElement(statuses),
    score: faker.number.int({ min: 0, max: 100 }),
    lead_value: faker.number.float({ min: 0, max: 50000, precision: 0.01 }),
    last_activity_at: faker.datatype.boolean() ? faker.date.recent({ days: 30 }) : null,
    is_qualified: faker.datatype.boolean(),
    notes: faker.datatype.boolean() ? faker.lorem.sentence() : null
  };
}

// Generate multiple leads
function generateLeads(count) {
  const leads = [];
  for (let i = 0; i < count; i++) {
    leads.push(generateLead());
  }
  return leads;
}

// Main seeding function
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Clear existing leads
    await Lead.deleteMany({});
    console.log('🗑️  Cleared existing leads');

    // Generate leads
    const leadCount = 150; // Generate 150 leads
    const leads = generateLeads(leadCount);
    
    // Insert leads
    await Lead.insertMany(leads);
    console.log(`✅ Inserted ${leadCount} leads`);

    // Create a demo user if none exists
    const existingUser = await User.findOne({ email: 'demo@example.com' });
    if (!existingUser) {
      const demoUser = new User({
        first_name: 'Demo',
        last_name: 'User',
        email: 'demo@example.com',
        password: 'demo123',
        role: 'admin'
      });
      await demoUser.save();
      console.log('✅ Created demo user (demo@example.com / demo123)');
    }

    // Display some statistics
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'new' });
    const qualifiedLeads = await Lead.countDocuments({ is_qualified: true });
    const totalValue = await Lead.aggregate([
      { $group: { _id: null, total: { $sum: '$lead_value' } } }
    ]);

    console.log('\n📊 Database Statistics:');
    console.log(`Total Leads: ${totalLeads}`);
    console.log(`New Leads: ${newLeads}`);
    console.log(`Qualified Leads: ${qualifiedLeads}`);
    console.log(`Total Lead Value: $${totalValue[0]?.total?.toFixed(2) || 0}`);

    console.log('\n🎉 Seeding completed successfully!');
    console.log('You can now login with: demo@example.com / demo123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, generateLead, generateLeads };

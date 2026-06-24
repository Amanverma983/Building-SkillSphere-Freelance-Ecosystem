const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Models
const User = require('./models/User');
const Freelancer = require('./models/Freelancer');
const Client = require('./models/Client');
const Gig = require('./models/Gig');
const Proposal = require('./models/Proposal');
const Review = require('./models/Review');
const Payment = require('./models/Payment');

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');
  }
};

const seedData = async (isProgrammatic = false) => {
  try {
    if (!isProgrammatic) {
      await connectDB();
    }

    // Clear existing data
    await User.deleteMany({});
    await Freelancer.deleteMany({});
    await Client.deleteMany({});
    await Gig.deleteMany({});
    await Proposal.deleteMany({});
    await Review.deleteMany({});
    await Payment.deleteMany({});
    console.log('✓ Cleared existing data');

    // ─── Create Admin ───
    const admin = await User.create({
      name: 'Platform Admin',
      email: 'admin@skillsphere.com',
      password: 'Admin@123',
      role: 'admin',
      isEmailVerified: true
    });
    console.log('✓ Admin created:', admin.email);

    // ─── Create Clients ───
    const clientUsersData = [
      {
        name: 'Rahul Sharma',
        email: 'rahul@techstartup.com',
        password: 'Client@123',
        role: 'client',
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul'
      },
      {
        name: 'Priya Mehta',
        email: 'priya@digitalagency.com',
        password: 'Client@123',
        role: 'client',
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya'
      }
    ];
    const clientUsers = [];
    for (const u of clientUsersData) {
      clientUsers.push(await User.create(u));
    }
    console.log('✓ Client users created');

    const clientProfiles = await Client.insertMany([
      {
        user: clientUsers[0]._id,
        companyName: 'TechStartup Pvt Ltd',
        website: 'https://techstartup.com',
        bio: 'Fast-growing Indian SaaS company looking for top-tier freelance developers.',
        spentAmount: 45000,
        location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Connaught Place, New Delhi' }
      },
      {
        user: clientUsers[1]._id,
        companyName: 'Digital Agency Co.',
        website: 'https://digitalagency.com',
        bio: 'Full-service digital marketing agency seeking creative freelancers.',
        spentAmount: 28000,
        location: { type: 'Point', coordinates: [72.8777, 19.0760], address: 'Bandra West, Mumbai' }
      }
    ]);
    console.log('✓ Client profiles created');

    // ─── Create Freelancers ───
    const freelancerUsersData = [
      {
        name: 'Arjun Kapoor',
        email: 'arjun@devmaster.in',
        password: 'Freelancer@123',
        role: 'freelancer',
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun'
      },
      {
        name: 'Sneha Patel',
        email: 'sneha@designstudio.in',
        password: 'Freelancer@123',
        role: 'freelancer',
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneha'
      },
      {
        name: 'Vivek Rao',
        email: 'vivek@fullstack.dev',
        password: 'Freelancer@123',
        role: 'freelancer',
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vivek'
      }
    ];
    const freelancerUsers = [];
    for (const u of freelancerUsersData) {
      freelancerUsers.push(await User.create(u));
    }
    console.log('✓ Freelancer users created');

    const freelancerProfiles = await Freelancer.insertMany([
      {
        user: freelancerUsers[0]._id,
        bio: 'Senior React.js & Node.js developer with 5+ years building scalable web applications and APIs.',
        skills: [
          { name: 'React', proficiency: 'Expert' },
          { name: 'Node.js', proficiency: 'Expert' },
          { name: 'MongoDB', proficiency: 'Expert' },
          { name: 'TypeScript', proficiency: 'Intermediate' }
        ],
        hourlyRate: 1200,
        isVerified: true,
        reputationScore: 95,
        ratingAverage: 4.9,
        ratingCount: 12,
        completionRate: 97,
        profileCompletion: 90,
        publicSlug: 'arjun-kapoor-react',
        location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Lajpat Nagar, New Delhi' },
        portfolio: [
          { title: 'E-Commerce Dashboard', description: 'React + Redux admin panel', imageUrl: 'https://via.placeholder.com/400x300' },
          { title: 'Real-Time Chat App', description: 'Socket.IO chat system', imageUrl: 'https://via.placeholder.com/400x300' }
        ],
        experience: [
          { title: 'Senior Frontend Developer', company: 'Zomato', from: new Date('2020-06-01'), current: false, to: new Date('2023-04-01') }
        ],
        certifications: [
          { name: 'AWS Certified Developer', issuingOrg: 'Amazon Web Services', date: new Date('2022-03-15') }
        ]
      },
      {
        user: freelancerUsers[1]._id,
        bio: 'UI/UX Designer specialized in Figma, creating clean, intuitive user experiences for web and mobile.',
        skills: [
          { name: 'Figma', proficiency: 'Expert' },
          { name: 'UI Design', proficiency: 'Expert' },
          { name: 'Tailwind CSS', proficiency: 'Intermediate' },
          { name: 'Prototyping', proficiency: 'Expert' }
        ],
        hourlyRate: 900,
        isVerified: true,
        reputationScore: 88,
        ratingAverage: 4.7,
        ratingCount: 8,
        completionRate: 100,
        profileCompletion: 85,
        publicSlug: 'sneha-patel-ux',
        location: { type: 'Point', coordinates: [72.8777, 19.0760], address: 'Andheri East, Mumbai' }
      },
      {
        user: freelancerUsers[2]._id,
        bio: 'Full-stack MERN developer with deep expertise in scalable SaaS architecture and microservices.',
        skills: [
          { name: 'MongoDB', proficiency: 'Expert' },
          { name: 'Express.js', proficiency: 'Expert' },
          { name: 'React', proficiency: 'Intermediate' },
          { name: 'Node.js', proficiency: 'Expert' },
          { name: 'Docker', proficiency: 'Intermediate' }
        ],
        hourlyRate: 1500,
        isVerified: false,
        reputationScore: 72,
        ratingAverage: 4.2,
        ratingCount: 3,
        completionRate: 85,
        profileCompletion: 70,
        publicSlug: 'vivek-rao-fullstack',
        location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Koramangala, Bangalore' }
      }
    ]);
    console.log('✓ Freelancer profiles created');

    // ─── Create Gigs ───
    const gigs = await Gig.insertMany([
      {
        client: clientUsers[0]._id,
        title: 'React.js Developer for B2B SaaS Dashboard',
        description: 'We are building a comprehensive B2B SaaS analytics dashboard. We need an experienced React.js developer with Redux Toolkit expertise to build the frontend from scratch. Figma designs provided.',
        skills: ['React', 'Redux', 'TypeScript', 'Tailwind CSS'],
        budgetType: 'fixed',
        minBudget: 30000,
        maxBudget: 60000,
        status: 'published',
        proposalsCount: 2,
        location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Connaught Place, New Delhi' },
        milestones: [
          { title: 'UI Components Library', amount: 20000, status: 'pending' },
          { title: 'Dashboard Pages Implementation', amount: 25000, status: 'pending' },
          { title: 'Testing & Deployment', amount: 15000, status: 'pending' }
        ]
      },
      {
        client: clientUsers[1]._id,
        title: 'UI/UX Designer for Mobile App Redesign',
        description: 'Our fintech mobile app needs a complete redesign. We need a modern, clean design system in Figma covering all user flows, screens, and micro-interactions for iOS and Android.',
        skills: ['Figma', 'UI Design', 'Mobile Design', 'Prototyping'],
        budgetType: 'fixed',
        minBudget: 15000,
        maxBudget: 30000,
        status: 'in-progress',
        proposalsCount: 1,
        freelancer: freelancerUsers[1]._id,
        location: { type: 'Point', coordinates: [72.8777, 19.0760], address: 'Bandra West, Mumbai' },
        milestones: [
          { title: 'Research & Wireframes', amount: 8000, status: 'released' },
          { title: 'High-Fidelity Mockups', amount: 12000, status: 'escrow' },
          { title: 'Prototype & Handoff', amount: 10000, status: 'pending' }
        ]
      },
      {
        client: clientUsers[0]._id,
        title: 'Node.js API Developer for Microservices Platform',
        description: 'Looking for a Node.js expert to build RESTful APIs for our microservices-based e-commerce platform. Must have experience with MongoDB, JWT auth, and Redis caching.',
        skills: ['Node.js', 'Express.js', 'MongoDB', 'Docker'],
        budgetType: 'hourly',
        minBudget: 800,
        maxBudget: 1500,
        status: 'published',
        proposalsCount: 0,
        location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Sector 62, Noida' },
        milestones: []
      }
    ]);
    console.log('✓ Gigs created');

    // ─── Create Proposals ───
    const proposals = await Proposal.insertMany([
      {
        gig: gigs[0]._id,
        freelancer: freelancerUsers[0]._id,
        coverLetter: 'I have 5+ years of React.js experience and have built similar SaaS dashboards. I worked at Zomato where I built their B2B partner dashboard using React + Redux + TypeScript. I can deliver this in 45 days with clean, maintainable code.',
        bidAmount: 50000,
        duration: 45,
        status: 'pending',
        milestones: [
          { title: 'UI Components Library', amount: 18000 },
          { title: 'Dashboard Pages Implementation', amount: 22000 },
          { title: 'Testing & Deployment', amount: 10000 }
        ]
      },
      {
        gig: gigs[0]._id,
        freelancer: freelancerUsers[2]._id,
        coverLetter: 'Full-stack MERN developer here. I can handle both the React frontend and backend API integrations. My hourly rate is flexible and I commit to delivering quality work within timeline.',
        bidAmount: 45000,
        duration: 40,
        status: 'pending'
      },
      {
        gig: gigs[1]._id,
        freelancer: freelancerUsers[1]._id,
        coverLetter: 'UI/UX specialist here with proven fintech design experience. I recently redesigned two payment app UIs and have extensive Figma component library knowledge.',
        bidAmount: 28000,
        duration: 30,
        status: 'accepted'
      }
    ]);
    console.log('✓ Proposals created');

    // ─── Create Reviews ───
    const reviews = await Review.insertMany([
      {
        gig: gigs[1]._id,
        reviewer: clientUsers[1]._id,
        reviewee: freelancerUsers[1]._id,
        rating: 5,
        comment: 'Sneha delivered exceptional work! The Figma designs were pixel-perfect and she understood our brand instantly. Highly recommend.',
        role: 'client',
        verifiedContract: true
      },
      {
        gig: gigs[1]._id,
        reviewer: freelancerUsers[1]._id,
        reviewee: clientUsers[1]._id,
        rating: 4,
        comment: 'Great client to work with. Clear requirements and prompt feedback. Would work with again.',
        role: 'freelancer',
        verifiedContract: true
      }
    ]);
    console.log('✓ Reviews created');

    // ─── Create Payments ───
    const crypto = require('crypto');
    const payments = await Payment.insertMany([
      {
        client: clientUsers[1]._id,
        freelancer: freelancerUsers[1]._id,
        gig: gigs[1]._id,
        milestoneId: gigs[1].milestones[0]._id.toString(),
        amount: 8000,
        razorpayOrderId: `order_seed_${crypto.randomBytes(8).toString('hex')}`,
        razorpayPaymentId: `pay_seed_${crypto.randomBytes(8).toString('hex')}`,
        razorpaySignature: 'seed_signature_123',
        status: 'released',
        releasedAt: new Date()
      },
      {
        client: clientUsers[1]._id,
        freelancer: freelancerUsers[1]._id,
        gig: gigs[1]._id,
        milestoneId: gigs[1].milestones[1]._id.toString(),
        amount: 12000,
        razorpayOrderId: `order_seed_${crypto.randomBytes(8).toString('hex')}`,
        razorpayPaymentId: `pay_seed_${crypto.randomBytes(8).toString('hex')}`,
        razorpaySignature: 'seed_signature_456',
        status: 'escrow'
      }
    ]);
    console.log('✓ Payments created');

    console.log('\n🎉 DATABASE SEEDED SUCCESSFULLY!\n');
    console.log('=== SEED LOGIN CREDENTIALS ===');
    console.log('Admin:      admin@skillsphere.com / Admin@123');
    console.log('Client 1:   rahul@techstartup.com / Client@123');
    console.log('Client 2:   priya@digitalagency.com / Client@123');
    console.log('Freelancer: arjun@devmaster.in / Freelancer@123');
    console.log('Freelancer: sneha@designstudio.in / Freelancer@123');
    console.log('Freelancer: vivek@fullstack.dev / Freelancer@123');
    console.log('==============================\n');

    if (isProgrammatic) {
      return { success: true };
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    if (isProgrammatic) {
      throw err;
    }
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
} else {
  module.exports = seedData;
}

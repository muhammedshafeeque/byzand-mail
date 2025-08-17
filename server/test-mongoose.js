import mongoose from 'mongoose';
import { DATABASE_CONFIG } from './src/configs/index.js';
import { User } from './src/models/User.js';
import { Email } from './src/models/Email.js';
import { EmailAccount } from './src/models/EmailAccount.js';

async function testMongoose() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(DATABASE_CONFIG.URI, DATABASE_CONFIG.OPTIONS);
    console.log('✅ MongoDB connected successfully');

    // Test User model
    console.log('\n👤 Testing User model...');
    const testUser = new User({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    await testUser.save();
    console.log('✅ User created successfully');

    // Test Email model
    console.log('\n📧 Testing Email model...');
    const testEmail = new Email({
      messageId: 'test-message-123',
      from: 'sender@example.com',
      to: ['test@example.com'],
      subject: 'Test Email',
      text: 'This is a test email',
      userId: testUser._id,
      folder: 'inbox'
    });
    await testEmail.save();
    console.log('✅ Email created successfully');

    // Test EmailAccount model
    console.log('\n📬 Testing EmailAccount model...');
    const testAccount = new EmailAccount({
      userId: testUser._id,
      email: 'external@example.com',
      password: 'externalpass',
      imapHost: 'imap.example.com',
      imapPort: 993,
      imapSecure: true,
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpSecure: false
    });
    await testAccount.save();
    console.log('✅ EmailAccount created successfully');

    // Test queries
    console.log('\n🔍 Testing queries...');
    const users = await User.find({});
    const emails = await Email.find({});
    const accounts = await EmailAccount.find({});
    
    console.log(`✅ Found ${users.length} users`);
    console.log(`✅ Found ${emails.length} emails`);
    console.log(`✅ Found ${accounts.length} email accounts`);

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteOne({ email: 'test@example.com' });
    await Email.deleteOne({ messageId: 'test-message-123' });
    await EmailAccount.deleteOne({ email: 'external@example.com' });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All Mongoose tests passed!');
  } catch (error) {
    console.error('❌ Mongoose test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

testMongoose();

// Generate proper bcrypt hashes for sample users
import bcrypt from 'bcryptjs';

async function generateHashes() {
  const teacherPassword = 'teacher123';
  const adminPassword = 'admin123';
  
  const teacherHash = await bcrypt.hash(teacherPassword, 10);
  const adminHash = await bcrypt.hash(adminPassword, 10);
  
  console.log('\n=== SAMPLE USER CREDENTIALS ===');
  console.log('Teacher Account:');
  console.log('  Email: teacher@school.edu');
  console.log('  Password: teacher123');
  console.log('  Hash:', teacherHash);
  
  console.log('\nAdmin Account:');
  console.log('  Email: admin@game.com');
  console.log('  Password: admin123');
  console.log('  Hash:', adminHash);
  
  console.log('\n=== SQL UPDATE COMMANDS ===');
  console.log(`UPDATE users SET password_hash = '${teacherHash}' WHERE email = 'teacher@school.edu';`);
  console.log(`UPDATE users SET password_hash = '${adminHash}' WHERE email = 'admin@game.com';`);
  
  console.log('\n=== READY TO USE! ===');
  console.log('You can now log in with either:');
  console.log('• teacher@school.edu / teacher123');
  console.log('• admin@game.com / admin123');
}

generateHashes().catch(console.error);
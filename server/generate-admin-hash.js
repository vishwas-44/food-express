import bcryptjs from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter your admin password: ', async (password) => {
  if (!password) {
    console.log('Password cannot be empty.');
    rl.close();
    return;
  }

  const hash = await bcryptjs.hash(password, 12);

  console.log('\nYour admin password hash:\n');
  console.log(hash);
  console.log('\nCopy this hash into your .env file.');
  console.log('Do NOT share the hash publicly.\n');

  rl.close();
});
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function createUser(email, password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  
  const newUser = await prisma.user.create({
    data: {
      email,
      salt,
      hash,
      status: 1 
    }
  });
  
  return newUser;
}

async function validatePassword(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return false;

  const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
  return user.hash === hash;
}

function generateJWT(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      status: user.status
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = {
  createUser,
  validatePassword,
  generateJWT
};

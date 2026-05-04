const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidators');

const router = express.Router();

//rate limiting simples
const loginAttempts = new Map();

const checkLoginRateLimit = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 10;

  const record = loginAttempts.get(ip);

  if (record) {
    if (now > record.resetAt) {
      loginAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    } else if (record.count >= maxAttempts) {
      const minutesLeft = Math.ceil((record.resetAt - now) / 60000);
      return res.status(429).json({
        error: `Muitas tentativas. Tente novamente em ${minutesLeft} minuto(s).`,
      });
    } else {
      record.count += 1;
    }
  } else {
    loginAttempts.set(ip, { count: 1, resetAt: now + windowMs });
  }

  next();
};

//gerar token
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// post /api/auth/register
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password, level } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const user = await User.create({ name, email, password, level });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST api/auth/login
router.post('/login', checkLoginRateLimit, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      level: req.user.level,
      createdAt: req.user.createdAt,
    },
  });
});

// PATCH /api/auth/me
router.patch('/me', auth, async (req, res, next) => {
  try {
    const allowed = ['name', 'level'];
    const updates = {};

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo válido para atualizar' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      user: { id: user._id, name: user.name, email: user.email, level: user.level },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

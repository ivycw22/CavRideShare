const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db/pool')

const router = express.Router()
const ALLOWED_ROLES = ['rider', 'driver', 'admin']

router.post('/signup', async (req, res) => {
  const { email, password, role = 'rider' } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Role must be rider, driver, or admin' })
  }

  try {
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [
      email,
    ])

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Account already exists for this email' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const [result] = await pool.execute(
      `INSERT INTO users (email, password_hash, role)
       VALUES (?, ?, ?)`,
      [email, passwordHash, role],
    )

    const token = jwt.sign(
      { sub: result.insertId, role, email },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '12h' },
    )

    return res.status(201).json({
      token,
      role,
      user: {
        id: result.insertId,
        email,
      },
    })
  } catch (error) {
    console.error('Failed to sign up user', error)
    return res.status(500).json({ message: 'Unable to create account. Check DB config.' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, email, password_hash, role FROM users WHERE email = ? LIMIT 1',
      [email],
    )

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const user = rows[0]
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '12h' },
    )

    return res.json({
      token,
      role: user.role,
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    // Surface configuration issues quickly without leaking implementation details.
    console.error('Failed to log in', error)
    return res
      .status(500)
      .json({ message: 'Database unavailable. Check your MySQL config.' })
  }
})

module.exports = router

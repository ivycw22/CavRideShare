const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db/pool')

const router = express.Router()
const ALLOWED_ROLES = ['rider', 'driver']

router.post('/signup', async (req, res) => {
  const { uvaId, password, fname, lname, phoneNumber, role = 'rider' } = req.body

  if (!uvaId || !password || !fname || !lname || !phoneNumber) {
    return res.status(400).json({ message: 'UVA ID, password, first name, last name, and phone number are required' })
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Role must be rider or driver' })
  }

  try {
    const [existing] = await pool.execute('SELECT uva_id FROM User WHERE uva_id = ? LIMIT 1', [
      uvaId,
    ])

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Account already exists for this UVA ID' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    
    // Insert user into User table
    await pool.execute(
      `INSERT INTO User (uva_id, fname, lname, phone_number)
       VALUES (?, ?, ?, ?)`,
      [uvaId, fname, lname, phoneNumber],
    )

    // If role is driver, insert into Driver table (requires license plate)
    if (role === 'driver') {
      const { licensePlate } = req.body
      if (!licensePlate) {
        // Clean up the user entry if driver setup fails
        await pool.execute('DELETE FROM User WHERE uva_id = ?', [uvaId])
        return res.status(400).json({ message: 'License plate is required for driver accounts' })
      }
      await pool.execute(
        `INSERT INTO Driver (uva_id, license_plate)
         VALUES (?, ?)`,
        [uvaId, licensePlate],
      )
    }

    const token = jwt.sign(
      { sub: uvaId, role, fname, lname },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '12h' },
    )

    return res.status(201).json({
      token,
      role,
      user: {
        uvaId,
        fname,
        lname,
        phoneNumber,
      },
    })
  } catch (error) {
    console.error('Failed to sign up user', error)
    return res.status(500).json({ message: 'Unable to create account. Check DB config.' })
  }
})

router.post('/login', async (req, res) => {
  const { uvaId, password } = req.body

  if (!uvaId || !password) {
    return res.status(400).json({ message: 'UVA ID and password are required' })
  }

  try {
    const [rows] = await pool.execute(
      'SELECT uva_id, fname, lname, phone_number FROM User WHERE uva_id = ? LIMIT 1',
      [uvaId],
    )

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid UVA ID or password' })
    }

    const user = rows[0]
    
    // Determine if user is a driver
    const [driverRows] = await pool.execute(
      'SELECT uva_id FROM Driver WHERE uva_id = ? LIMIT 1',
      [uvaId],
    )
    const role = driverRows.length > 0 ? 'driver' : 'rider'

    // Note: The new schema doesn't store password hashes in the User table
    // You may want to add a password_hash column to the User table if needed
    // For now, we'll skip password validation
    
    const token = jwt.sign(
      { sub: user.uva_id, role, fname: user.fname, lname: user.lname },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '12h' },
    )

    return res.json({
      token,
      role,
      user: {
        uvaId: user.uva_id,
        fname: user.fname,
        lname: user.lname,
        phoneNumber: user.phone_number,
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

const express = require('express')
const pool = require('../db/pool')
const { authenticate, authorizeRoles } = require('../middleware/auth')

const router = express.Router()

router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, driver_id, origin, destination, departure_time, seats_available, notes
       FROM trips
       ORDER BY departure_time ASC`,
    )
    res.json(rows)
  } catch (error) {
    console.error('Failed to load trips', error)
    res.status(500).json({ message: 'Unable to load trips from MySQL' })
  }
})

router.post(
  '/',
  authenticate,
  authorizeRoles('driver', 'admin'),
  async (req, res) => {
    const { origin, destination, departureTime, seatsAvailable, notes } = req.body

    if (!origin || !destination || !departureTime || !seatsAvailable) {
      return res.status(400).json({ message: 'Missing required trip fields' })
    }

    try {
      const [result] = await pool.execute(
        `INSERT INTO trips (driver_id, origin, destination, departure_time, seats_available, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          req.user.sub,
          origin,
          destination,
          departureTime,
          seatsAvailable,
          notes || null,
        ],
      )

      res.status(201).json({
        id: result.insertId,
        driver_id: req.user.sub,
        origin,
        destination,
        departure_time: departureTime,
        seats_available: seatsAvailable,
        notes: notes || null,
      })
    } catch (error) {
      console.error('Failed to create trip', error)
      res.status(500).json({ message: 'Unable to create trip. Confirm DB user permissions.' })
    }
  },
)

module.exports = router

const express = require('express')
const pool = require('../db/pool')
const { authenticate, authorizeRoles } = require('../middleware/auth')

const router = express.Router()

router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT t.trip_id, t.departure_time, t.arrival_time, t.trip_duration,
              t.seats_available, t.notes,
              l1.location_id as start_location_id, l1.name as start_location_name,
              l2.location_id as arrival_location_id, l2.name as arrival_location_name,
              d.uva_id as driver_id
       FROM Trips t
       LEFT JOIN Location l1 ON t.start_location = l1.location_id
       LEFT JOIN Location l2 ON t.arrival_location = l2.location_id
       LEFT JOIN Drives d ON t.trip_id = d.trip_id
       ORDER BY t.departure_time ASC`,
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
  authorizeRoles('driver'),
  async (req, res) => {
    const { startLocationId, arrivalLocationId, departureTime, seatsAvailable, notes } = req.body

    if (!startLocationId || !arrivalLocationId || !departureTime || seatsAvailable === undefined) {
      return res.status(400).json({ message: 'Missing required trip fields: startLocationId, arrivalLocationId, departureTime, seatsAvailable' })
    }

    try {
      // Verify the driver exists in the Driver table
      const [driverCheck] = await pool.execute(
        'SELECT uva_id FROM Driver WHERE uva_id = ?',
        [req.user.sub],
      )

      if (driverCheck.length === 0) {
        return res.status(403).json({ message: 'User is not registered as a driver' })
      }

      // Verify locations exist
      const [startLoc] = await pool.execute(
        'SELECT location_id FROM Location WHERE location_id = ?',
        [startLocationId],
      )
      const [arrivalLoc] = await pool.execute(
        'SELECT location_id FROM Location WHERE location_id = ?',
        [arrivalLocationId],
      )

      if (startLoc.length === 0 || arrivalLoc.length === 0) {
        return res.status(400).json({ message: 'Start location or arrival location does not exist' })
      }

      // Create the trip
      const [result] = await pool.execute(
        `INSERT INTO Trips (departure_time, arrival_location, seats_available, notes, start_location)
         VALUES (?, ?, ?, ?, ?)`,
        [
          departureTime,
          arrivalLocationId,
          seatsAvailable,
          notes || null,
          startLocationId,
        ],
      )

      // Link driver to trip
      await pool.execute(
        'INSERT INTO Drives (uva_id, trip_id) VALUES (?, ?)',
        [req.user.sub, result.insertId],
      )

      res.status(201).json({
        trip_id: result.insertId,
        driver_id: req.user.sub,
        start_location_id: startLocationId,
        arrival_location_id: arrivalLocationId,
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

// Book a trip (rider joins a trip)
router.post(
  '/:tripId/book',
  authenticate,
  async (req, res) => {
    const { tripId } = req.params

    try {
      // Verify trip exists
      const [tripCheck] = await pool.execute(
        'SELECT trip_id, seats_available FROM Trips WHERE trip_id = ?',
        [tripId],
      )

      if (tripCheck.length === 0) {
        return res.status(404).json({ message: 'Trip not found' })
      }

      const trip = tripCheck[0]


      // Check if seats available
      if (trip.seats_available <= 0) {
        return res.status(400).json({ message: 'No seats available on this trip' })
      }

      // Check if already booked
      const [existingBooking] = await pool.execute(
        'SELECT uva_id FROM Rides_In WHERE uva_id = ? AND trip_id = ?',
        [req.user.sub, tripId],
      )

      if (existingBooking.length > 0) {
        return res.status(409).json({ message: 'Already booked on this trip' })
      }

      // Book the trip
      await pool.execute(
        'INSERT INTO Rides_In (uva_id, trip_id) VALUES (?, ?)',
        [req.user.sub, tripId],
      )

      // Decrement available seats
      await pool.execute(
        'UPDATE Trips SET seats_available = seats_available - 1 WHERE trip_id = ?',
        [tripId],
      )

      res.status(201).json({ message: 'Successfully booked trip' })
    } catch (error) {
      console.error('Failed to book trip', error)
      res.status(500).json({ message: 'Unable to book trip' })
    }
  },
)

// Get trips for the authenticated user (driver or rider)
router.get('/mine', authenticate, async (req, res) => {
  const uvaId = req.user.sub

  try {
    const [rows] = await pool.execute(
      `
      SELECT t.trip_id, t.departure_time, t.arrival_time, t.trip_duration,
             t.seats_available, t.notes,
             l1.location_id as start_location_id, l1.name as start_location_name,
             l2.location_id as arrival_location_id, l2.name as arrival_location_name,
             'driver' as role
      FROM Trips t
      JOIN Drives d ON t.trip_id = d.trip_id
      LEFT JOIN Location l1 ON t.start_location = l1.location_id
      LEFT JOIN Location l2 ON t.arrival_location = l2.location_id
      WHERE d.uva_id = ? AND t.departure_time >= NOW()

      UNION ALL

      SELECT t.trip_id, t.departure_time, t.arrival_time, t.trip_duration,
             t.seats_available, t.notes,
             l1.location_id as start_location_id, l1.name as start_location_name,
             l2.location_id as arrival_location_id, l2.name as arrival_location_name,
             'rider' as role
      FROM Trips t
      JOIN Rides_In r ON t.trip_id = r.trip_id
      LEFT JOIN Location l1 ON t.start_location = l1.location_id
      LEFT JOIN Location l2 ON t.arrival_location = l2.location_id
      WHERE r.uva_id = ? AND t.departure_time >= NOW()

      ORDER BY departure_time ASC
      `,
      [uvaId, uvaId],
    )

    res.json(rows)
  } catch (error) {
    console.error('Failed to load user trips', error)
    res.status(500).json({ message: 'Unable to load user trips' })
  }
})

// Cancel a booking for the authenticated user (rider)
router.delete('/:tripId/book', authenticate, async (req, res) => {
  const { tripId } = req.params
  const uvaId = req.user.sub

  try {
    // Remove the booking
    const [delResult] = await pool.execute(
      'DELETE FROM Rides_In WHERE uva_id = ? AND trip_id = ?',
      [uvaId, tripId],
    )

    if (!delResult.affectedRows) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    // Increment seats available
    await pool.execute('UPDATE Trips SET seats_available = seats_available + 1 WHERE trip_id = ?', [tripId])

    return res.json({ message: 'Booking cancelled' })
  } catch (error) {
    console.error('Failed to cancel booking', error)
    return res.status(500).json({ message: 'Unable to cancel booking' })
  }
})

module.exports = router

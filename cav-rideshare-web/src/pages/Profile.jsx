import { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

function Profile() {
  const [trips, setTrips] = useState([])
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const [cancelingTripId, setCancelingTripId] = useState(null)

  useEffect(() => {
    const fetchTrips = async () => {
      setStatus({ state: 'loading', message: 'Loading your upcoming trips...' })
      const token = localStorage.getItem('cavrideshare_token')
      if (!token) {
        setStatus({ state: 'error', message: 'You must be logged in to view your profile.' })
        return
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/trips/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.message || 'Failed to fetch trips')
        }
        const data = await res.json()
        setTrips(data)
        setStatus({ state: 'success', message: '' })
      } catch (err) {
        setStatus({ state: 'error', message: err.message })
      }
    }

    fetchTrips()
  }, [])

  const cancelBooking = async (tripId) => {
    const token = localStorage.getItem('cavrideshare_token')
    if (!token) {
      setStatus({ state: 'error', message: 'You must be logged in to cancel a booking.' })
      return
    }

    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      setCancelingTripId(tripId)
      setStatus({ state: 'loading', message: 'Cancelling booking...' })
      const res = await fetch(`${API_BASE_URL}/api/trips/${tripId}/book`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Failed to cancel booking')
      }

      // Remove the cancelled trip from the UI
      setTrips((prev) => prev.filter((t) => !(t.trip_id === tripId && t.role === 'rider')))
      setStatus({ state: 'success', message: 'Booking cancelled.' })
    } catch (err) {
      setStatus({ state: 'error', message: err.message })
    } finally {
      setCancelingTripId(null)
    }
  }

  return (
    <section className="profile-page">
      <div className="card">
        <h1>Your Profile</h1>
        <p>Upcoming trips where you are a driver or a rider.</p>

        {status.state === 'loading' && <p className="status loading">{status.message}</p>}
        {status.state === 'error' && <p className="status error">{status.message}</p>}

        {status.state === 'success' && trips.length === 0 && (
          <p>You have no upcoming trips.</p>
        )}

        {trips.length > 0 && (
          <ul className="trip-list">
            {trips.map((t) => (
              <li key={t.trip_id} className="trip-item">
                <div className="trip-header">
                  <strong>{t.role.toUpperCase()}</strong>
                  <span className="trip-time">{new Date(t.departure_time).toLocaleString()}</span>
                  {t.role === 'rider' && (
                    <button
                      className="secondary-btn"
                      type="button"
                      onClick={() => cancelBooking(t.trip_id)}
                      disabled={cancelingTripId === t.trip_id}
                      style={{ marginLeft: '1rem' }}
                    >
                      {cancelingTripId === t.trip_id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
                <div className="trip-body">
                  <div>
                    <strong>From:</strong> {t.start_location_name || 'Unknown'}
                  </div>
                  <div>
                    <strong>To:</strong> {t.arrival_location_name || 'Unknown'}
                  </div>
                  <div>
                    <strong>Seats available:</strong> {t.seats_available}
                  </div>
                  {t.notes && (
                    <div>
                      <strong>Notes:</strong> {t.notes}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default Profile

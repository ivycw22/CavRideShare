import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatLocalDateTime, formatLocalDateTimeForInput, formatLocalDateTimeWithTimezone } from '../utils/dateTime'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

function Profile() {
  const [trips, setTrips] = useState([])
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const [cancelingTripId, setCancelingTripId] = useState(null)
  const [deletingTripId, setDeletingTripId] = useState(null)
  const [editingTripId, setEditingTripId] = useState(null)
  const [editData, setEditData] = useState({})
  const [activeTab, setActiveTab] = useState('upcoming')
  const navigate = useNavigate()

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

      setTrips((prev) => prev.filter((t) => !(t.trip_id === tripId && t.role === 'rider')))
      setStatus({ state: 'success', message: 'Booking cancelled.' })
    } catch (err) {
      setStatus({ state: 'error', message: err.message })
    } finally {
      setCancelingTripId(null)
    }
  }

  const startEditing = (trip) => {
    setEditingTripId(trip.trip_id)
    setEditData({
      startLocationId: trip.start_location_id,
      arrivalLocationId: trip.arrival_location_id,
      seatsAvailable: trip.seats_available,
      notes: trip.notes || '',
      departureTime: formatLocalDateTimeForInput(trip.departure_time),
    })
  }

  const saveTrip = async (tripId) => {
    const token = localStorage.getItem('cavrideshare_token')
    if (!token) {
      setStatus({ state: 'error', message: 'You must be logged in to edit a trip.' })
      return
    }

    try {
      setStatus({ state: 'loading', message: 'Saving trip...' })
      const res = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startLocationId: editData.startLocationId,
          arrivalLocationId: editData.arrivalLocationId,
          seatsAvailable: editData.seatsAvailable,
          notes: editData.notes,
          departureTime: editData.departureTime,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Failed to save trip')
      }

      setTrips((prev) =>
        prev.map((t) =>
          t.trip_id === tripId
            ? {
                ...t,
                seats_available: editData.seatsAvailable,
                notes: editData.notes,
                departure_time: editData.departureTime,
              }
            : t,
        ),
      )
      setEditingTripId(null)
      setStatus({ state: 'success', message: 'Trip updated successfully.' })
    } catch (err) {
      setStatus({ state: 'error', message: err.message })
    }
  }

  const deleteTrip = async (tripId) => {
    const token = localStorage.getItem('cavrideshare_token')
    if (!token) {
      setStatus({ state: 'error', message: 'You must be logged in to delete a trip.' })
      return
    }

    if (!window.confirm('Are you sure you want to delete this trip?')) return

    try {
      setDeletingTripId(tripId)
      setStatus({ state: 'loading', message: 'Deleting trip...' })
      const res = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Failed to delete trip')
      }

      setTrips((prev) => prev.filter((t) => t.trip_id !== tripId))
      setStatus({ state: 'success', message: 'Trip deleted successfully.' })
    } catch (err) {
      setStatus({ state: 'error', message: err.message })
    } finally {
      setDeletingTripId(null)
    }
  }

  const upcomingTrips = trips.filter((t) => new Date(t.departure_time) > new Date())
  const pastTrips = trips.filter((t) => new Date(t.departure_time) <= new Date())

  return (
    <section className="profile-page">
      <div className="card">
        <h1>Your Profile</h1>
        
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Trips ({upcomingTrips.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Trips ({pastTrips.length})
          </button>
        </div>

        {status.state === 'loading' && <p className="status loading">{status.message}</p>}
        {status.state === 'error' && <p className="status error">{status.message}</p>}

        {activeTab === 'upcoming' && (
          <>
            {status.state === 'success' && upcomingTrips.length === 0 && (
              <p>You have no upcoming trips.</p>
            )}

            {upcomingTrips.length > 0 && (
              <ul className="trip-list">
                {upcomingTrips.map((t) => (
              <li key={t.trip_id} className="trip-item">
                <div className="trip-header">
                  <strong>{t.role.toUpperCase()}</strong>
                  <span className="trip-time">{formatLocalDateTimeWithTimezone(t.departure_time)}</span>
                  <div style={{ marginLeft: '1rem', display: 'flex', gap: '0.5rem' }}>
                    {t.role === 'rider' && (
                      <button
                        className="secondary-btn"
                        type="button"
                        onClick={() => cancelBooking(t.trip_id)}
                        disabled={cancelingTripId === t.trip_id}
                      >
                        {cancelingTripId === t.trip_id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                    {t.role === 'driver' && !editingTripId && (
                      <>
                        <button
                          className="secondary-btn"
                          type="button"
                          onClick={() => startEditing(t)}
                        >
                          Edit
                        </button>
                        <button
                          className="secondary-btn danger"
                          type="button"
                          onClick={() => deleteTrip(t.trip_id)}
                          disabled={deletingTripId === t.trip_id}
                        >
                          {deletingTripId === t.trip_id ? 'Deleting...' : 'Delete'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {editingTripId === t.trip_id ? (
                  <div className="trip-body edit-form">
                    <div>
                      <label>
                        <strong>Departure Time:</strong>
                        <input
                          type="datetime-local"
                          value={editData.departureTime || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, departureTime: e.target.value })
                          }
                        />
                      </label>
                    </div>
                    <div>
                      <label>
                        <strong>Seats Available:</strong>
                        <input
                          type="number"
                          min="1"
                          value={editData.seatsAvailable || 0}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              seatsAvailable: parseInt(e.target.value, 10),
                            })
                          }
                        />
                      </label>
                    </div>
                    <div>
                      <label>
                        <strong>Notes:</strong>
                        <textarea
                          value={editData.notes || ''}
                          onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                        />
                      </label>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button
                        className="primary-btn"
                        type="button"
                        onClick={() => saveTrip(t.trip_id)}
                      >
                        Save
                      </button>
                      <button
                        className="secondary-btn"
                        type="button"
                        onClick={() => setEditingTripId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
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
                )}
              </li>
            ))}
          </ul>
            )}
          </>
        )}

        {activeTab === 'past' && (
          <>
            {status.state === 'success' && pastTrips.length === 0 && (
              <p>You have no past trips.</p>
            )}

            {pastTrips.length > 0 && (
              <ul className="trip-list">
                {pastTrips.map((t) => (
                  <li key={t.trip_id} className="trip-item">
                    <div className="trip-header">
                      <strong>{t.role.toUpperCase()}</strong>
                      <span className="trip-time">{formatLocalDateTimeWithTimezone(t.departure_time)}</span>
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
          </>
        )}
      </div>
    </section>
  )
}

export default Profile


import { useMemo, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

const initialTripPayload = {
  origin: '',
  destination: '',
  departureTime: '',
  seatsAvailable: 1,
  notes: '',
}

function Home() {
  const [isFormVisible, setFormVisible] = useState(false)
  const [tripPayload, setTripPayload] = useState(initialTripPayload)
  const [tripStatus, setTripStatus] = useState({ state: 'idle', message: '' })

  const heroCTA = useMemo(
    () => ({
      title: 'Share the ride, cut the cost.',
      subtitle:
        'Post a trip, pick up classmates, and get to Grounds faster with CavRideShare.',
      actions: [
        { label: 'New Trip', primary: true },
        { label: 'Log In', href: '/login', primary: false },
        { label: 'Sign Up', href: '/signup', primary: false },
      ],
    }),
    [],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setTripPayload((prev) => ({
      ...prev,
      [name]: name === 'seatsAvailable' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTripStatus({ state: 'loading', message: 'Creating trip...' })

    const storedToken = localStorage.getItem('cavrideshare_token')

    if (!storedToken) {
      setTripStatus({
        state: 'error',
        message: 'Log in first so we can attach your token.',
      })
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify(tripPayload),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody.message || 'Unable to create trip')
      }

      setTripPayload(initialTripPayload)
      setTripStatus({ state: 'success', message: 'Trip created!' })
      setFormVisible(false)
    } catch (error) {
      setTripStatus({
        state: 'error',
        message: error.message || 'Unexpected error',
      })
    }
  }

  return (
    <section className="home">
      <div className="hero-card">
        <p className="hero-kicker">Ride smarter</p>
        <h1>{heroCTA.title}</h1>
        <p className="hero-subtitle">{heroCTA.subtitle}</p>
        <div className="hero-actions">
          <button
            className="primary-btn"
            onClick={() => setFormVisible((prev) => !prev)}
          >
            {isFormVisible ? 'Close Trip Form' : heroCTA.actions[0].label}
          </button>
          <a className="secondary-btn" href={heroCTA.actions[1].href}>
            {heroCTA.actions[1].label}
          </a>
          <a className="secondary-btn" href={heroCTA.actions[2].href}>
            {heroCTA.actions[2].label}
          </a>
        </div>
      </div>

      {isFormVisible && (
        <form className="trip-form" onSubmit={handleSubmit}>
          <h2>New Trip</h2>
          <label>
            Origin
            <input
              name="origin"
              placeholder="UVA Library"
              required
              value={tripPayload.origin}
              onChange={handleChange}
            />
          </label>
          <label>
            Destination
            <input
              name="destination"
              placeholder="Downtown Mall"
              required
              value={tripPayload.destination}
              onChange={handleChange}
            />
          </label>
          <label>
            Departure Time
            <input
              type="datetime-local"
              name="departureTime"
              required
              value={tripPayload.departureTime}
              onChange={handleChange}
            />
          </label>
          <label>
            Seats Available
            <input
              type="number"
              min="1"
              max="8"
              name="seatsAvailable"
              required
              value={tripPayload.seatsAvailable}
              onChange={handleChange}
            />
          </label>
          <label>
            Notes
            <textarea
              name="notes"
              placeholder="Detour? Parking info? Playlist requests?"
              rows="3"
              value={tripPayload.notes}
              onChange={handleChange}
            />
          </label>

          <button
            className="primary-btn"
            type="submit"
            disabled={tripStatus.state === 'loading'}
          >
            {tripStatus.state === 'loading' ? 'Submitting...' : 'Launch Trip'}
          </button>

          {tripStatus.state !== 'idle' && (
            <p className={`status ${tripStatus.state}`}>{tripStatus.message}</p>
          )}
        </form>
      )}
    </section>
  )
}

export default Home

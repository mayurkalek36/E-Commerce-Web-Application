import { createContext, useContext, useEffect, useState } from 'react'

const LocationContext = createContext(null)

const DEFAULT_LOCATION = { label: 'Select location', pincode: '' }

export function LocationProvider({ children }) {
  const [location, setLocationState] = useState(() => {
    const saved = localStorage.getItem('shopstack_location')
    return saved ? JSON.parse(saved) : DEFAULT_LOCATION
  })
  const [status, setStatus] = useState('idle')

  function setLocation(loc) {
    setLocationState(loc)
    localStorage.setItem('shopstack_location', JSON.stringify(loc))
  }

  async function detectLocation() {
    if (!navigator.geolocation) {
      setStatus('error')
      return
    }
    setStatus('detecting')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )
          const data = await res.json()
          const label = data.locality || data.city || data.principalSubdivision || 'Current location'
          const pincode = data.postcode || ''
          setLocation({ label, pincode, lat: latitude, lng: longitude })
          setStatus('done')
        } catch (e) {
          setStatus('error')
        }
      },
      () => {
        setStatus('denied')
      },
      { timeout: 8000 }
    )
  }

  useEffect(() => {
    const saved = localStorage.getItem('shopstack_location')
    if (!saved) detectLocation()
  }, [])

  return (
    <LocationContext.Provider value={{ location, setLocation, detectLocation, status }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocationContext() {
  return useContext(LocationContext)
}
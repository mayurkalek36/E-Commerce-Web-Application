import { useState } from 'react'
import { useLocationContext } from '../context/LocationContext'

export default function LocationPicker() {
  const { location, setLocation, detectLocation, status } = useLocationContext()
  const [open, setOpen] = useState(false)
  const [pincode, setPincode] = useState('')
  const [lookupError, setLookupError] = useState('')
  const [looking, setLooking] = useState(false)

  async function handlePincodeSubmit(e) {
    e.preventDefault()
    if (!/^\d{6}$/.test(pincode)) {
      setLookupError('Enter a valid 6-digit pincode')
      return
    }
    setLooking(true)
    setLookupError('')
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      const data = await res.json()
      const po = data?.[0]?.PostOffice?.[0]
      if (!po) {
        setLookupError('Pincode not found')
        return
      }
      setLocation({ label: `${po.District}`, pincode })
      setOpen(false)
      setPincode('')
    } catch (e) {
      setLookupError('Could not look up that pincode right now')
    } finally {
      setLooking(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className="item" onClick={() => setOpen(o => !o)}>
        <small><i className="fa-solid fa-location-dot"></i> Deliver to</small>
        <strong>
          {status === 'detecting' ? 'Detecting…' : location.label}{location.pincode ? ` ${location.pincode}` : ''}
        </strong>
      </div>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: '110%', right: 0, zIndex: 999,
            background: '#fff', color: '#151A21', width: 280, borderRadius: 8,
            boxShadow: '0 10px 30px rgba(0,0,0,.25)', padding: 16
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Choose your location</div>

            <button
              className="btn-outline"
              style={{ width: '100%', marginBottom: 12 }}
              onClick={detectLocation}
              disabled={status === 'detecting'}
            >
              <i className="fa-solid fa-crosshairs"></i>&nbsp; {status === 'detecting' ? 'Detecting…' : 'Use my current location'}
            </button>
            {status === 'denied' && <div style={{ fontSize: 11, color: '#C4331F', marginBottom: 10 }}>Location access denied — enter a pincode below instead.</div>}
            {status === 'error' && <div style={{ fontSize: 11, color: '#C4331F', marginBottom: 10 }}>Couldn't detect location — enter a pincode below instead.</div>}

            <div style={{ fontSize: 11, color: '#5B6572', margin: '10px 0 6px' }}>Or enter a pincode</div>
            <form onSubmit={handlePincodeSubmit} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="e.g. 411045"
                value={pincode}
                onChange={e => setPincode(e.target.value)}
                maxLength={6}
                style={{ flex: 1, padding: 8, border: '1px solid var(--line)', borderRadius: 5, fontSize: 12.5 }}
              />
              <button className="btn-primary" type="submit" disabled={looking}>{looking ? '…' : 'Apply'}</button>
            </form>
            {lookupError && <div style={{ fontSize: 11, color: '#C4331F', marginTop: 8 }}>{lookupError}</div>}
          </div>
        </>
      )}
    </div>
  )
}
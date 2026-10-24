import { MapPin, Navigation, Truck } from 'lucide-react'

type TowGoMapProps = {
  compact?: boolean
}

export default function TowGoMap({ compact = false }: TowGoMapProps) {
  return (
    <div className={`towgo-map ${compact ? 'towgo-map--compact' : ''}`} aria-label="Map showing your driver travelling to your location in Sandton">
      <svg className="towgo-map__drawing" viewBox="0 0 700 470" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="700" height="470" fill="#E8E9E1" />
        <g fill="#DDE4D5">
          <path d="M0 0h196l-28 106L0 135Z" />
          <path d="m489 0 211 0v116l-161 26Z" />
          <path d="m0 336 180-42 63 176H0Z" />
          <path d="m498 309 202-51v212H543Z" />
        </g>
        <g fill="#F4F3ED" stroke="#D6D8CF" strokeWidth="1">
          <path d="m44 44 88-14 13 54-91 19Z" />
          <path d="m233 26 108 10-8 69-112-4Z" />
          <path d="m415 57 87-19 19 67-91 25Z" />
          <path d="m560 151 102-14 9 72-114 7Z" />
          <path d="m48 194 96-14 16 82-110 8Z" />
          <path d="m219 166 105-4 4 81-105 13Z" />
          <path d="m397 191 85-17 20 75-96 22Z" />
          <path d="m264 321 108-8 9 93-116 8Z" />
          <path d="m67 343 102-17 19 80-112 19Z" />
          <path d="m473 342 95-14 20 86-105 15Z" />
        </g>
        <g fill="none" stroke="#FFFFFF" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-20 307 148 288l125-78 137 26 104-75 206-29" />
          <path d="M180-20 193 118l-21 136 53 236" />
          <path d="M377-20 363 112l46 124-33 254" />
          <path d="M-20 119 149 137l168-29 163 32 240-4" />
        </g>
        <g fill="none" stroke="#CFD2C8" strokeWidth="1.5" strokeDasharray="5 7">
          <path d="M-20 307 148 288l125-78 137 26 104-75 206-29" />
          <path d="M180-20 193 118l-21 136 53 236" />
          <path d="M377-20 363 112l46 124-33 254" />
        </g>
        <path d="M199 394c23-54 19-105 74-145 42-31 100 2 136-13 46-19 58-67 105-76" fill="none" stroke="#173F35" strokeWidth="6" strokeLinecap="round" strokeDasharray="2 12" />
        <g fill="#91998B" fontFamily="Manrope, sans-serif" fontSize="12" fontWeight="600">
          <text x="34" y="164">Randburg</text>
          <text x="474" y="103">Sandton</text>
          <text x="450" y="300">Morningside</text>
          <text x="69" y="312">Rosebank</text>
          <text x="250" y="142" transform="rotate(-7 250 142)">Grayston Drive</text>
          <text x="390" y="332" transform="rotate(96 390 332)">Rivonia Road</text>
        </g>
      </svg>
      <div className="map-driver" aria-hidden="true"><Truck size={20} strokeWidth={2.3} /></div>
      <div className="map-destination" aria-hidden="true"><MapPin size={22} fill="currentColor" /></div>
      {!compact && (
        <>
          <div className="map-eta"><Navigation size={15} fill="currentColor" /><span><strong>8 min</strong> away</span></div>
          <div className="map-status"><span className="live-dot" /> Live trip</div>
        </>
      )}
    </div>
  )
}

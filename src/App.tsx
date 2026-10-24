import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  BatteryCharging,
  CarFront,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Clock3,
  CreditCard,
  Disc3,
  Fuel,
  Headphones,
  KeyRound,
  LocateFixed,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Phone,
  Play,
  Send,
  Share2,
  ShieldCheck,
  Star,
  Truck,
  UserRound,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Logo from './components/Logo'
import TowGoMap from './components/TowGoMap'

type Service = {
  id: string
  name: string
  shortName: string
  description: string
  price: number
  eta: string
  icon: LucideIcon
  tone: string
}

type ActiveRequest = {
  id: string
  serviceId: string
  location: string
  destination: string
  price: number
  eta: number
}

type User = {
  name: string
  phone: string
}

type ChatMessage = {
  from: 'driver' | 'customer'
  text: string
}

const services: Service[] = [
  {
    id: 'tow',
    name: 'Emergency towing',
    shortName: 'Tow truck',
    description: 'Safe, secure transport for your vehicle—wherever it needs to go.',
    price: 950,
    eta: '20–30 min',
    icon: Truck,
    tone: 'orange',
  },
  {
    id: 'jump',
    name: 'Jump start',
    shortName: 'Jump start',
    description: 'A quick boost from a trained pro to get your engine going again.',
    price: 450,
    eta: '15–25 min',
    icon: BatteryCharging,
    tone: 'green',
  },
  {
    id: 'tyre',
    name: 'Flat tyre',
    shortName: 'Tyre change',
    description: 'We’ll fit your spare or help you find the nearest tyre specialist.',
    price: 550,
    eta: '20–30 min',
    icon: Disc3,
    tone: 'blue',
  },
  {
    id: 'fuel',
    name: 'Fuel delivery',
    shortName: 'Fuel delivery',
    description: 'Enough petrol or diesel brought to you to reach the nearest station.',
    price: 650,
    eta: '20–35 min',
    icon: Fuel,
    tone: 'yellow',
  },
  {
    id: 'lockout',
    name: 'Car lockout',
    shortName: 'Lockout help',
    description: 'Locked your keys inside? We’ll help you get back in without the stress.',
    price: 600,
    eta: '20–30 min',
    icon: KeyRound,
    tone: 'purple',
  },
  {
    id: 'battery',
    name: 'Battery replacement',
    shortName: 'New battery',
    description: 'On-the-spot battery testing and replacement, with no workshop visit.',
    price: 850,
    eta: '25–40 min',
    icon: Zap,
    tone: 'green',
  },
]

const faqs = [
  {
    question: 'How quickly can a TowGo operator reach me?',
    answer: 'Most drivers in our Gauteng coverage area are reached within 20–35 minutes. Your exact estimate appears before you confirm, and you can follow your operator live once they are on the way.',
  },
  {
    question: 'Will I know the price before I book?',
    answer: 'Always. We show your call-out price upfront before you confirm. If your situation changes, your operator will explain any difference and get your approval first—no surprise charges.',
  },
  {
    question: 'Do I need a membership or subscription?',
    answer: 'No. TowGo is pay-as-you-need-it. Request help once or save your details for faster requests in future. There are no monthly membership fees.',
  },
  {
    question: 'Which areas do you cover?',
    answer: 'We currently serve Johannesburg, Sandton, Randburg, Roodepoort, Soweto, Midrand, Pretoria, Centurion and Ekurhuleni, with more South African cities coming soon.',
  },
  {
    question: 'How do I pay for my assistance?',
    answer: 'You can pay securely by card in the app or pay your operator directly in cash. You will only be charged after the service is complete, and a digital receipt is saved to your account.',
  },
]

const formatPrice = (price: number) => `R ${price.toLocaleString('en-ZA')}`

function Modal({ children, onClose, className = '', label }: { children: ReactNode; onClose: () => void; className?: string; label: string }) {
  const dialogRef = useRef<HTMLElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
        {children}
      </section>
    </div>
  )
}

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingStep, setBookingStep] = useState(1)
  const [selectedService, setSelectedService] = useState('tow')
  const [quickService, setQuickService] = useState('tow')
  const [location, setLocation] = useState('Sandton, Johannesburg')
  const [destination, setDestination] = useState('')
  const [vehicle, setVehicle] = useState('Toyota Hilux • 2022')
  const [notes, setNotes] = useState('')
  const [payment, setPayment] = useState<'card' | 'cash'>('card')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [formError, setFormError] = useState('')
  const [activeRequest, setActiveRequest] = useState<ActiveRequest | null>(null)
  const [trackingOpen, setTrackingOpen] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [messageDraft, setMessageDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: 'driver', text: 'Hi, I’m Sipho. I’m on my way to you now. Please stay somewhere safe.' },
  ])
  const [authOpen, setAuthOpen] = useState(false)
  const [authName, setAuthName] = useState('')
  const [authPhone, setAuthPhone] = useState('')
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('towgo-user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [toast, setToast] = useState('')
  const [openFaq, setOpenFaq] = useState(0)
  const [coverageQuery, setCoverageQuery] = useState('')
  const [coverageResult, setCoverageResult] = useState<boolean | null>(null)

  const service = services.find((item) => item.id === selectedService) ?? services[0]

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 4000)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const startBooking = (serviceId = selectedService, step = 1) => {
    setSelectedService(serviceId)
    setQuickService(serviceId)
    setBookingStep(step)
    setFormError('')
    setBookingOpen(true)
    setMobileOpen(false)
  }

  const openTracking = () => {
    setTrackingOpen(true)
    setMobileOpen(false)
    setCancelConfirm(false)
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setToast('Location is not supported here. Please enter your address instead.')
      return
    }
    setToast('Finding your current location…')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(5)
        const lng = position.coords.longitude.toFixed(5)
        setLocation(`Current location (${lat}, ${lng})`)
        setToast('Current location added to your request.')
      },
      () => setToast('We couldn’t access your location. Please enter your address.'),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  const nextBookingStep = () => {
    setFormError('')
    if (bookingStep === 2) {
      if (!location.trim()) {
        setFormError('Add a pickup location so we know where to find you.')
        return
      }
      if (selectedService === 'tow' && !destination.trim()) {
        setFormError('Add a destination for your vehicle.')
        return
      }
    }
    setBookingStep((step) => Math.min(step + 1, 3))
  }

  const confirmRequest = (event: FormEvent) => {
    event.preventDefault()
    if (!contactName.trim() || contactPhone.replace(/\D/g, '').length < 9) {
      setFormError('Please add your name and a valid contact number.')
      return
    }
    const request = {
      id: `TG-${Math.floor(10000 + Math.random() * 90000)}`,
      serviceId: selectedService,
      location,
      destination,
      price: service.price,
      eta: 8,
    }
    setActiveRequest(request)
    setBookingOpen(false)
    setFormError('')
    setContactName(contactName.trim())
    openTracking()
    setToast('Request confirmed. Sipho is on the way!')
  }

  const cancelRequest = () => {
    setActiveRequest(null)
    setTrackingOpen(false)
    setCancelConfirm(false)
    setChatOpen(false)
    setToast('Your request has been cancelled. No charge was made.')
  }

  const shareTrip = async () => {
    const text = `Follow my TowGo request ${activeRequest?.id ?? ''}. Sipho is on the way and should arrive in about 8 minutes.`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My TowGo trip', text })
      } else {
        await navigator.clipboard.writeText(text)
        setToast('Trip details copied to your clipboard.')
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') setToast('Trip sharing is not available in this browser.')
    }
  }

  const sendMessage = (event: FormEvent) => {
    event.preventDefault()
    const text = messageDraft.trim()
    if (!text) return
    setMessages((current) => [...current, { from: 'customer', text }])
    setMessageDraft('')
    window.setTimeout(() => {
      setMessages((current) => [...current, { from: 'driver', text: 'Got it, thanks. I’ll see you shortly.' }])
    }, 900)
  }

  const handleAuth = (event: FormEvent) => {
    event.preventDefault()
    if (!authName.trim() || authPhone.replace(/\D/g, '').length < 9) return
    const nextUser = { name: authName.trim(), phone: authPhone.trim() }
    setUser(nextUser)
    setContactName(nextUser.name)
    setContactPhone(nextUser.phone)
    localStorage.setItem('towgo-user', JSON.stringify(nextUser))
    setAuthOpen(false)
    setToast(`Welcome to TowGo, ${nextUser.name.split(' ')[0]}!`)
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('towgo-user')
    setAuthOpen(false)
    setToast('You’ve been signed out.')
  }

  const checkCoverage = (event: FormEvent) => {
    event.preventDefault()
    const coveredAreas = ['johannesburg', 'sandton', 'randburg', 'roodepoort', 'soweto', 'midrand', 'pretoria', 'centurion', 'ekurhuleni', 'benoni', 'boksburg', 'germiston', 'kempton park', 'tembisa', 'gauteng']
    setCoverageResult(coveredAreas.some((area) => coverageQuery.toLowerCase().includes(area)))
  }

  const closeMobileAndScroll = () => setMobileOpen(false)

  return (
    <div className="app-shell">
      <div className="service-ribbon">
        <div className="container service-ribbon__inner">
          <span><span className="live-dot" /> Roadside help, 24 hours a day</span>
          <a href="tel:+27100204477"><Phone size={13} /> Emergency line: <strong>010 020 4477</strong></a>
        </div>
      </div>

      <header className="site-header">
        <div className="container header__inner">
          <a href="#top" className="header__logo" onClick={closeMobileAndScroll}><Logo /></a>
          <nav className={`main-nav ${mobileOpen ? 'main-nav--open' : ''}`} aria-label="Main navigation">
            <a href="#services" onClick={closeMobileAndScroll}>Services</a>
            <a href="#how-it-works" onClick={closeMobileAndScroll}>How it works</a>
            <a href="#coverage" onClick={closeMobileAndScroll}>Coverage</a>
            <a href="#why-towgo" onClick={closeMobileAndScroll}>Why TowGo</a>
            <div className="mobile-nav__actions">
              <button className="button button--primary" onClick={() => activeRequest ? openTracking() : startBooking()}>
                {activeRequest ? 'Track my help' : 'Get help now'} <ArrowRight size={18} />
              </button>
            </div>
          </nav>
          <div className="header__actions">
            <button className="account-button" onClick={() => setAuthOpen(true)}>
              {user ? <span className="account-button__avatar">{user.name.charAt(0).toUpperCase()}</span> : <UserRound size={18} />}
              <span>{user ? user.name.split(' ')[0] : 'Sign in'}</span>
            </button>
            <button className={`button header__cta ${activeRequest ? 'button--track' : 'button--dark'}`} onClick={() => activeRequest ? openTracking() : startBooking()}>
              {activeRequest && <span className="live-dot" />}
              {activeRequest ? 'Track my help' : 'Get help now'}
              {activeRequest ? <Navigation size={17} /> : <ArrowUpRight size={18} />}
            </button>
            <button className="menu-button" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero container" id="top">
          <div className="hero__card">
            <div className="hero__content">
              <div className="eyebrow eyebrow--light"><span className="live-dot" /> HELP IS CLOSER THAN YOU THINK</div>
              <h1>Stuck?<br />Let’s get you<br /><em>moving.</em></h1>
              <p className="hero__intro">From a flat tyre to a full tow, trusted local operators are one tap away—day or night.</p>
              <div className="hero__buttons">
                <button className="button button--primary button--large" onClick={() => startBooking()}>
                  Request assistance <ArrowRight size={19} />
                </button>
                <a className="text-link text-link--light" href="#how-it-works"><span className="play-icon"><Play size={14} fill="currentColor" /></span> See how it works</a>
              </div>
              <div className="hero__proof">
                <div className="avatar-stack" aria-hidden="true"><span>TM</span><span>NK</span><span>ZA</span></div>
                <div><span className="rating"><Star size={14} fill="currentColor" /> 4.9</span><small>Loved by drivers across Gauteng</small></div>
              </div>
            </div>
            <div className="hero__media">
              <img src="/towgo-hero.jpg" alt="A TowGo flatbed tow truck carrying a car through Johannesburg" fetchPriority="high" />
              <div className="hero__media-shade" />
              <div className="response-pill"><span className="response-pill__icon"><Clock3 size={20} /></span><span><strong>24 min</strong><small>average arrival</small></span></div>
              <div className="hero-driver">
                <div className="hero-driver__avatar">SM<span /></div>
                <div><small>Your roadside pro</small><strong>Sipho is nearby</strong></div>
                <span className="hero-driver__arrow"><Navigation size={18} /></span>
              </div>
            </div>
            <div className="hero__route" aria-hidden="true">
              <svg viewBox="0 0 300 200"><path d="M-10 184c65-6 55-96 125-94 69 1 58-79 137-74" /><circle cx="114" cy="90" r="5" /><circle cx="252" cy="16" r="5" /></svg>
            </div>
          </div>
        </section>

        <div className="container quick-request-wrap">
          <form className="quick-request" onSubmit={(event) => { event.preventDefault(); startBooking(quickService, 2) }}>
            <div className="quick-request__title"><span>Need help?</span><small>Get an instant estimate</small></div>
            <label className="quick-field">
              <MapPin size={21} />
              <span><small>Your location</small><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Where are you?" aria-label="Your pickup location" /></span>
            </label>
            <button type="button" className="locate-button" onClick={useCurrentLocation} aria-label="Use my current location" title="Use my current location"><LocateFixed size={20} /></button>
            <label className="quick-field quick-field--service">
              <Wrench size={20} />
              <span><small>I need help with</small><select value={quickService} onChange={(event) => setQuickService(event.target.value)} aria-label="Choose a roadside service">{services.map((item) => <option value={item.id} key={item.id}>{item.shortName}</option>)}</select></span>
              <ChevronDown size={16} />
            </label>
            <button className="button button--primary quick-request__submit" type="submit">Get an estimate <ArrowRight size={18} /></button>
          </form>
          <div className="confidence-row">
            <span><CheckCircle2 size={16} /> No membership needed</span>
            <span><ShieldCheck size={16} /> Verified local operators</span>
            <span><CreditCard size={16} /> Secure, upfront pricing</span>
          </div>
        </div>

        <section className="section services container" id="services">
          <div className="section-heading">
            <div><div className="eyebrow">ROADSIDE HELP, YOUR WAY</div><h2>Whatever went wrong,<br />we’ll make it right.</h2></div>
            <div className="section-heading__side"><p>No call centres. No confusing quotes. Just the right help, at the right price, right now.</p><button className="text-link" onClick={() => startBooking()}>Explore all services <ArrowRight size={17} /></button></div>
          </div>
          <div className="service-grid">
            {services.slice(0, 4).map((item) => {
              const Icon = item.icon
              return (
                <button className="service-card" key={item.id} onClick={() => startBooking(item.id, 2)}>
                  <div className="service-card__top"><span className={`service-icon service-icon--${item.tone}`}><Icon size={28} strokeWidth={1.8} /></span><span className="service-card__arrow"><ArrowUpRight size={19} /></span></div>
                  <div><h3>{item.name}</h3><p>{item.description}</p></div>
                  <div className="service-card__bottom"><span>From <strong>{formatPrice(item.price)}</strong></span><small><Clock3 size={14} /> {item.eta}</small></div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="section container" id="how-it-works">
          <div className="how-card">
            <div className="how-card__content">
              <div className="eyebrow eyebrow--light">SIMPLE BY DESIGN</div>
              <h2>Help in three taps.<br /><em>That’s it.</em></h2>
              <p>Because when your car won’t go, the last thing you need is a complicated app.</p>
              <div className="steps-list">
                <div className="step-item"><span>01</span><div><h3>Tell us what happened</h3><p>Choose your service and drop a pin at your location.</p></div></div>
                <div className="step-item"><span>02</span><div><h3>Know the cost upfront</h3><p>See your price and arrival estimate before you confirm.</p></div></div>
                <div className="step-item"><span>03</span><div><h3>Watch help come to you</h3><p>Track your operator in real time and chat along the way.</p></div></div>
              </div>
              <button className="button button--cream" onClick={() => startBooking()}>Try it now <ArrowRight size={18} /></button>
            </div>
            <div className="how-card__visual">
              <TowGoMap compact />
              <div className="assigned-card">
                <div className="assigned-card__top"><span className="assigned-check"><Check size={18} /></span><span><small>OPERATOR ASSIGNED</small><strong>Help is on the way</strong></span><span className="assigned-card__eta">8 min</span></div>
                <div className="assigned-card__driver"><div className="hero-driver__avatar">SM<span /></div><div><strong>Sipho M.</strong><small><Star size={12} fill="currentColor" /> 4.9 · 328 trips</small></div><a href="tel:+27100204477" aria-label="Call Sipho"><Phone size={18} /></a><button aria-label="Message Sipho" onClick={() => { setActiveRequest({ id: 'TG-DEMO', serviceId: 'tow', location: 'Sandton, Johannesburg', destination: '', price: 950, eta: 8 }); setChatOpen(true); openTracking() }}><MessageCircle size={18} /></button></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section why-section container" id="why-towgo">
          <div className="safety-card">
            <div className="safety-card__badge"><ShieldCheck size={30} /></div>
            <div className="eyebrow">PEACE OF MIND, STANDARD</div>
            <h2>Good people.<br />Safe journeys.</h2>
            <p>Every TowGo trip comes with the things that matter most when you’re stuck on the roadside.</p>
            <ul>
              <li><span><Check size={16} /></span><div><strong>Verified, vetted operators</strong><small>ID-checked professionals you can trust.</small></div></li>
              <li><span><Check size={16} /></span><div><strong>Live trip sharing</strong><small>Keep your people in the loop, always.</small></div></li>
              <li><span><Check size={16} /></span><div><strong>Support that stays with you</strong><small>Real humans, available around the clock.</small></div></li>
            </ul>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-card__top"><span className="quote-mark">“</span><div className="testimonial-stars">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={17} fill="currentColor" />)}</div></div>
            <blockquote>“I broke down on William Nicol after dark. Within minutes I knew exactly who was coming and what it would cost. Sipho arrived with a smile and got us home safely.”</blockquote>
            <div className="testimonial-author"><div className="testimonial-author__avatar">LN</div><div><strong>Lerato N.</strong><small>Sandton · Verified TowGo trip</small></div><span><CheckCircle2 size={20} /></span></div>
            <div className="testimonial-metric"><strong>12,000+</strong><span>drivers helped and counting</span><div className="metric-avatars"><span>TM</span><span>SK</span><span>LN</span><span>+</span></div></div>
          </div>
        </section>

        <section className="coverage-section" id="coverage">
          <div className="container coverage-grid">
            <div className="coverage-content">
              <div className="eyebrow">LOCAL KNOWLEDGE. WIDE REACH.</div>
              <h2>Gauteng is<br />our home turf.</h2>
              <p>From Joburg’s city streets to Pretoria’s quiet suburbs, there’s a trusted TowGo operator nearby.</p>
              <form className="coverage-form" onSubmit={checkCoverage}>
                <MapPin size={20} />
                <input value={coverageQuery} onChange={(event) => { setCoverageQuery(event.target.value); setCoverageResult(null) }} placeholder="Enter your suburb or city" aria-label="Check coverage in your suburb or city" />
                <button type="submit" aria-label="Check coverage"><ArrowRight size={20} /></button>
              </form>
              {coverageResult !== null && <div className={`coverage-result ${coverageResult ? 'coverage-result--yes' : 'coverage-result--no'}`} role="status">{coverageResult ? <CheckCircle2 size={18} /> : <MapPin size={18} />}<span>{coverageResult ? `Great news—${coverageQuery} is in our coverage area.` : `We’re not in ${coverageQuery || 'that area'} yet. Join our waitlist and we’ll keep you posted.`}</span></div>}
              <div className="coverage-areas"><span>Johannesburg</span><span>Pretoria</span><span>Midrand</span><span>Ekurhuleni</span><span>+ more</span></div>
            </div>
            <div className="coverage-map" aria-label="TowGo coverage across Gauteng">
              <svg viewBox="0 0 540 430" aria-hidden="true">
                <path className="coverage-map__province" d="M91 43 229 20l57 35 95-9 60 66-19 68 43 75-43 101-96 42-74-28-84 25-70-70-58-39 25-89-30-62Z" />
                <g className="coverage-map__roads"><path d="M85 288c107-29 113-133 191-130 82 3 63 102 160 103" /><path d="M204 39c9 104 79 107 68 189-7 55-42 95-35 153" /><path d="M65 182c96 27 172 5 237 60 52 44 79 57 117 56" /><path d="M342 62c-22 70-5 130 68 184" /></g>
                <g className="coverage-map__minor-roads"><path d="m113 87 267 256M74 245 403 98M140 366 379 61" /></g>
                <circle cx="273" cy="227" r="76" className="coverage-map__pulse" />
                <circle cx="273" cy="227" r="48" className="coverage-map__pulse coverage-map__pulse--inner" />
              </svg>
              <div className="map-area map-area--joburg"><span /><strong>Johannesburg</strong><small>18 min avg.</small></div>
              <div className="map-area map-area--pretoria"><span /><strong>Pretoria</strong></div>
              <div className="map-area map-area--midrand"><span /><strong>Midrand</strong></div>
              <div className="map-area map-area--east"><span /><strong>Ekurhuleni</strong></div>
              <div className="coverage-map__badge"><span className="live-dot" /><strong>86 operators</strong><small>online across Gauteng</small></div>
            </div>
          </div>
        </section>

        <section className="section faq-section container">
          <div className="faq-heading"><div className="eyebrow">THE SMALL PRINT, MADE SIMPLE</div><h2>A few things<br />you may be wondering.</h2><p>Still need a hand?</p><a href="tel:+27100204477" className="text-link"><Headphones size={18} /> Talk to a real human</a></div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div className={`faq-item ${openFaq === index ? 'faq-item--open' : ''}`} key={faq.question}>
                <button aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}><span>{faq.question}</span><span className="faq-item__icon"><ChevronDown size={20} /></span></button>
                <div className="faq-answer"><p>{faq.answer}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="container business-banner">
          <div className="business-banner__icon"><CarFront size={34} /></div>
          <div><span className="eyebrow">TOWGO FOR BUSINESS</span><h2>One less thing for your fleet to worry about.</h2><p>Priority roadside support, simple monthly billing and one dashboard for every vehicle.</p></div>
          <a className="button button--dark" href="mailto:fleets@towgo.co.za?subject=TowGo%20for%20Business">Let’s talk fleet <ArrowUpRight size={18} /></a>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-cta"><div><span className="eyebrow eyebrow--light">WHENEVER. WHEREVER.</span><h2>Let’s get you back<br />on the road.</h2></div><button className="button button--primary button--large" onClick={() => startBooking()}>Request assistance <ArrowRight size={20} /></button></div>
          <div className="footer-main">
            <div className="footer-brand"><Logo light /><p>Real help. Real people.<br />Right when you need it.</p><div className="footer-availability"><span className="live-dot" /> Available 24/7 across Gauteng</div></div>
            <div className="footer-links"><div><strong>Explore</strong><a href="#services">Services</a><a href="#how-it-works">How it works</a><a href="#coverage">Coverage</a><a href="#why-towgo">Why TowGo</a></div><div><strong>Support</strong><a href="tel:+27100204477">Emergency line</a><a href="mailto:hello@towgo.co.za">Help centre</a><a href="mailto:fleets@towgo.co.za">TowGo for business</a><button onClick={() => setAuthOpen(true)}>My account</button></div></div>
            <div className="footer-contact"><strong>Need a human?</strong><p>Our support team is here<br />any time, day or night.</p><a href="tel:+27100204477">010 020 4477 <ArrowUpRight size={18} /></a><a href="mailto:hello@towgo.co.za">hello@towgo.co.za</a></div>
          </div>
          <div className="footer-bottom"><span>© 2026 TowGo. Proudly South African.</span><div><a href="mailto:legal@towgo.co.za?subject=Privacy">Privacy</a><a href="mailto:legal@towgo.co.za?subject=Terms">Terms</a><span>Made for the long road.</span></div></div>
        </div>
      </footer>

      <button className="mobile-help-bar button button--primary" onClick={() => activeRequest ? openTracking() : startBooking()}>{activeRequest ? <Navigation size={18} /> : <Truck size={18} />}{activeRequest ? 'Track my help' : 'Get roadside help'}<ArrowRight size={18} /></button>

      {bookingOpen && (
        <Modal onClose={() => setBookingOpen(false)} className="booking-modal" label="Request roadside assistance">
          <div className="modal__header">
            <div><Logo compact /><span className="modal__header-label">Request assistance</span></div>
            <button className="icon-button" onClick={() => setBookingOpen(false)} aria-label="Close booking"><X size={21} /></button>
          </div>
          <div className="booking-progress"><span>Step {bookingStep} of 3</span><div>{[1, 2, 3].map((step) => <i key={step} className={step <= bookingStep ? 'active' : ''} />)}</div></div>
          <div className="booking-body">
            {bookingStep === 1 && (
              <>
                <div className="booking-heading"><span className="booking-heading__icon"><Wrench size={22} /></span><div><h2>How can we help?</h2><p>Choose the service that best describes your situation.</p></div></div>
                <div className="booking-services">
                  {services.map((item) => {
                    const Icon = item.icon
                    return <button className={`booking-service ${selectedService === item.id ? 'booking-service--selected' : ''}`} key={item.id} onClick={() => setSelectedService(item.id)}><span className={`service-icon service-icon--${item.tone}`}><Icon size={23} /></span><span><strong>{item.shortName}</strong><small>From {formatPrice(item.price)} · {item.eta}</small></span><span className="radio-check">{selectedService === item.id && <Check size={14} />}</span></button>
                  })}
                </div>
                <div className="booking-assurance"><ShieldCheck size={18} /><span>Every operator is ID-verified and every price is confirmed upfront.</span></div>
              </>
            )}
            {bookingStep === 2 && (
              <>
                <div className="booking-heading"><span className="booking-heading__icon"><MapPin size={22} /></span><div><h2>Where should we meet you?</h2><p>A few details will help your operator find you quickly.</p></div></div>
                <div className="selected-service-strip"><span className={`service-icon service-icon--${service.tone}`}><service.icon size={22} /></span><div><small>SELECTED SERVICE</small><strong>{service.name}</strong></div><button onClick={() => setBookingStep(1)}>Change</button></div>
                <div className="form-stack">
                  <label className="form-label"><span>Pickup location</span><div className="input-with-icon"><MapPin size={19} /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Street address or nearest landmark" autoFocus /><button type="button" onClick={useCurrentLocation} title="Use current location"><LocateFixed size={19} /></button></div></label>
                  {selectedService === 'tow' && <label className="form-label"><span>Where should we take your vehicle?</span><div className="input-with-icon"><Navigation size={19} /><input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Workshop, home or another destination" /></div></label>}
                  <label className="form-label"><span>Your vehicle</span><div className="input-with-icon"><CarFront size={19} /><select value={vehicle} onChange={(event) => setVehicle(event.target.value)}><option>Toyota Hilux • 2022</option><option>Volkswagen Polo • 2020</option><option>BMW 320i • 2019</option><option>Other vehicle</option></select><ChevronDown size={17} /></div></label>
                  <label className="form-label"><span>Anything we should know? <small>Optional</small></span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="e.g. I’m on the left shoulder, near the Grayston Drive off-ramp" rows={2} /></label>
                </div>
              </>
            )}
            {bookingStep === 3 && (
              <form onSubmit={confirmRequest} id="confirm-request-form">
                <div className="booking-heading"><span className="booking-heading__icon"><CheckCircle2 size={22} /></span><div><h2>You’re one tap from help.</h2><p>Check the details, then we’ll find your nearest operator.</p></div></div>
                <div className="request-summary">
                  <div className="request-summary__service"><span className={`service-icon service-icon--${service.tone}`}><service.icon size={23} /></span><div><strong>{service.name}</strong><small>{vehicle}</small></div><span>{formatPrice(service.price)}</span></div>
                  <div className="request-summary__route"><span className="route-dots"><i /><b /><i /></span><div><p><small>PICKUP</small>{location}</p>{destination && <p><small>DESTINATION</small>{destination}</p>}</div></div>
                  <div className="request-summary__eta"><Clock3 size={17} /><span>Estimated arrival</span><strong>{service.eta}</strong></div>
                </div>
                <div className="contact-fields"><label className="form-label"><span>Your name</span><input value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="e.g. Thabo Mokoena" /></label><label className="form-label"><span>Contact number</span><input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="+27 82 123 4567" inputMode="tel" /></label></div>
                <div className="payment-options"><button type="button" className={payment === 'card' ? 'selected' : ''} onClick={() => setPayment('card')}><CreditCard size={20} /><span><strong>Card</strong><small>Pay securely after service</small></span><span className="radio-check">{payment === 'card' && <Check size={14} />}</span></button><button type="button" className={payment === 'cash' ? 'selected' : ''} onClick={() => setPayment('cash')}><Banknote size={20} /><span><strong>Cash</strong><small>Pay your operator directly</small></span><span className="radio-check">{payment === 'cash' && <Check size={14} />}</span></button></div>
              </form>
            )}
            {formError && <p className="form-error" role="alert">{formError}</p>}
          </div>
          <div className="booking-footer">
            {bookingStep > 1 ? <button className="back-button" onClick={() => { setBookingStep((step) => step - 1); setFormError('') }}><ChevronLeft size={18} /> Back</button> : <span className="booking-footer__price">From <strong>{formatPrice(service.price)}</strong></span>}
            {bookingStep < 3 ? <button className="button button--primary" onClick={nextBookingStep}>Continue <ArrowRight size={18} /></button> : <button className="button button--primary" type="submit" form="confirm-request-form">Confirm request · {formatPrice(service.price)} <ArrowRight size={18} /></button>}
          </div>
        </Modal>
      )}

      {trackingOpen && activeRequest && (
        <Modal onClose={() => setTrackingOpen(false)} className="tracking-modal" label="Track your TowGo operator">
          <div className="modal__header tracking-header"><div><Logo compact /><span className="modal__header-label">Live request</span><span className="live-request-label"><span className="live-dot" /> Operator on the way</span></div><button className="icon-button" onClick={() => setTrackingOpen(false)} aria-label="Close tracking"><X size={21} /></button></div>
          <div className="tracking-grid">
            <div className="tracking-map-wrap"><TowGoMap /><div className="tracking-map__request">Request <strong>#{activeRequest.id}</strong></div></div>
            <div className="tracking-details">
              <div className="tracking-details__heading"><div className="eyebrow">HELP IS ON THE WAY</div><h2>Sipho arrives in<br /><em>about 8 minutes.</em></h2><p>Stay somewhere safe. We’ll let you know when he’s close.</p></div>
              <div className="tracking-driver"><div className="hero-driver__avatar">SM<span /></div><div><strong>Sipho M. <span><Star size={12} fill="currentColor" /> 4.9</span></strong><small>Toyota Dyna · White · GP 48 TQ</small></div><ShieldCheck size={21} /></div>
              <div className="driver-actions"><a href="tel:+27100204477"><Phone size={18} /> Call</a><button className={chatOpen ? 'active' : ''} onClick={() => setChatOpen((open) => !open)}><MessageCircle size={18} /> Message</button><button onClick={shareTrip}><Share2 size={18} /> Share trip</button></div>
              <div className="trip-timeline"><div className="trip-timeline__item complete"><span><Check size={13} /></span><div><strong>Request confirmed</strong><small>We found your nearest available operator</small></div></div><div className="trip-timeline__item active"><span><Truck size={14} /></span><div><strong>Sipho is on the way</strong><small>Live location updates are on</small></div></div><div className="trip-timeline__item"><span><MapPin size={14} /></span><div><strong>Meet at your location</strong><small>{activeRequest.location}</small></div></div></div>
              <div className="tracking-price"><span>{services.find((item) => item.id === activeRequest.serviceId)?.name}<small>Payment after service</small></span><strong>{formatPrice(activeRequest.price)}</strong></div>
              <button className="cancel-link" onClick={() => setCancelConfirm(true)}>Cancel request</button>
            </div>
          </div>
          {cancelConfirm && <div className="cancel-confirm"><div><strong>Cancel this request?</strong><p>Sipho is already on the way. Are you sure you no longer need help?</p></div><button onClick={() => setCancelConfirm(false)}>Keep my request</button><button className="danger" onClick={cancelRequest}>Yes, cancel</button></div>}
          {chatOpen && <div className="chat-panel"><div className="chat-panel__header"><div><span className="live-dot" /><strong>Chat with Sipho</strong></div><button onClick={() => setChatOpen(false)} aria-label="Close chat"><X size={18} /></button></div><div className="chat-messages">{messages.map((message, index) => <p key={index} className={message.from === 'customer' ? 'customer' : ''}>{message.text}<small>{message.from === 'customer' ? 'You' : 'Sipho'} · now</small></p>)}</div><form onSubmit={sendMessage}><input value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} placeholder="Type a message…" aria-label="Message to Sipho" /><button type="submit" aria-label="Send message"><Send size={18} /></button></form></div>}
        </Modal>
      )}

      {authOpen && (
        <Modal onClose={() => setAuthOpen(false)} className="auth-modal" label={user ? 'Your TowGo account' : 'Sign in to TowGo'}>
          <div className="modal__header"><Logo /><button className="icon-button" onClick={() => setAuthOpen(false)} aria-label="Close account"><X size={21} /></button></div>
          {user ? <div className="account-view"><div className="account-view__avatar">{user.name.charAt(0).toUpperCase()}</div><h2>Hi, {user.name.split(' ')[0]}.</h2><p>Your roadside details, all in one place.</p><div className="account-detail"><UserRound size={19} /><span><small>CONTACT</small><strong>{user.name}<br />{user.phone}</strong></span></div><div className="account-detail"><CarFront size={19} /><span><small>SAVED VEHICLE</small><strong>{vehicle}</strong></span></div>{activeRequest && <button className="button button--primary button--full" onClick={() => { setAuthOpen(false); openTracking() }}><Navigation size={18} /> Track active request</button>}<button className="sign-out-button" onClick={signOut}>Sign out</button></div> : <div className="auth-view"><div className="auth-view__icon"><UserRound size={27} /></div><h2>Let’s make your next<br />roadside request easier.</h2><p>Save your contact and vehicle details for faster help when you need it.</p><form onSubmit={handleAuth}><label className="form-label"><span>Your name</span><input value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="Thabo Mokoena" autoFocus required /></label><label className="form-label"><span>Mobile number</span><input value={authPhone} onChange={(event) => setAuthPhone(event.target.value)} placeholder="+27 82 123 4567" inputMode="tel" minLength={9} required /></label><button className="button button--primary button--full" type="submit">Continue <ArrowRight size={18} /></button></form><small className="auth-terms">By continuing, you agree to TowGo’s terms and privacy policy.</small></div>}
        </Modal>
      )}

      {toast && <div className="toast" role="status"><CheckCircle2 size={19} /><span>{toast}</span><button onClick={() => setToast('')} aria-label="Dismiss notification"><X size={16} /></button></div>}
    </div>
  )
}

export default App

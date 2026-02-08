import { useState } from 'react'
import './App.css'

// Extract file ID from Drive share link; build direct thumbnail URL (no proxy).
function driveImgUrl(shareLinkOrId, size = 'w1200') {
  const raw = typeof shareLinkOrId === 'string' ? shareLinkOrId.trim() : ''
  const match = raw.match(/\/d\/([^/]+)/)
  const id = match ? match[1] : raw
  if (!id) return ''
  return `https://drive.google.com/thumbnail?id=${id}&sz=${size}`
}

// Drive preview URL for iframe fallback (Google’s embed link).
function drivePreviewUrl(shareLinkOrId) {
  const raw = typeof shareLinkOrId === 'string' ? shareLinkOrId.trim() : ''
  const match = raw.match(/\/d\/([^/]+)/)
  const id = match ? match[1] : raw
  if (!id) return ''
  return `https://drive.google.com/file/d/${id}/preview`
}

const HER_PHOTO_DRIVE_LINK = 'https://drive.google.com/file/d/1F7-zcCPZSfja1M20UNcaC9Ilp_HmcOgg/view?usp=drivesdk'
const HER_PHOTO_SRC = driveImgUrl(HER_PHOTO_DRIVE_LINK) || '/her-photo-placeholder.svg'

const LOVE_QUESTIONS = [
  {
    q: "Will you be my valentine?",
    options: [
      { label: "Yes! 💕", response: "Thank uh meri babu ! i love uh sooo much my wifey ❤️♥❤️" },
      { label: "Of course! ♥", response: "Thankuh mam ! Muah 💋 kisses from your future husband" },
      { label: "Maybe... 😏", response: "koi n ladta hu thora jayada lekin mna lunga tumhe 🙂💕" },
      { label: "No", runAway: true },
    ],
  },
  {
    q: "What's your love language?",
    options: [
      { label: "Words of affirmation", response: "ummm kuch kuch words sunn k to mujhe bohot pyar aa jata aapke upr jaise babu bacha sami cutu haye  🫠💕♥" },
      { label: "Quality time", response: "mujhe v acha lgta h lekin babu wo kaam rehta h n isiliye rukta nhi hu bohot time apke sath , sorry babuu 🫠💕" },
      { label: "Gifts", response: "umm waise gifts to deti ho ❤️🫠 Thanks for the gifts mam , waise u are the best gift for me💕♥" },
      { label: "Acts of affection", response: "wow sahi m kya mam , lekin pyar dikhati kaha ho aap bs ladti ho mujhse🙂 💕" },
      { label: "Physical touch", response: "ummm aaisa kya mam😉 mujhe to pta tha aap yeahi click krogi , hehehe ♥" },
    ],
  },
  { q: "What's the first thing you noticed about me?",
    options:[
      { label: "My eyes", response:"waise aakhein to aapki v ekdum mst h meri babu 😍💕" },
      { label: "My smile", response:"waise aapki smile to mujhe v pyar aa jata h 💕" },
      { label: "My personality" ,response:"waise aapki personality to ekdum gundi wali h 😭 💕" },
      { label: "My sense of humor", response :"ummmm koi nhi always hasate rhunga mam aapko🫠" },
      { label: "My intelligence" ,response:"hein sachi m kya mam"},
      { label: "My care" ,response:"mujhe aapki care krna bohot pasand h babu ❤️"},
    ]
   },
  { q: "What's a small thing I do that makes you smile?", a: "The little things matter. Thank you for noticing." },
  { q: "Where would you want us to go on a dream date?", a: "Anywhere with you sounds like a dream." },
]

// Memory game: paste your 4 Google Drive image links (share link or file ID). Same as main photo — use driveImgUrl.
const MEMORY_IMAGES = [
  driveImgUrl('https://drive.google.com/file/d/1-ff1Yli0lpKHfUVVHbOiTj8-LC_p-pDr/view?usp=drivesdk', 'w800'),
  driveImgUrl('https://drive.google.com/file/d/1aQrWNXyfXXRgQt3j9rKD67IUaGiMjMF9/view?usp=drivesdk', 'w800'),
  driveImgUrl('https://drive.google.com/file/d/1pHfu6VA5PhwZtQ696OMXR566pRAlxe_r/view?usp=drivesdk', 'w800'),
  driveImgUrl('https://drive.google.com/file/d/1YD2qPh8aaLPKjKlFC6_Kycob8E-GWv9t/view?usp=drivesdk', 'w800'),
]
const MEMORY_PAIRS = 4 // 8 cards

const FAVORITE_MOMENTS = [
  { id: 'cozy', label: 'Cozy night in', img: 'https://img.freepik.com/free-photo/3d-cartoon-coffee-cup_23-2151751969.jpg?semt=ais_hybrid&w=740&q=80' },
  { id: 'adventure', label: 'Adventure day', img: 'https://www.focusonthefamily.com/wp-content/uploads/2016/05/hikecuddle-2.jpg' },
  { id: 'dinner', label: 'Special dinner', img: 'https://media.istockphoto.com/id/506823516/photo/couple-enjoying-a-romantic-dinner-by-candlelight.jpg?s=612x612&w=0&k=20&c=oqF5We7gsVns2IJTphUEEuub_SjyoARs2zwxcng6zVU=' },
]

function App() {
  const [hovered, setHovered] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [openQuestion, setOpenQuestion] = useState(null)
  const [questionPicks, setQuestionPicks] = useState({}) // { questionIndex: optionIndex }
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 })
  const [noButtonRunning, setNoButtonRunning] = useState(false)
  const [noLoveNote, setNoLoveNote] = useState('')
  const [memoryCards, setMemoryCards] = useState(() => initMemoryCards())
  const [memoryFlipped, setMemoryFlipped] = useState([])
  const [memoryMatched, setMemoryMatched] = useState([])
  const [favoritePicked, setFavoritePicked] = useState(null)
  const [memoryImgFailed, setMemoryImgFailed] = useState(() => new Set())

  function initMemoryCards() {
    const images = MEMORY_IMAGES.slice(0, MEMORY_PAIRS)
    const pairs = [...images, ...images]
    return pairs.map((img, i) => ({ id: i, img })).sort(() => Math.random() - 0.5)
  }

  function markMemoryImgFailed(url) {
    setMemoryImgFailed((prev) => new Set(prev).add(url))
  }

  function handleMemoryFlip(id) {
    if (memoryFlipped.length === 2 || memoryFlipped.includes(id) || memoryMatched.includes(id)) return
    const next = [...memoryFlipped, id]
    setMemoryFlipped(next)
    if (next.length === 2) {
      const [a, b] = next
      const cardA = memoryCards.find(c => c.id === a)
      const cardB = memoryCards.find(c => c.id === b)
      if (cardA?.img === cardB?.img) {
        setMemoryMatched(m => [...m, a, b])
      }
      setTimeout(() => setMemoryFlipped([]), 600)
    }
  }

  const memoryWon = memoryMatched.length === MEMORY_PAIRS * 2

  return (
    <main className="valentine-page">
      <div className="hearts-bg" aria-hidden="true">
        <span className="heart heart-1">♥</span>
        <span className="heart heart-2">♥</span>
        <span className="heart heart-3">♥</span>
        <span className="heart heart-4">♥</span>
        <span className="heart heart-5">♥</span>
      </div>

      <section className="hero">
        <p className="tagline">something sweet for you</p>
        <h1 className="title">
          <span className="title-line">You make</span>
          <span className="title-line accent">every day</span>
          <span className="title-line">feel special u are MY AASHII ❤️</span>
        </h1>
        <p className="subtitle">A little corner of the internet, just because.</p>
        <button
          className="cta"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setNoteOpen(true)}
        >
          {hovered ? '♥' : '💕'} open the note
        </button>
      </section>

      {/* Her photo – set HER_PHOTO_DRIVE_LINK in App.jsx to your Google Drive image link */}
      <section className="section for-you">
        <h2 className="section-title">For you</h2>
        <div className="photo-frame">
          <img
            src={HER_PHOTO_SRC}
            alt="You"
            className="her-photo"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = '/her-photo-placeholder.svg'
            }}
          />
        </div>
        <p className="photo-caption">The one who makes every day worth it ♥</p>
      </section>

      {/* Love questions – optional, tap to expand */}
      <section className="section questions">
        <h2 className="section-title">A few little questions</h2>
        <p className="section-sub">Optional — tap to reveal</p>
        <div className="questions-list">
          {LOVE_QUESTIONS.map((item, i) => {
            const hasOptions = item.options && item.options.length > 0
            const picked = questionPicks[i]
            const isOpen = openQuestion === i
            return (
              <div
                key={i}
                className={`question-item ${isOpen ? 'open' : ''} ${hasOptions ? 'has-options' : ''}`}
                onClick={() => !hasOptions && setOpenQuestion(isOpen ? null : i)}
              >
                <div
                  className="question-q"
                  onClick={(e) => hasOptions && (picked !== undefined ? null : (e.stopPropagation(), setOpenQuestion(isOpen ? null : i)))}
                >
                  {item.q}
                </div>
                {hasOptions ? (
                  <>
                    {picked === undefined ? (
                      isOpen && (
                        <div className="question-options" onClick={(e) => e.stopPropagation()}>
                          {i === 0 && noLoveNote && (
                            <p className="no-love-note">{noLoveNote}</p>
                          )}
                          {item.options.map((opt, j) => {
                            if (opt.runAway) {
                              const runAway = () => {
                                  setNoButtonRunning(true)
                                  setNoButtonPos({
                                    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth - 120 : 200),
                                    y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight - 80 : 200),
                                  })
                                }
                                return (
                                <div key={j} className="no-btn-wrapper">
                                  <button
                                    type="button"
                                    className="question-opt-btn question-opt-no"
                                    style={noButtonRunning
                                      ? { position: 'fixed', left: noButtonPos.x, top: noButtonPos.y, margin: 0 }
                                      : { position: 'absolute', left: 0, top: 0 }}
                                    onMouseEnter={() => {
                                      setNoLoveNote("yes pe click kro bachaa 🙂♥")
                                      runAway()
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setNoLoveNote("please babu yes pe click kro 🙂💕")
                                      runAway()
                                    }}
                                  >
                                    {opt.label}
                                  </button>
                                </div>
                              )
                            }
                            return (
                              <button
                                key={j}
                                type="button"
                                className="question-opt-btn"
                                onClick={() => setQuestionPicks((prev) => ({ ...prev, [i]: j }))}
                              >
                                {opt.label}
                              </button>
                            )
                          })}
                        </div>
                      )
                    ) : (
                      <div className="question-a">{item.options[picked].response}</div>
                    )}
                  </>
                ) : (
                  <div className="question-a">{item.a}</div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Mini games */}
      <section className="section games">
        <h2 className="section-title">Little games</h2>

        <div className="game-block">
          <h3 className="game-title">💕 Memory match</h3>
          <p className="game-desc">Find all the pairs!</p>
          {memoryWon ? (
            <p className="game-won">You did it! ♥</p>
          ) : (
            <div className="memory-grid">
              {memoryCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className={`memory-card ${memoryFlipped.includes(card.id) || memoryMatched.includes(card.id) ? 'flipped' : ''}`}
                  onClick={() => handleMemoryFlip(card.id)}
                  disabled={memoryFlipped.length === 2}
                >
                  <span className="memory-back">?</span>
                  <span className="memory-front">
                    {memoryImgFailed.has(card.img) ? (
                      <span className="memory-card-placeholder">♥</span>
                    ) : (
                      <img
                        src={card.img}
                        alt=""
                        onError={() => markMemoryImgFailed(card.img)}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="game-block">
          <h3 className="game-title">🌸 Pick your favorite moment</h3>
          <p className="game-desc">Which one would you want to relive?</p>
          <div className="moments-grid">
            {FAVORITE_MOMENTS.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`moment-card ${favoritePicked === m.id ? 'picked' : ''}`}
                onClick={() => setFavoritePicked(favoritePicked === m.id ? null : m.id)}
              >
                <img src={m.img} alt={m.label} />
                <span>{m.label}</span>
              </button>
            ))}
          </div>
          {favoritePicked && (
            <p className="moment-response">
              Great choice babuu ! We'll make more moments like this one meri betuu . ♥
            </p>
          )}
        </div>
      </section>

      {noteOpen && (
        <div className="note-overlay" onClick={() => setNoteOpen(false)} role="dialog" aria-modal="true" aria-label="Note">
          <div className="note-modal" onClick={(e) => e.stopPropagation()}>
            <button className="note-close" onClick={() => setNoteOpen(false)} aria-label="Close">×</button>
            <div className="note-content">
              <h2>💌 A note for you</h2>
              <p>
                Hello my bachaa , i hope u are soo happy with me , i love u soo much my wifey ❤️♥❤️ , You are my sweetest girl ever i had , i never let u go my betuu ! 
                Humesha tumhe khush rkunga babu ❤️♥❤️ , ladai v hoga lekin kabhi jane ka mt sochna babu , i know tum bohot sundar ho main sundar to nahi but efforts krta hoon ki khush rho kabhi kabhi jayada bol deta hu to guilt ho jata h maaf kr dena mujhe meri betu pleass , i love uh soo my meri biwi ❤️
              </p>
              <p className="note-signature">With love, always ♥</p>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <span>Made with love</span>
      </footer>
    </main>
  )
}

export default App

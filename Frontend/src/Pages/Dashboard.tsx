import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from 'axios'

const Dashboard = () => {
  const navigate = useNavigate()
  const [roomName, setroomName] = useState<string>()
  const [bVisible, setbVisible] = useState(true)
  const [roomId, setroomId] = useState<string>()
  const joinroomref = useRef<HTMLDivElement>(null)

  // ── All business logic untouched ────────────────────────────────────────────
  async function handlecreateroom() {
    const token = localStorage.getItem('authorization')
    try {
      setbVisible(false)
      const response = await axios.post(
        'http://localhost:3000/api/v1/create-room',
        { "roomname": roomName },
        { "headers": { "authorization": token } }
      )
      alert(response.data.message)
      if (joinroomref.current != null) {
        const obtroomId = response.data.roomId
        joinroomref.current.innerHTML = obtroomId
        setbVisible(true)
        navigate(`/Codeeditor/${obtroomId}`)
      }
    } catch (e) {
      setbVisible(true)
      // @ts-ignore
      alert(e.response.data.message)
    }
  }

  async function handlejoinroom() {
    try {
      const token = localStorage.getItem('authorization')
      const response = await axios.get(
        `http://localhost:3000/api/v1/join-room/${roomId}`,
        { headers: { authorization: token } }
      )
      navigate(`/Codeeditor/${roomId}`)
      // For now it is alert, but later on we have to use toasts here.
      alert(response.data.message)
    } catch (e) {
      // for now i have hardcoded the message, otherwise we have to pick it up from the server.
      alert("RoomId does not exist")
    }
  }

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        :root {
          --c:      #00f0ff;
          --c10:    rgba(0,240,255,0.10);
          --c20:    rgba(0,240,255,0.20);
          --c40:    rgba(0,240,255,0.40);
          --p:      #9d6bff;
          --p10:    rgba(157,107,255,0.10);
          --p20:    rgba(157,107,255,0.20);
          --bg:     #09090b;
          --g1:     rgba(255,255,255,0.04);
          --g2:     rgba(255,255,255,0.07);
          --bd:     rgba(255,255,255,0.06);
          --bd2:    rgba(255,255,255,0.10);
          --t1:     rgba(255,255,255,0.85);
          --t2:     rgba(255,255,255,0.45);
          --t3:     rgba(255,255,255,0.20);
          --mono:   'Share Tech Mono', monospace;
          --sans:   'DM Sans', system-ui, sans-serif;
        }

        /* ── Animations ──────────────────────────────────────────────────── */

        @keyframes blink {
          0%,49%  { opacity: 1; }
          50%,100%{ opacity: 0; }
        }
        @keyframes rise {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes hlineScroll {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100vw); }
        }
        @keyframes crtFlicker {
          0%,100% { opacity: 1; }
          92%     { opacity: 1; }
          93%     { opacity: 0.85; }
          94%     { opacity: 1; }
          97%     { opacity: 0.9; }
          98%     { opacity: 1; }
        }
        @keyframes borderPulse {
          0%,100% { border-color: rgba(0,240,255,0.18); }
          50%     { border-color: rgba(0,240,255,0.38); box-shadow: 0 0 24px rgba(0,240,255,0.08); }
        }
        @keyframes idFlash {
          0%   { background: rgba(0,240,255,0.18); }
          100% { background: rgba(0,240,255,0.04); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ── Root ────────────────────────────────────────────────────────── */

        .op-root {
          font-family: var(--sans);
          background: var(--bg);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
          animation: crtFlicker 8s infinite;
        }

        /* Layered background */
        .op-bg-layer {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        /* Main radial */
        .op-bg-layer::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 55% 45% at 15% 85%, rgba(157,107,255,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 45% 35% at 85% 15%, rgba(0,240,255,0.06) 0%, transparent 55%);
        }
        /* Fine crosshatch grid */
        .op-bg-layer::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ── Ticker tape (top) ───────────────────────────────────────────── */

        .op-ticker {
          position: relative;
          z-index: 20;
          height: 28px;
          overflow: hidden;
          background: rgba(0,240,255,0.04);
          border-bottom: 1px solid rgba(0,240,255,0.10);
        }
        .op-ticker-track {
          display: flex;
          white-space: nowrap;
          animation: ticker 28s linear infinite;
          height: 100%;
          align-items: center;
        }
        .op-ticker-item {
          font-family: var(--mono);
          font-size: 10px;
          color: rgba(0,240,255,0.35);
          letter-spacing: 0.12em;
          padding: 0 40px;
        }
        .op-ticker-sep { color: rgba(0,240,255,0.15); }

        /* ── Nav ─────────────────────────────────────────────────────────── */

        .op-nav {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          height: 58px;
          border-bottom: 1px solid var(--bd);
          background: rgba(9,9,11,0.92);
          backdrop-filter: blur(16px);
        }

        /* Logo block — left side with a vertical accent bar */
        .op-logo-block {
          display: flex;
          align-items: center;
          padding: 0 28px;
          border-right: 1px solid var(--bd);
          gap: 12px;
        }
        .op-logo-bar {
          width: 3px;
          height: 22px;
          border-radius: 2px;
          background: linear-gradient(to bottom, var(--c), var(--p));
          box-shadow: 0 0 8px rgba(0,240,255,0.4);
          flex-shrink: 0;
        }
        .op-logo-text {
          font-family: var(--mono);
          font-size: 15px;
          color: var(--t1);
          letter-spacing: 0.05em;
        }
        .op-logo-text span { color: var(--c); }
        .op-cursor-block {
          display: inline-block;
          width: 9px; height: 16px;
          background: var(--c);
          margin-left: 2px;
          vertical-align: middle;
          border-radius: 1px;
          animation: blink 1s step-start infinite;
          box-shadow: 0 0 10px rgba(0,240,255,0.7);
        }

        /* Nav center — system breadcrumb */
        .op-nav-center {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--mono);
          font-size: 10.5px;
          color: var(--t3);
          letter-spacing: 0.08em;
        }
        .op-nav-crumb { color: var(--t2); }
        .op-nav-sep   { color: var(--t3); }

        /* Nav right */
        .op-nav-right {
          display: flex;
          align-items: center;
          gap: 0;
          border-left: 1px solid var(--bd);
        }
        .op-nav-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 20px;
          border-right: 1px solid var(--bd);
          font-family: var(--mono);
          font-size: 10px;
          color: var(--t3);
          letter-spacing: 0.07em;
        }
        .op-pulse {
          width: 7px; height: 7px; border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 8px #4ade80, 0 0 16px rgba(74,222,128,0.3);
          animation: blink 2.4s ease-in-out infinite;
          flex-shrink: 0;
        }
        .op-logout {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 24px;
          height: 100%;
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.09em;
          color: var(--t3);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .op-logout:hover {
          color: #ff6b6b;
          background: rgba(255,80,80,0.05);
        }
        .op-logout:hover .op-logout-icon { stroke: #ff6b6b; }
        .op-logout-icon {
          stroke: currentColor;
          transition: stroke 0.2s, transform 0.2s;
          flex-shrink: 0;
        }
        .op-logout:hover .op-logout-icon { transform: translateX(3px); }

        /* ── Sub-header bar (breadcrumb + time) ─────────────────────────── */

        .op-subbar {
          position: relative;
          z-index: 9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          height: 36px;
          border-bottom: 1px solid var(--bd);
          background: rgba(255,255,255,0.01);
        }
        .op-subbar-left {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--t3);
          letter-spacing: 0.09em;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .op-subbar-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--c); opacity: 0.5; }
        .op-subbar-right {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--t3);
          letter-spacing: 0.08em;
        }

        /* ── Hero ────────────────────────────────────────────────────────── */

        .op-hero {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 64px 24px 52px;
          animation: rise 0.55s ease both;
        }

        .op-hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--mono);
          font-size: 10.5px;
          letter-spacing: 0.18em;
          color: rgba(157,107,255,0.65);
          margin-bottom: 20px;
          text-transform: uppercase;
        }
        .op-hero-tag-line {
          display: inline-block;
          width: 32px;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(157,107,255,0.4));
        }
        .op-hero-tag-line-r {
          background: linear-gradient(to left, transparent, rgba(157,107,255,0.4));
        }

        .op-hero-h1 {
          font-family: var(--sans);
          font-size: clamp(30px, 4.5vw, 52px);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1.08;
          margin-bottom: 14px;
          background: linear-gradient(130deg, #ffffff 0%, #d4f0ff 35%, #00f0ff 65%, #9d6bff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .op-hero-sub {
          font-size: 13.5px;
          color: var(--t2);
          font-weight: 300;
          line-height: 1.75;
          max-width: 400px;
          margin: 0 auto 0;
          letter-spacing: 0.01em;
        }

        /* Horizontal scan line decoration */
        .op-scanwrap {
          position: relative;
          height: 1px;
          overflow: hidden;
          margin: 32px auto 0;
          width: 200px;
        }
        .op-scanwrap::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60px; height: 1px;
          background: linear-gradient(to right, transparent, var(--c), transparent);
          animation: hlineScroll 3s ease-in-out infinite;
        }

        /* ── Cards grid ──────────────────────────────────────────────────── */

        .op-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 440px));
          gap: 20px;
          justify-content: center;
          padding: 0 24px 80px;
          animation: rise 0.6s 0.1s ease both;
        }

        .op-card {
          background: linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid var(--bd);
          border-radius: 12px;
          padding: 0;
          backdrop-filter: blur(24px);
          overflow: hidden;
          position: relative;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .op-card:hover {
          box-shadow: 0 0 0 1px rgba(255,255,255,0.09), 0 24px 64px rgba(0,0,0,0.5);
        }

        /* Coloured top edge */
        .op-card-edge {
          height: 2px;
          width: 100%;
        }
        .op-card-edge-c {
          background: linear-gradient(to right, var(--c), rgba(0,240,255,0));
        }
        .op-card-edge-p {
          background: linear-gradient(to right, var(--p), rgba(157,107,255,0));
        }

        .op-card-body { padding: 24px 26px 26px; }

        /* Card header row */
        .op-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .op-card-label {
          font-family: var(--mono);
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.12em;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .op-card-label-c { color: var(--c); }
        .op-card-label-p { color: var(--p); }

        .op-card-badge {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.12em;
          padding: 3px 9px;
          border-radius: 3px;
        }
        .op-card-badge-c {
          background: var(--c10);
          border: 1px solid rgba(0,240,255,0.18);
          color: rgba(0,240,255,0.6);
        }
        .op-card-badge-p {
          background: var(--p10);
          border: 1px solid rgba(157,107,255,0.2);
          color: rgba(157,107,255,0.6);
        }

        /* Horizontal rule */
        .op-rule {
          height: 1px;
          border: none;
          margin-bottom: 20px;
        }
        .op-rule-c { background: linear-gradient(to right, rgba(0,240,255,0.15), transparent); }
        .op-rule-p { background: linear-gradient(to right, rgba(157,107,255,0.15), transparent); }

        /* Input wrapper */
        .op-input-wrap {
          position: relative;
          margin-bottom: 12px;
        }
        .op-input-tag {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--mono);
          font-size: 13px;
          pointer-events: none;
          border-right: 1px solid var(--bd);
        }
        .op-input-tag-c { color: rgba(0,240,255,0.35); }
        .op-input-tag-p { color: rgba(157,107,255,0.35); }

        .op-input {
          width: 100%;
          padding: 11px 14px 11px 54px;
          background: rgba(0,0,0,0.45);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 7px;
          color: rgba(255,255,255,0.82);
          font-family: var(--mono);
          font-size: 13px;
          letter-spacing: 0.04em;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .op-input::placeholder { color: var(--t3); font-style: italic; }
        .op-input-c:focus {
          border-color: rgba(0,240,255,0.35);
          box-shadow: 0 0 0 3px rgba(0,240,255,0.07);
        }
        .op-input-p:focus {
          border-color: rgba(157,107,255,0.35);
          box-shadow: 0 0 0 3px rgba(157,107,255,0.07);
        }

        /* Buttons */
        .op-btn {
          width: 100%;
          padding: 12px 16px;
          border-radius: 7px;
          font-family: var(--mono);
          font-size: 12px;
          letter-spacing: 0.14em;
          font-weight: 400;
          cursor: pointer;
          border: none;
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s, box-shadow 0.2s, transform 0.12s;
          display: block;
        }
        .op-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(255,255,255,0.07) 0%, transparent 100%);
          pointer-events: none;
        }
        .op-btn:active { transform: scale(0.982); }

        .op-btn-c {
          background: linear-gradient(135deg, rgba(0,240,255,0.16) 0%, rgba(0,240,255,0.08) 100%);
          border: 1px solid rgba(0,240,255,0.28);
          color: var(--c);
          box-shadow: inset 0 1px 0 rgba(0,240,255,0.12);
          animation: borderPulse 3.5s ease-in-out infinite;
        }
        .op-btn-c:hover {
          box-shadow: 0 0 28px rgba(0,240,255,0.2), 0 0 56px rgba(0,240,255,0.06), inset 0 1px 0 rgba(0,240,255,0.2);
          border-color: rgba(0,240,255,0.5);
          animation: none;
        }

        .op-btn-p {
          background: linear-gradient(135deg, rgba(157,107,255,0.15) 0%, rgba(157,107,255,0.07) 100%);
          border: 1px solid rgba(157,107,255,0.28);
          color: var(--p);
          box-shadow: inset 0 1px 0 rgba(157,107,255,0.12);
        }
        .op-btn-p:hover {
          box-shadow: 0 0 28px rgba(157,107,255,0.18), 0 0 56px rgba(157,107,255,0.06), inset 0 1px 0 rgba(157,107,255,0.2);
          border-color: rgba(157,107,255,0.5);
        }

        .op-btn-hidden { display: none; }

        /* Session ID output terminal box */
        .op-session-output {
          margin-top: 14px;
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(0,240,255,0.12);
          border-radius: 7px;
          padding: 11px 14px;
          font-family: var(--mono);
          font-size: 11.5px;
          color: rgba(0,240,255,0.6);
          letter-spacing: 0.08em;
          min-height: 42px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s, box-shadow 0.3s, background 0.5s;
        }
        /* When filled */
        .op-session-output:not(:empty) {
          border-color: rgba(0,240,255,0.32);
          box-shadow: 0 0 16px rgba(0,240,255,0.08);
          animation: idFlash 1.2s ease forwards;
        }
        /* Terminal prompt prefix via ::before */
        .op-session-output::before {
          content: 'SESSION_ID ›  ';
          font-size: 9.5px;
          color: rgba(0,240,255,0.28);
          letter-spacing: 0.14em;
          display: block;
          margin-bottom: 4px;
        }
        /* Sliding highlight bar */
        .op-session-output::after {
          content: '';
          position: absolute;
          top: 0; left: -80%;
          width: 50%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,240,255,0.55), transparent);
          animation: hlineScroll 2.5s linear infinite;
        }

        /* ── Footer ──────────────────────────────────────────────────────── */

        .op-footer {
          position: relative;
          z-index: 1;
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 32px;
          border-top: 1px solid var(--bd);
          background: rgba(9,9,11,0.7);
          backdrop-filter: blur(10px);
        }
        .op-footer-left {
          display: flex;
          align-items: center;
          gap: 16px;
          font-family: var(--mono);
          font-size: 9.5px;
          color: var(--t3);
          letter-spacing: 0.1em;
        }
        .op-footer-divider { color: rgba(255,255,255,0.1); }
        .op-footer-right {
          font-family: var(--mono);
          font-size: 9.5px;
          color: rgba(0,240,255,0.2);
          letter-spacing: 0.1em;
        }

        /* Spinner for loading indicator */
        .op-spinner {
          width: 10px; height: 10px;
          border: 1px solid rgba(0,240,255,0.2);
          border-top-color: var(--c);
          border-radius: 50%;
          animation: spin 1.2s linear infinite;
          display: inline-block;
          vertical-align: middle;
          margin-right: 4px;
        }

        @media (max-width: 840px) {
          .op-grid { grid-template-columns: 1fr; max-width: 500px; margin: 0 auto; }
          .op-nav-center { display: none; }
          .op-footer { flex-direction: column; gap: 8px; text-align: center; }
        }
      `}</style>

      <div className="op-root">
        <div className="op-bg-layer" />

        {/* ── Ticker tape ─────────────────────────────────────────────────── */}
        <div className="op-ticker" aria-hidden="true">
          <div className="op-ticker-track">
            {Array.from({ length: 2 }).map((_, ri) =>
              ["COREWIRE RUNTIME v1.0", "E2E ENCRYPTED", "WEBSOCKET RELAY ACTIVE", "COLLABORATIVE MODE", "NODE.JS v22 · ESBUILD 0.21", "ALL SYSTEMS NOMINAL", "SECURE CHANNEL OPEN"].map((item, i) => (
                <span key={`${ri}-${i}`}>
                  <span className="op-ticker-item">{item}</span>
                  <span className="op-ticker-item op-ticker-sep">·</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <nav className="op-nav">
          {/* Logo */}
          <div className="op-logo-block">
            <div className="op-logo-bar" />
            <div className="op-logo-text">
              <span>{'>_'}&nbsp;</span>CoreWire
              <span className="op-cursor-block" />
            </div>
          </div>

          {/* Center breadcrumb */}
          <div className="op-nav-center">
            <span className="op-nav-crumb">WORKSPACE</span>
            <span className="op-nav-sep">/</span>
            <span className="op-nav-crumb">CONTROL_PANEL</span>
            <span className="op-nav-sep">/</span>
            <span style={{ color: 'rgba(0,240,255,0.45)' }}>SESSIONS</span>
          </div>

          {/* Right */}
          <div className="op-nav-right">
            <div className="op-nav-stat">
              <span className="op-pulse" />
              SYS ONLINE
            </div>
            <button
              className="op-logout"
              onClick={() => console.log('Logout clicked')}
            >
              <svg className="op-logout-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              LOGOUT
            </button>
          </div>
        </nav>

        {/* ── Sub-bar ──────────────────────────────────────────────────────── */}
        <div className="op-subbar">
          <div className="op-subbar-left">
            <span className="op-subbar-dot" />
            SESSIONS &gt; CREATE OR CONNECT
          </div>
          <div className="op-subbar-right">
            <span className="op-spinner" />
            AWAITING INPUT
          </div>
        </div>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="op-hero">
          <div className="op-hero-tag">
            <span className="op-hero-tag-line" />
            Workspace Control
            <span className="op-hero-tag-line op-hero-tag-line-r" />
          </div>
          <h1 className="op-hero-h1">Initialize Collaboration</h1>
          <p className="op-hero-sub">
            Spawn a secure session or join a peer workspace. All channels are end-to-end encrypted and ephemeral.
          </p>
          <div className="op-scanwrap" aria-hidden="true" />
        </section>

        {/* ── Command Cards ─────────────────────────────────────────────────── */}
        <div className="op-grid">

          {/* Card 1 — Create */}
          <div className="op-card">
            <div className="op-card-edge op-card-edge-c" />
            <div className="op-card-body">
              <div className="op-card-header">
                <div className="op-card-label op-card-label-c">
                  {'>_'}&nbsp;NEW_SESSION
                </div>
                <span className="op-card-badge op-card-badge-c">SPAWN</span>
              </div>
              <hr className="op-rule op-rule-c" />

              <div className="op-input-wrap">
                <span className="op-input-tag op-input-tag-c">{'>>'}</span>
                <input
                  className="op-input op-input-c"
                  type="text"
                  placeholder="Enter session name..."
                  onChange={(e) => { setroomName(e.target.value) }}
                />
              </div>

              <button
                className={`op-btn op-btn-c${!bVisible ? ' op-btn-hidden' : ''}`}
                onClick={handlecreateroom}
              >
                [ CREATE ]
              </button>

              {/* joinroomref — styled as terminal output */}
              <div ref={joinroomref} className="op-session-output" />
            </div>
          </div>

          {/* Card 2 — Join */}
          <div className="op-card">
            <div className="op-card-edge op-card-edge-p" />
            <div className="op-card-body">
              <div className="op-card-header">
                <div className="op-card-label op-card-label-p">
                  {'>_'}&nbsp;CONNECT_PEER
                </div>
                <span className="op-card-badge op-card-badge-p">JOIN</span>
              </div>
              <hr className="op-rule op-rule-p" />

              <div className="op-input-wrap">
                <span className="op-input-tag op-input-tag-p">{'##'}</span>
                <input
                  className="op-input op-input-p"
                  type="text"
                  placeholder="Enter session ID..."
                  onChange={(e) => { setroomId(e.target.value) }}
                />
              </div>

              <button
                className="op-btn op-btn-p"
                onClick={handlejoinroom}
              >
                [ JOIN ]
              </button>

              <p style={{ fontFamily: 'var(--mono)', fontSize: '10.5px', color: 'var(--t3)', marginTop: '14px', letterSpacing: '0.05em', lineHeight: 1.7 }}>
                // Session IDs are case-sensitive.<br />
                // Obtain the ID from your session host.
              </p>
            </div>
          </div>

        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer className="op-footer">
          <div className="op-footer-left">
            <span>COREWIRE</span>
            <span className="op-footer-divider">·</span>
            <span>SECURE RUNTIME</span>
            <span className="op-footer-divider">·</span>
            <span>v1.0.0</span>
          </div>
          <div className="op-footer-right">ALL CHANNELS ENCRYPTED</div>
        </footer>
      </div>
    </>
  )
}

export default Dashboard

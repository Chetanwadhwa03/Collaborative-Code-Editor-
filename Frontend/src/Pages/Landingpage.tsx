  import axios from "axios"
  import { useState, useEffect, useRef } from "react"
  import { useNavigate } from "react-router-dom"

  // ─── Terminal animation data ───────────────────────────────────────────────────
  const BOOT_SEQUENCE = [
    { text: "CODELINK RUNTIME v3.1.0", type: "header", delay: 0 },
    { text: "──────────────────────────────────────", type: "divider", delay: 120 },
    { text: "► Mounting distributed file system...", type: "cmd", delay: 350 },
    { text: "  ✓ ext4 @ /workspace [mounted]", type: "ok", delay: 700 },
    { text: "► Resolving peer topology...", type: "cmd", delay: 1050 },
    { text: "  ✓ 6 nodes discovered (RTT avg 12ms)", type: "ok", delay: 1400 },
    { text: "► Spawning WebSocket relay...", type: "cmd", delay: 1750 },
    { text: "  ✓ wss://relay.codelink.io:443 [OPEN]", type: "ok", delay: 2100 },
    { text: "► Compiling hot-reload daemon...", type: "cmd", delay: 2450 },
    { text: "  ✓ esbuild 0.21.3 — 847μs", type: "ok", delay: 2800 },
    { text: "► Establishing E2E encryption...", type: "cmd", delay: 3150 },
    { text: "  ✓ ChaCha20-Poly1305 handshake complete", type: "ok", delay: 3500 },
    { text: "──────────────────────────────────────", type: "divider", delay: 3750 },
    { text: "  SESSION READY · 6 collaborators live", type: "ready", delay: 3950 },
  ]

  const CODE_LINES = [
    { ln: "1",  tokens: [{ t: "keyword", v: "import" }, { t: "plain", v: " { " }, { t: "ident", v: "Runtime" }, { t: "plain", v: ", " }, { t: "ident", v: "Peer" }, { t: "plain", v: " } " }, { t: "keyword", v: "from" }, { t: "string", v: " '@codelink/core'" }] },
    { ln: "2",  tokens: [{ t: "keyword", v: "import" }, { t: "plain", v: " { " }, { t: "ident", v: "sync" }, { t: "plain", v: " } " }, { t: "keyword", v: "from" }, { t: "string", v: " '@codelink/crdt'" }] },
    { ln: "3",  tokens: [{ t: "plain", v: "" }] },
    { ln: "4",  tokens: [{ t: "comment", v: "// Initialize collaborative session" }] },
    { ln: "5",  tokens: [{ t: "keyword", v: "const" }, { t: "plain", v: " " }, { t: "ident", v: "session" }, { t: "plain", v: " = " }, { t: "keyword", v: "await" }, { t: "plain", v: " " }, { t: "ident", v: "Runtime" }, { t: "plain", v: "." }, { t: "fn", v: "init" }, { t: "plain", v: "({" }] },
    { ln: "6",  tokens: [{ t: "plain", v: "  " }, { t: "prop", v: "engine" }, { t: "plain", v: ": " }, { t: "string", v: "'v8-turbo'" }, { t: "plain", v: "," }] },
    { ln: "7",  tokens: [{ t: "plain", v: "  " }, { t: "prop", v: "peers" }, { t: "plain", v: ": " }, { t: "number", v: "6" }, { t: "plain", v: "," }] },
    { ln: "8",  tokens: [{ t: "plain", v: "  " }, { t: "prop", v: "encrypted" }, { t: "plain", v: ": " }, { t: "bool", v: "true" }, { t: "plain", v: "," }] },
    { ln: "9",  tokens: [{ t: "plain", v: "})" }] },
    { ln: "10", tokens: [{ t: "plain", v: "" }] },
    { ln: "11", tokens: [{ t: "ident", v: "session" }, { t: "plain", v: "." }, { t: "fn", v: "on" }, { t: "plain", v: "(" }, { t: "string", v: "'delta'" }, { t: "plain", v: ", " }, { t: "ident", v: "sync" }, { t: "plain", v: "." }, { t: "fn", v: "apply" }, { t: "plain", v: ")" }] },
  ]

  const TOKEN_COLORS: Record<string, string> = {
    keyword: "#c792ea",
    ident:   "#82aaff",
    string:  "#c3e88d",
    fn:      "#82aaff",
    prop:    "#f78c6c",
    number:  "#f78c6c",
    bool:    "#ff5874",
    comment: "#546e7a",
    plain:   "#a6accd",
  }

  // ─── Token renderer ────────────────────────────────────────────────────────────
  function CodeToken({ t, v }: { t: string; v: string }) {
    return <span style={{ color: TOKEN_COLORS[t] ?? TOKEN_COLORS.plain }}>{v}</span>
  }

  // ─── Animated terminal output ──────────────────────────────────────────────────
  function TerminalOutput() {
    const [visible, setVisible] = useState(0)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (visible >= BOOT_SEQUENCE.length) return
      const timer = setTimeout(
        () => setVisible(v => v + 1),
        visible === 0 ? 0 : BOOT_SEQUENCE[visible].delay - BOOT_SEQUENCE[visible - 1].delay
      )
      return () => clearTimeout(timer)
    }, [visible])

    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [visible])

    const lineColor = (type: string) => {
      if (type === "ok")      return "#4ade80"
      if (type === "ready")   return "#00f0ff"
      if (type === "header")  return "#e2e8f0"
      if (type === "divider") return "#1e293b"
      return "#64748b"
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        {BOOT_SEQUENCE.slice(0, visible).map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11.5px",
              lineHeight: "1.8",
              color: lineColor(line.type),
              fontWeight: line.type === "header" || line.type === "ready" ? 600 : 400,
              letterSpacing: "0.01em",
              animation: "termLine 0.2s ease forwards",
            }}
          >
            {line.text}
          </div>
        ))}
        {visible >= BOOT_SEQUENCE.length && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
            <span style={{ color: "#4ade80", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>$</span>
            <span style={{
              display: "inline-block", width: "7px", height: "13px",
              background: "#00f0ff", borderRadius: "1px", verticalAlign: "middle",
              animation: "blink 1s step-end infinite",
            }} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    )
  }

  // ─── Main Component ────────────────────────────────────────────────────────────
  const Landingpage = () => {
    const [isSignup, setisSignup] = useState<boolean>(true)
    const navigate = useNavigate()

    // @ts-ignore
    async function handlesignup(e) {
      console.log('In the handlesignup function')
      e.preventDefault()
      const formdata = new FormData(e.currentTarget)
      const content = Object.fromEntries(formdata)
      try {
        const response = await axios.post('http://localhost:3000/api/v1/signup', content)
        alert(response.data.message)
        setisSignup(false)
      } catch (e) {
        // @ts-ignore
        alert(e.response.data.message)
      }
    }

    // @ts-ignore
    async function handlesignin(e) {
      e.preventDefault()
      const formdata = new FormData(e.currentTarget)
      const content = Object.fromEntries(formdata)
      try {
        const response = await axios.post('http://localhost:3000/api/v1/signin', content)
        const ctoken = response.data.token
        localStorage.setItem('authorization', ctoken)
        alert(response.data.message)
        navigate('/Dashboard')
      } catch (e) {
        // @ts-ignore
        alert(e.response.data.message)
      }
    }

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,700;1,300&family=Geist:wght@300;400;500;600;700;800&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          :root {
            --cyan:   #00f0ff;
            --purple: #a855f7;
            --green:  #4ade80;
            --bg:     #09090b;
            --panel:  #0d0d10;
            --border: rgba(255,255,255,0.06);
          }

          @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:0} }
          @keyframes termLine   { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:none} }
          @keyframes fadeUp     { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
          @keyframes scanDown   { 0%{top:-10%;opacity:0} 10%{opacity:.04} 90%{opacity:.04} 100%{top:110%;opacity:0} }
          @keyframes gridShimmer{ 0%,100%{opacity:.04} 50%{opacity:.09} }
          @keyframes cornerPulse{ 0%,100%{opacity:.4} 50%{opacity:1} }
          @keyframes liveFlash  { 0%,100%{opacity:1} 50%{opacity:.25} }
          @keyframes formFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

          .lp-root {
            font-family: 'Geist', system-ui, sans-serif;
            background: var(--bg);
            min-height: 100vh;
            display: flex;
            overflow: hidden;
          }

          /* LEFT */
          .lp-left {
            width: 50%; display: flex; flex-direction: column;
            justify-content: center; align-items: center;
            padding: 48px 56px; position: relative;
            border-right: 1px solid var(--border); overflow: hidden;
          }
          .lp-grid {
            position: absolute; inset: 0;
            background-image: linear-gradient(var(--border) 1px, transparent 1px),
                              linear-gradient(90deg, var(--border) 1px, transparent 1px);
            background-size: 48px 48px;
            animation: gridShimmer 5s ease-in-out infinite;
            pointer-events: none;
          }
          .lp-blob {
            position: absolute; width: 360px; height: 360px; border-radius: 50%;
            background: radial-gradient(circle, rgba(0,240,255,0.055) 0%, transparent 70%);
            top: 50%; left: 50%; transform: translate(-60%,-60%);
            pointer-events: none;
          }
          .lp-corner { position: absolute; width: 22px; height: 22px; }
          .lp-tl { top:22px; left:22px; border-top:1px solid var(--cyan); border-left:1px solid var(--cyan); animation:cornerPulse 3s ease-in-out infinite; }
          .lp-br { bottom:22px; right:22px; border-bottom:1px solid var(--purple); border-right:1px solid var(--purple); animation:cornerPulse 3s ease-in-out infinite 1.5s; }

          .lp-content { position:relative; z-index:1; width:100%; max-width:400px; animation:fadeUp .7s ease forwards; }

          .lp-badge {
            display:inline-flex; align-items:center; gap:8px;
            background:rgba(0,240,255,.05); border:1px solid rgba(0,240,255,.15);
            border-radius:999px; padding:5px 14px 5px 10px; margin-bottom:32px;
          }
          .lp-badge-dot {
            width:6px; height:6px; border-radius:50%; background:var(--cyan);
            animation:liveFlash 2s ease-in-out infinite; box-shadow:0 0 6px var(--cyan);
          }
          .lp-badge-text {
            font-family:'JetBrains Mono',monospace; font-size:11px;
            color:rgba(0,240,255,.7); letter-spacing:.08em;
          }

          .lp-headline {
            font-size: clamp(28px,3.5vw,42px); font-weight:800;
            line-height:1.1; letter-spacing:-.03em; margin-bottom:16px;
            background:linear-gradient(135deg,#fff 0%,#c0e8ff 40%,#00f0ff 70%,#a855f7 100%);
            -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          }
          .lp-sub {
            font-size:14px; color:rgba(255,255,255,.32); line-height:1.65;
            margin-bottom:40px; font-weight:300; letter-spacing:.01em;
          }

          /* Card */
          .lp-card {
            background:rgba(255,255,255,.025); border:1px solid var(--border);
            border-radius:16px; padding:24px; backdrop-filter:blur(20px);
            position:relative; overflow:hidden;
          }
          .lp-card::before {
            content:''; position:absolute; top:0; left:0; right:0; height:1px;
            background:linear-gradient(90deg,transparent,rgba(0,240,255,.28),transparent);
          }

          /* Toggle */
          .lp-toggle {
            display:flex; background:rgba(0,0,0,.4); border:1px solid var(--border);
            border-radius:999px; padding:3px; margin-bottom:24px; position:relative;
          }
          .lp-slider {
            position:absolute; top:3px; bottom:3px; left:3px;
            width:calc(50% - 3px);
            background:linear-gradient(135deg,rgba(0,240,255,.12),rgba(168,85,247,.12));
            border:1px solid rgba(0,240,255,.25); border-radius:999px;
            transition:transform .35s cubic-bezier(.34,1.3,.64,1);
            box-shadow:0 0 16px rgba(0,240,255,.08);
          }
          .lp-tbtn {
            flex:1; text-align:center; padding:8px 0;
            font-family:'JetBrains Mono',monospace; font-size:11.5px;
            letter-spacing:.06em; cursor:pointer; position:relative; z-index:1;
            border:none; background:transparent; border-radius:999px;
            transition:color .25s;
          }

          /* Forms */
          .lp-form-wrap { position:relative; }
          .lp-form { display:flex; flex-direction:column; gap:12px; transition:opacity .3s,transform .3s; }
          .lp-hidden { opacity:0; transform:translateY(6px); pointer-events:none; position:absolute; top:0; left:0; right:0; }
          .lp-visible { opacity:1; transform:translateY(0); animation:formFadeIn .3s ease forwards; }

          .lp-field { display:flex; flex-direction:column; gap:6px; }
          .lp-label {
            font-family:'JetBrains Mono',monospace; font-size:10.5px;
            color:rgba(255,255,255,.22); letter-spacing:.08em;
          }
          .lp-input {
            background:rgba(0,0,0,.55); border:1px solid rgba(255,255,255,.07);
            border-radius:8px; padding:10px 14px; color:rgba(255,255,255,.85);
            font-family:'JetBrains Mono',monospace; font-size:13px;
            outline:none; transition:border-color .2s,box-shadow .2s; width:100%;
          }
          .lp-input::placeholder { color:rgba(255,255,255,.18); }
          .lp-input:focus {
            border-color:rgba(0,240,255,.4);
            box-shadow:0 0 0 3px rgba(0,240,255,.07),inset 0 0 12px rgba(0,240,255,.02);
          }
          .lp-submit {
            margin-top:4px; padding:12px; width:100%; border-radius:8px;
            border:1px solid rgba(0,240,255,.3);
            background:linear-gradient(135deg,rgba(0,240,255,.1),rgba(168,85,247,.08));
            color:var(--cyan); font-family:'JetBrains Mono',monospace;
            font-size:12px; font-weight:500; letter-spacing:.07em;
            cursor:pointer; position:relative; overflow:hidden;
            transition:box-shadow .25s,border-color .25s,transform .1s;
          }
          .lp-submit::after {
            content:''; position:absolute; inset:0;
            background:linear-gradient(135deg,rgba(0,240,255,.15),rgba(168,85,247,.15));
            opacity:0; transition:opacity .25s;
          }
          .lp-submit:hover::after { opacity:1; }
          .lp-submit:hover { box-shadow:0 0 24px rgba(0,240,255,.18); border-color:rgba(0,240,255,.5); }
          .lp-submit:active { transform:scale(.985); }

          .lp-foot {
            text-align:center; margin-top:20px;
            font-family:'JetBrains Mono',monospace; font-size:11px;
            color:rgba(255,255,255,.2);
          }
          .lp-foot button {
            background:none; border:none; cursor:pointer;
            color:rgba(0,240,255,.5); font-family:inherit; font-size:inherit;
            text-decoration:underline; text-underline-offset:3px; transition:color .2s;
          }
          .lp-foot button:hover { color:var(--cyan); }

          /* RIGHT */
          .lp-right {
            width:50%; display:flex; flex-direction:column;
            justify-content:center; align-items:center;
            padding:40px 48px; position:relative; overflow:hidden;
            background:var(--panel);
          }
          .lp-scan {
            position:absolute; left:0; right:0; height:120px;
            background:linear-gradient(to bottom,transparent,rgba(0,240,255,.025),transparent);
            animation:scanDown 7s linear infinite; pointer-events:none; z-index:0;
          }
          .lp-rglow {
            position:absolute; inset:0;
            background:radial-gradient(ellipse 70% 60% at 70% 40%,rgba(168,85,247,.05) 0%,transparent 70%);
            pointer-events:none;
          }

          /* IDE */
          .lp-ide {
            position:relative; z-index:1; width:100%; max-width:560px;
            border-radius:14px; overflow:hidden;
            border:1px solid rgba(255,255,255,.07);
            box-shadow:0 0 0 1px rgba(0,240,255,.04),0 40px 100px rgba(0,0,0,.7),0 0 80px rgba(0,240,255,.03);
            animation:fadeUp .8s .15s ease both;
          }
          .lp-titlebar {
            display:flex; align-items:center; justify-content:space-between;
            padding:11px 16px;
            background:rgba(255,255,255,.03);
            border-bottom:1px solid rgba(255,255,255,.05);
          }
          .lp-dots { display:flex; align-items:center; gap:7px; }
          .lp-dot { width:12px; height:12px; border-radius:50%; box-shadow:inset 0 -1px 2px rgba(0,0,0,.3); }
          .lp-fname { font-family:'JetBrains Mono',monospace; font-size:11px; color:rgba(255,255,255,.22); }
          .lp-live { display:flex; align-items:center; gap:5px; font-family:'JetBrains Mono',monospace; font-size:10px; color:rgba(74,222,128,.7); }
          .lp-ldot { width:5px; height:5px; border-radius:50%; background:#4ade80; animation:liveFlash 1.5s ease-in-out infinite; box-shadow:0 0 5px #4ade80; }

          .lp-tabs { display:flex; background:rgba(0,0,0,.3); border-bottom:1px solid rgba(255,255,255,.04); }
          .lp-tab { padding:8px 18px; font-family:'JetBrains Mono',monospace; font-size:11px; }
          .lp-tact { color:rgba(0,240,255,.7); border-bottom:1px solid rgba(0,240,255,.4); background:rgba(0,240,255,.03); }
          .lp-tinact { color:rgba(255,255,255,.2); }

          .lp-editor { display:flex; background:rgba(0,0,0,.5); min-height:200px; }
          .lp-gutter {
            display:flex; flex-direction:column; padding:16px 12px;
            background:rgba(0,0,0,.25); border-right:1px solid rgba(255,255,255,.03);
            min-width:44px; user-select:none;
          }
          .lp-ln { font-family:'JetBrains Mono',monospace; font-size:11.5px; line-height:1.75; color:rgba(255,255,255,.12); text-align:right; }
          .lp-cbody { padding:16px 20px; overflow-x:auto; flex:1; }
          .lp-cline { font-family:'JetBrains Mono',monospace; font-size:12.5px; line-height:1.75; white-space:nowrap; animation:fadeUp .4s ease both; }

          .lp-terminal {
            background:rgba(0,0,0,.65); border-top:1px solid rgba(255,255,255,.04);
            padding:16px 20px 20px; min-height:220px; overflow-y:auto;
          }
          .lp-thead {
            font-family:'JetBrains Mono',monospace; font-size:10px;
            color:rgba(255,255,255,.18); letter-spacing:.1em;
            margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,.04); padding-bottom:8px;
          }
          .lp-sbar {
            display:flex; justify-content:space-between; align-items:center;
            padding:6px 16px; background:rgba(0,240,255,.05);
            border-top:1px solid rgba(0,240,255,.1);
          }
          .lp-stat { font-family:'JetBrains Mono',monospace; font-size:10.5px; color:rgba(0,240,255,.45); letter-spacing:.05em; display:flex; align-items:center; gap:16px; }

          .lp-peers { display:flex; margin-top:20px; gap:10px; align-items:center; }
          .lp-peer {
            width:28px; height:28px; border-radius:50%;
            border:1px solid rgba(0,240,255,.2);
            display:flex; align-items:center; justify-content:center;
            font-family:'JetBrains Mono',monospace; font-size:10px;
            color:rgba(0,240,255,.6); background:rgba(0,240,255,.05);
          }
          .lp-plabel { font-family:'JetBrains Mono',monospace; font-size:11px; color:rgba(255,255,255,.2); }

          @media(max-width:768px){
            .lp-root{flex-direction:column;}
            .lp-left,.lp-right{width:100%;padding:36px 24px;}
            .lp-right{border-top:1px solid var(--border);}
            .lp-content,.lp-ide{max-width:100%;}
          }
        `}</style>

        <div className="lp-root">

          {/* ══════════════ LEFT — Hero & Auth ══════════════ */}
          <div className="lp-left">
            <div className="lp-grid" />
            <div className="lp-blob" />
            <div className="lp-corner lp-tl" />
            <div className="lp-corner lp-br" />

            <div className="lp-content">
              <div className="lp-badge">
                <span className="lp-badge-dot" />
                <span className="lp-badge-text">BETA · 6 peers online</span>
              </div>

              <h1 className="lp-headline">
                Code Together.<br />Execute Anywhere.
              </h1>
              <p className="lp-sub">
                A zero-latency collaborative IDE built for engineering teams who ship at the speed of thought.
              </p>

              {/* Auth card */}
              <div className="lp-card">
                {/* Toggle pill */}
                <div className="lp-toggle">
                  <div
                    className="lp-slider"
                    style={{ transform: isSignup ? "translateX(0)" : "translateX(calc(100%))" }}
                  />
                  <button
                    type="button"
                    className="lp-tbtn"
                    style={{ color: isSignup ? "rgba(0,240,255,.9)" : "rgba(255,255,255,.28)" }}
                    onClick={() => setisSignup(true)}
                  >
                    _sign_up
                  </button>
                  <button
                    type="button"
                    className="lp-tbtn"
                    style={{ color: !isSignup ? "rgba(0,240,255,.9)" : "rgba(255,255,255,.28)" }}
                    onClick={() => setisSignup(false)}
                  >
                    _sign_in
                  </button>
                </div>

                {/* Forms */}
                <div className="lp-form-wrap">

                  {/* Sign Up */}
                  <div className={`lp-form ${isSignup ? "lp-visible" : "lp-hidden"}`}>
                    <form style={{ display: "flex", flexDirection: "column", gap: "12px" }} onSubmit={handlesignup}>
                      <div className="lp-field">
                        <label className="lp-label">username</label>
                        <input name="username" className="lp-input" type="text" placeholder="your_handle" tabIndex={isSignup ? 0 : -1} />
                      </div>
                      <div className="lp-field">
                        <label className="lp-label">email</label>
                        <input name="email" className="lp-input" type="text" placeholder="you@company.io" tabIndex={isSignup ? 0 : -1} />
                      </div>
                      <div className="lp-field">
                        <label className="lp-label">password</label>
                        <input name="password" className="lp-input" type="password" placeholder="••••••••••••" tabIndex={isSignup ? 0 : -1} />
                      </div>
                      <button type="submit" className="lp-submit" tabIndex={isSignup ? 0 : -1}>
                        → INITIALIZE ACCOUNT
                      </button>
                    </form>
                  </div>

                  {/* Sign In */}
                  <div className={`lp-form ${!isSignup ? "lp-visible" : "lp-hidden"}`}>
                    <form style={{ display: "flex", flexDirection: "column", gap: "12px" }} onSubmit={handlesignin}>
                      <div className="lp-field">
                        <label className="lp-label">email</label>
                        <input name="email" className="lp-input" type="text" placeholder="you@company.io" tabIndex={!isSignup ? 0 : -1} />
                      </div>
                      <div className="lp-field">
                        <label className="lp-label">password</label>
                        <input name="password" className="lp-input" type="password" placeholder="••••••••••••" tabIndex={!isSignup ? 0 : -1} />
                      </div>
                      <button type="submit" className="lp-submit" tabIndex={!isSignup ? 0 : -1}>
                        → AUTHENTICATE
                      </button>
                    </form>
                  </div>
                </div>

                <div className="lp-foot">
                  {isSignup ? "// already deployed?" : "// new to codelink?"}{" "}
                  <button type="button" onClick={() => setisSignup(!isSignup)}>
                    {isSignup ? "sign_in()" : "sign_up()"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════ RIGHT — IDE Demo ══════════════ */}
          <div className="lp-right">
            <div className="lp-scan" />
            <div className="lp-rglow" />

            <div className="lp-ide">
              {/* Title bar */}
              <div className="lp-titlebar">
                <div className="lp-dots">
                  <div className="lp-dot" style={{ background: "#ff5f57" }} />
                  <div className="lp-dot" style={{ background: "#ffbd2e" }} />
                  <div className="lp-dot" style={{ background: "#28c840" }} />
                </div>
                <span className="lp-fname">session.ts — codelink/runtime</span>
                <div className="lp-live">
                  <div className="lp-ldot" />
                  LIVE
                </div>
              </div>

              {/* Tabs */}
              <div className="lp-tabs">
                <div className="lp-tab lp-tact">session.ts</div>
                <div className="lp-tab lp-tinact">sync.ts</div>
                <div className="lp-tab lp-tinact">relay.ts</div>
              </div>

              {/* Code editor */}
              <div className="lp-editor">
                <div className="lp-gutter">
                  {CODE_LINES.map(l => (
                    <span key={l.ln} className="lp-ln">{l.ln}</span>
                  ))}
                  <span className="lp-ln" style={{ color: "rgba(0,240,255,.25)" }}>12</span>
                </div>
                <div className="lp-cbody">
                  {CODE_LINES.map((line, i) => (
                    <div key={i} className="lp-cline" style={{ animationDelay: `${i * 60}ms` }}>
                      {line.tokens.map((tok, j) => (
                        <CodeToken key={j} t={tok.t} v={tok.v} />
                      ))}
                    </div>
                  ))}
                  {/* Blinking cursor */}
                  <div className="lp-cline" style={{ animationDelay: `${CODE_LINES.length * 60}ms` }}>
                    <span style={{
                      display: "inline-block", width: "7px", height: "14px",
                      background: "rgba(0,240,255,.7)", borderRadius: "1px",
                      verticalAlign: "middle", animation: "blink 1s step-end infinite",
                    }} />
                  </div>
                </div>
              </div>

              {/* Terminal */}
              <div className="lp-terminal">
                <div className="lp-thead">TERMINAL — zsh · node v22.0.0</div>
                <TerminalOutput />
              </div>

              {/* Status bar */}
              <div className="lp-sbar">
                <div className="lp-stat">
                  <span>TypeScript</span>
                  <span>UTF-8</span>
                  <span>Ln 12, Col 1</span>
                </div>
                <div className="lp-stat">
                  <span>Git: main ✓</span>
                  <span>6 peers</span>
                </div>
              </div>
            </div>

            {/* Peer avatars */}
            <div className="lp-peers">
              <span className="lp-plabel">collaborating:</span>
              {["AK", "SR", "JL", "DM", "RB", "+2"].map(p => (
                <div key={p} className="lp-peer">{p}</div>
              ))}
            </div>
          </div>

        </div>
      </>
    )
  }

  export default Landingpage

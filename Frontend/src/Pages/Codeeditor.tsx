import { Editor } from "@monaco-editor/react"
import { useEffect, useRef, useState } from "react"
import axios from 'axios'
import { useNavigate, useParams } from "react-router-dom"
import {toast} from 'react-toastify'


const Codeeditor = () => {
  const navigate = useNavigate()
  const [websocket, setwebsocket] = useState<WebSocket>()
  // @ts-ignore
  const [uname, setuname] = useState<string>()
  const [content, setcurrcontent] = useState<string>("//Write your js code here !!!")
  const [cexecutedvalue, setcexecutedvalue] = useState<string>()
  const [croomusers, setcroomusers] = useState<string[]>()
  const { roomId } = useParams()


  // On Mounting, the content already present in that room is fetched, websocket connection is established as well as the message on the websocket connection received is displayed on the screen.
  useEffect(() => {

    // Before establishing a websocket server, i'll hit the backend to get the content present corresponding to that room.
    async function getcontent() {
      try {
        const token = localStorage.getItem('authorization')
        const response = await axios.get(`http://localhost:3000/api/v1/join-room/${roomId}`,
          { headers: { authorization: token } })

        const fetchedcontent = response.data.content

        if(fetchedcontent && fetchedcontent.trim() !== ""){
          setcurrcontent(fetchedcontent)
        }
      }
      catch (e) {
        // @ts-ignore
        toast.error(e.response?.data?.message || "Something went wrong!");
        // @ts-ignore
        if (e.response.data.message === 'Session Expired') {
          localStorage.removeItem('authorization')
          navigate('/')
        }
        else {
          navigate('/Dashboard')
        }
      }
    }
    getcontent()

    // Websocket connection is Established.
    const username = localStorage.getItem('username') || 'Peer'
    setuname(username);
    const ws = new WebSocket('ws://localhost:8080')
    setwebsocket(ws)

    ws.onopen = () => {
      const temproom = {
        type: 'join',
        payload: {
          roomId: roomId,
          username: username
        }
      }
      ws.send(JSON.stringify(temproom))
    }

    // When my friend types the code and i have to update it in the editor.
    ws.onmessage = (data) => {
      // @ts-ignore
      const parseddata = JSON.parse(data.data)

      if (parseddata.type === 'join') {
        // To just alert every person in the room including the person who has joined the room.
        const curruser = parseddata.payload.username

        if (curruser) {
          toast.info(`${curruser} has joined the Room!`)
        }

      }
      // important
      else if (parseddata.type === 'code') {
        setcurrcontent(parseddata.payload.content)
      }
      else if(parseddata.type === 'room_users'){
        const croomunames = parseddata.userspresent
        setcroomusers(croomunames)
      }
    }


    // return ws.onclose()

  }, [])

  // Storing the data in the DB, to basically remove the ephemeral storage.
  async function storeinDB(value: String) {
    // we have to call the backend to give the content present on the screen to the DB
    try {
      // @ts-ignore
      const response = await axios.post('http://localhost:3000/api/v1/save-code', {
        croomId: roomId,
        content: value
      })
      console.log(response.data.message)
    } catch (e) {
      console.log('Error encountered as : ', e)
    }
  }

  // When i type the code, i have to send it to the server but i dont have to update the content state.
  // @ts-ignore
  const currclock = useRef(null)
  // @ts-ignore
  const handlemytype = (value: string | undefined, event) => {
    if (value !== undefined) {
      setcurrcontent(value)
    }

    if (currclock.current) {
      clearTimeout(currclock.current)
    }

    if (value) {
      // @ts-ignore
      currclock.current = setTimeout(() => { storeinDB(value) }, 5000)
    }

    const data = {
      type: 'code',
      payload: {
        roomId: roomId,
        content: value
      }
    }
    websocket?.send(JSON.stringify(data))
  }

  async function handlerunbutton() {
    try {
      const token = localStorage.getItem('authorization')

      const response = await axios.post('http://localhost:3000/api/v1/run-code', {
        // for now i have hardcoded the language and the versionindex.
        content: content,
        language: "nodejs",
        versionindex: "4"
      },
        {
          "headers": {
            "authorization": token
          }
        })

      const message = response.data.message
      const output = response.data.output
      toast.info(message)
     
      setcexecutedvalue(output)
      console.log('output is: ', output)

    } catch (e) {
      // @ts-ignore
      const message = e.response ? e.response.data : e.message
      // @ts-ignore
      const error = e.response ? e.response.data : e.error

      setcexecutedvalue(error.message)
    }
  }


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Manrope:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:       #09090b;
          --c:        #00f0ff;
          --c8:       rgba(0, 240, 255, 0.08);
          --c15:      rgba(0, 240, 255, 0.15);
          --c30:      rgba(0, 240, 255, 0.30);
          --green:    #4ade80;
          --g8:       rgba(74, 222, 128, 0.08);
          --surface:  rgba(0, 0, 0, 0.45);
          --border:   rgba(255, 255, 255, 0.07);
          --border2:  rgba(255, 255, 255, 0.11);
          --t1:       rgba(255, 255, 255, 0.88);
          --t2:       rgba(255, 255, 255, 0.45);
          --t3:       rgba(255, 255, 255, 0.20);
          --mono:     'JetBrains Mono', monospace;
          --sans:     'Manrope', system-ui, sans-serif;
          --shadow:   0 32px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5);
          --shadow-sm: 0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4);
        }

        /* ── Keyframes — only smooth, no flicker ────────────────────────── */

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes panelRise {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4); }
          50%       { box-shadow: 0 0 0 4px rgba(74, 222, 128, 0); }
        }
        @keyframes executeBreathe {
          0%, 100% { box-shadow: 0 0 0 1px rgba(0,240,255,0.2), 0 0 16px rgba(0,240,255,0.06); }
          50%       { box-shadow: 0 0 0 1px rgba(0,240,255,0.35), 0 0 28px rgba(0,240,255,0.12); }
        }
        @keyframes outputBlink {
          0%, 100% { border-color: rgba(74,222,128,0.15); }
          50%       { border-color: rgba(74,222,128,0.28); }
        }

        /* ── Canvas root ─────────────────────────────────────────────────── */

        .ce-canvas {
          font-family: var(--sans);
          background-color: var(--bg);
          background-image: radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px);
          background-size: 28px 28px;
          min-height: 100vh;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Ambient depth blobs — no animation, just atmosphere */
        .ce-canvas::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 50% 40% at 15% 10%, rgba(0,240,255,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 40% 35% at 85% 90%, rgba(124,58,237,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 30% 30% at 50% 50%, rgba(0,0,0,0.3) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Dynamic Island ──────────────────────────────────────────────── */

        .ce-island {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 0;
          background: rgba(10, 10, 14, 0.85);
          border: 1px solid var(--border2);
          border-radius: 999px;
          padding: 0;
          backdrop-filter: blur(24px);
          box-shadow: var(--shadow-sm), 0 0 0 1px rgba(255,255,255,0.04);
          animation: fadeIn 0.5s ease both;
          white-space: nowrap;
          overflow: hidden;
        }

        /* Island left segment */
        .ce-island-left {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px 9px 14px;
          border-right: 1px solid var(--border);
        }
        .ce-live-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 6px rgba(74,222,128,0.6);
          animation: livePulse 2.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        .ce-live-text {
          font-family: var(--mono);
          font-size: 10px;
          font-weight: 500;
          color: rgba(74,222,128,0.8);
          letter-spacing: 0.12em;
        }

        /* Island center — room/file info */
        .ce-island-center {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 16px;
          border-right: 1px solid var(--border);
        }
        .ce-island-label {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--t3);
          letter-spacing: 0.08em;
        }
        .ce-island-id {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--c);
          letter-spacing: 0.06em;
          opacity: 0.75;
        }

        /* Island right — collab info */
        .ce-island-right {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
        }
        .ce-collab-avatars {
          display: flex;
          align-items: center;
          gap: -4px;
        }
        .ce-avatar {
          width: 20px; height: 20px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--mono);
          font-size: 8px;
          font-weight: 600;
          margin-left: -5px;
        }
        .ce-avatar:first-child { margin-left: 0; }
        .ce-avatar-1 { background: rgba(0,240,255,0.2); color: var(--c); }
        .ce-avatar-2 { background: rgba(124,58,237,0.2); color: #c084fc; }
        .ce-avatar-3 { background: rgba(74,222,128,0.2); color: var(--green); }
        .ce-collab-count {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--t3);
          letter-spacing: 0.06em;
        }

        /* ── Main stage ──────────────────────────────────────────────────── */

        .ce-stage {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          width: 100%;
          max-width: 100vw;
          height: 100vh;
          padding: 82px 20px 80px;
        }

        /* ── Floating panel base ─────────────────────────────────────────── */

        .ce-panel {
          display: flex;
          flex-direction: column;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          backdrop-filter: blur(20px);
          box-shadow: var(--shadow);
          height: 100%;
          animation: panelRise 0.6s ease both;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .ce-panel:hover {
          border-color: rgba(255,255,255,0.11);
        }
        .ce-panel-editor { flex: 55; animation-delay: 0.05s; }
        .ce-panel-output { flex: 45; animation-delay: 0.12s; }

        /* Subtle top shimmer on panels */
        .ce-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          pointer-events: none;
        }

        /* ── Panel title bar ─────────────────────────────────────────────── */

        .ce-titlebar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-bottom: 1px solid var(--border);
          background: rgba(0,0,0,0.25);
          flex-shrink: 0;
        }
        .ce-titlebar-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ce-traffic-lights {
          display: flex;
          gap: 5px;
          align-items: center;
        }
        .ce-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          opacity: 0.75;
        }
        .ce-dot-r { background: #ff5f57; }
        .ce-dot-y { background: #ffbd2e; }
        .ce-dot-g { background: #28c840; }

        .ce-panel-title {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--t2);
          letter-spacing: 0.08em;
        }
        .ce-titlebar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ce-lang-badge {
          font-family: var(--mono);
          font-size: 9.5px;
          color: rgba(0,240,255,0.5);
          background: rgba(0,240,255,0.06);
          border: 1px solid rgba(0,240,255,0.12);
          border-radius: 4px;
          padding: 2px 7px;
          letter-spacing: 0.08em;
        }
        .ce-status-badge {
          font-family: var(--mono);
          font-size: 9.5px;
          color: rgba(74,222,128,0.55);
          background: rgba(74,222,128,0.06);
          border: 1px solid rgba(74,222,128,0.12);
          border-radius: 4px;
          padding: 2px 7px;
          letter-spacing: 0.08em;
        }

        /* ── Editor wrapper ──────────────────────────────────────────────── */

        .ce-editor-wrap {
          flex: 1;
          overflow: hidden;
          position: relative;
          min-height: 0;
        }

        /* Editor line gutter accent */
        .ce-editor-wrap::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 1px; height: 100%;
          background: linear-gradient(to bottom, transparent, rgba(0,240,255,0.08), transparent);
          pointer-events: none;
          z-index: 2;
        }

        /* ── Output console ───────────────────────────────────────────────── */

        .ce-output-body {
          flex: 1;
          padding: 16px 18px;
          overflow-y: auto;
          min-height: 0;
          font-family: var(--mono);
          font-size: 12.5px;
          line-height: 1.75;
          color: rgba(74, 222, 128, 0.85);
          white-space: pre-wrap;
          word-break: break-all;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.08) transparent;
        }
        .ce-output-body::-webkit-scrollbar { width: 4px; }
        .ce-output-body::-webkit-scrollbar-track { background: transparent; }
        .ce-output-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

        .ce-output-empty {
          color: var(--t3);
          font-family: var(--mono);
          font-size: 11.5px;
          letter-spacing: 0.04em;
          font-style: italic;
        }

        /* Prompt prefix styling */
        .ce-output-prompt {
          color: rgba(0,240,255,0.35);
          font-size: 11px;
          margin-bottom: 8px;
          display: block;
          letter-spacing: 0.08em;
        }

        /* Output panel when has content gets a subtle green border glow */
        .ce-panel-output.ce-has-output {
          border-color: rgba(74,222,128,0.12);
          animation: outputBlink 3s ease-in-out infinite;
        }

        /* ── Action Dock ─────────────────────────────────────────────────── */

        .ce-dock {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 1px;
          background: rgba(10, 10, 14, 0.88);
          border: 1px solid var(--border2);
          border-radius: 999px;
          padding: 5px;
          backdrop-filter: blur(24px);
          box-shadow: var(--shadow-sm), 0 0 0 1px rgba(255,255,255,0.04);
          animation: slideUp 0.5s 0.2s ease both;
        }

        /* Dock divider */
        .ce-dock-sep {
          width: 1px;
          height: 22px;
          background: var(--border);
          margin: 0 4px;
          flex-shrink: 0;
        }

        /* Dock label items */
        .ce-dock-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 999px;
          font-family: var(--mono);
          font-size: 10.5px;
          color: var(--t2);
          letter-spacing: 0.07em;
          cursor: default;
          transition: color 0.2s;
        }
        .ce-dock-item-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(74,222,128,0.5);
          box-shadow: 0 0 5px rgba(74,222,128,0.4);
          flex-shrink: 0;
        }

        /* Execute button — the hero CTA */
        .ce-execute-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 22px;
          border-radius: 999px;
          font-family: var(--mono);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.1em;
          color: var(--bg);
          background: linear-gradient(135deg, rgba(0,240,255,0.95) 0%, rgba(0,200,240,0.9) 100%);
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 0 0 1px rgba(0,240,255,0.3), 0 4px 20px rgba(0,240,255,0.25);
          animation: executeBreathe 3s ease-in-out infinite;
        }
        .ce-execute-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(255,255,255,0.2), transparent);
          pointer-events: none;
          border-radius: inherit;
        }
        .ce-execute-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 0 0 1px rgba(0,240,255,0.5), 0 6px 28px rgba(0,240,255,0.35);
          animation: none;
        }
        .ce-execute-btn:active {
          transform: scale(0.97);
          box-shadow: 0 0 0 1px rgba(0,240,255,0.4), 0 2px 12px rgba(0,240,255,0.2);
        }
        .ce-execute-icon {
          font-size: 13px;
          line-height: 1;
          flex-shrink: 0;
        }

        /* Dock info pills */
        .ce-dock-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 12px;
          border-radius: 999px;
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          color: var(--t3);
          transition: color 0.2s;
        }
        .ce-dock-pill:hover { color: var(--t2); }

        /* Autosave indicator */
        .ce-autosave {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: var(--mono);
          font-size: 9.5px;
          color: rgba(74,222,128,0.4);
          letter-spacing: 0.06em;
        }
        .ce-autosave-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: rgba(74,222,128,0.5);
        }

        @media (max-width: 900px) {
          .ce-stage { flex-direction: column; padding: 82px 12px 88px; gap: 12px; overflow-y: auto; }
          .ce-panel-editor, .ce-panel-output { flex: none; height: 50vh; }
          .ce-island-center, .ce-island-right { display: none; }
        }
      `}</style>

      <div className="ce-canvas">

        {/* ══ DYNAMIC ISLAND ════════════════════════════════════════════════ */}
        <div className="ce-island">
          {/* Left — LIVE indicator */}
          <div className="ce-island-left">
            <span className="ce-live-dot" />
            <span className="ce-live-text">LIVE</span>
          </div>

          {/* Center — Room ID (visual only, no logic) */}
          <div className="ce-island-center">
            <span className="ce-island-label">ROOM</span>
            <span className="ce-island-id">{roomId ?? 'SESSION_ID_HERE'}</span>
          </div>

          {/* Right — Collaborators */}
          <div className="ce-island-right">
            <div className="ce-collab-avatars">
              {croomusers && croomusers.map((user, index) => {
                // Ye logic 1, 2, 3 color classes ko cycle karega har naye user ke liye
                const avatarColorIndex = (index % 3) + 1;

                return (
                  <div
                    key={index}
                    className={`ce-avatar ce-avatar-${avatarColorIndex}`}
                    title={user}
                  >
                    {/* User ke naam ka pehla alphabet nikal kar Capitalize kar diya */}
                    {user ? user.charAt(0).toUpperCase() : '?'}
                  </div>
                );
              })}
            </div>

            {/* Dynamic Peers Count */}
            <span className="ce-collab-count">
              {croomusers && croomusers.length === 1
                ? '1 Person'
                : `${croomusers && croomusers.length} people`}
            </span>
          </div>
        </div>

        {/* ══ MAIN STAGE ════════════════════════════════════════════════════ */}
        <div className="ce-stage">

          {/* ── Editor Panel ── */}
          <div className="ce-panel ce-panel-editor" style={{ position: 'relative' }}>
            <div className="ce-titlebar">
              <div className="ce-titlebar-left">
                <div className="ce-traffic-lights">
                  <div className="ce-dot ce-dot-r" />
                  <div className="ce-dot ce-dot-y" />
                  <div className="ce-dot ce-dot-g" />
                </div>
                <span className="ce-panel-title">main.js</span>
              </div>
              <div className="ce-titlebar-right">
                <span className="ce-lang-badge">JavaScript</span>
                <span className="ce-status-badge">SYNCING</span>
              </div>
            </div>

            {/* Monaco Editor — only height/width changed, all logic untouched */}
            <div className="ce-editor-wrap">
              <Editor
                height="100%"
                width="100%"
                theme="vs-dark"
                defaultLanguage="javascript"
                value={content}
                onChange={handlemytype}
                options={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  lineHeight: 22,
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                  minimap: { enabled: false },
                  renderLineHighlight: 'none',
                  overviewRulerBorder: false,
                  scrollbar: {
                    verticalScrollbarSize: 4,
                    horizontalScrollbarSize: 4,
                  },
                }}
              />
            </div>
          </div>

          {/* ── Output Panel ── */}
          <div
            className={`ce-panel ce-panel-output${cexecutedvalue ? ' ce-has-output' : ''}`}
            style={{ position: 'relative' }}
          >
            <div className="ce-titlebar">
              <div className="ce-titlebar-left">
                <div className="ce-traffic-lights">
                  <div className="ce-dot ce-dot-r" />
                  <div className="ce-dot ce-dot-y" />
                  <div className="ce-dot ce-dot-g" />
                </div>
                <span className="ce-panel-title">OUTPUT_CONSOLE</span>
              </div>
              <div className="ce-titlebar-right">
                <span className="ce-lang-badge">node v22</span>
                {cexecutedvalue && (
                  <span className="ce-status-badge">DONE</span>
                )}
              </div>
            </div>

            <div className="ce-output-body">
              {cexecutedvalue ? (
                <>
                  <span className="ce-output-prompt">{'>'} process.stdout</span>
                  {cexecutedvalue}
                </>
              ) : (
                <span className="ce-output-empty">
                  {'// Awaiting execution...\n// Press ⚡ EXECUTE to run your code.'}
                </span>
              )}
            </div>
          </div>

        </div>

        {/* ══ ACTION DOCK ═══════════════════════════════════════════════════ */}
        <div className="ce-dock">
          {/* Left meta */}
          <div className="ce-dock-pill">
            <div className="ce-dock-item-dot" />
            WS CONNECTED
          </div>

          <div className="ce-dock-sep" />

          {/* Execute CTA */}
          <button className="ce-execute-btn" onClick={handlerunbutton}>
            <span className="ce-execute-icon">⚡</span>
            EXECUTE
          </button>

          <div className="ce-dock-sep" />

          {/* Right meta */}
          <div className="ce-dock-pill">
            <span className="ce-autosave">
              <span className="ce-autosave-dot" />
              AUTOSAVE
            </span>
          </div>
        </div>

      </div>
    </>
  )
}

export default Codeeditor

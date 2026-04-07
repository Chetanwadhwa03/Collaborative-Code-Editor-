import { Editor } from "@monaco-editor/react"
import { useEffect, useRef, useState } from "react"
import axios from 'axios'
import { useNavigate, useParams } from "react-router-dom"
import { toast } from 'react-toastify'

const Codeeditor = () => {
  const navigate = useNavigate()
  const [websocket, setwebsocket] = useState<WebSocket>()
  // @ts-ignore
  const [uname, setuname] = useState<string>()
  const [content, setcurrcontent] = useState<string>("//Write your js code here !!!")
  const [cexecutedvalue, setcexecutedvalue] = useState<string>()
  const [croomusers, setcroomusers] = useState<string[]>()
  const { roomId } = useParams()
  const [messages, setmessages] = useState<string[]>([])
  const textref = useRef<HTMLInputElement>(null)
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // NEW: Unread Messages State & Ref
  const [unreadCount, setUnreadCount] = useState(0)
  const isChatOpenRef = useRef(isChatOpen)

  // NEW: Keep the ref synced with the state, and clear unreads when opened
  useEffect(() => {
    isChatOpenRef.current = isChatOpen
    if (isChatOpen) {
      setUnreadCount(0)
    }
  }, [isChatOpen])

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isChatOpen]) // Also scroll when opened

  // Mounting
  useEffect(() => {
    async function getcontent() {
      try {
        const token = localStorage.getItem('authorization')
        const response = await axios.get(`http://localhost:3000/api/v1/join-room/${roomId}`,
          { headers: { authorization: token } })

        const fetchedcontent = response.data.content

        if (fetchedcontent && fetchedcontent.trim() !== "") {
          setcurrcontent(fetchedcontent)
        }
      }
      catch (e) {
        // @ts-ignore
        const errorMessage = e.response?.data?.message || "Something went wrong!";
        toast.error(errorMessage);
        if (errorMessage === 'Session Expired') {
          localStorage.removeItem('authorization')
          navigate('/')
        }
        else {
          navigate('/Dashboard')
        }
      }
    }
    getcontent()

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

    ws.onmessage = (data) => {
      // @ts-ignore
      const parseddata = JSON.parse(data.data)

      if (parseddata.type === 'join') {
        const curruser = parseddata.payload.username
        if (curruser) {
          toast.info(`${curruser} has joined the Room!`)
        }
      }
      else if (parseddata.type === 'code') {
        const recentlyarrivedcontent = parseddata.payload.content
        // If the content is different.
        if(editorref.current.getValue() !== recentlyarrivedcontent){
          editorref.current.setValue(recentlyarrivedcontent);
        }
        else{
          
        }
      }
      else if (parseddata.type === 'room_users') {
        const croomunames = parseddata.userspresent
        setcroomusers(croomunames)
      }
      else if (parseddata.type === 'chat') {
        const username = parseddata.payload.username
        const message = parseddata.payload.message

        setmessages((prev) => {
          return [...prev, `${username} : ${message}`]
        })

        // NEW: Increment unread count ONLY if the chat window is currently closed
        if (!isChatOpenRef.current) {
          setUnreadCount((prev) => prev + 1)
        }
      }
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [])

  // Debounce hook usuage function to store the data in the DB for that particular room
  async function storeinDB(value: String) {
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

  // @ts-ignore
  const currclock = useRef(null)
  
  // to handle the code that is being written from my side.
  // @ts-ignore
  const handlemytype = (value: string | undefined, event) => {
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

  // to Execute the code.
  async function handlerunbutton() {
    try {
      const token = localStorage.getItem('authorization')

      const livecode = editorref.current ? editorref.current.getValue() : content

      const response = await axios.post('http://localhost:3000/api/v1/run-code', {
        content: livecode,
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

  // this is for sending the text message from my side.
  // @ts-ignore
  const handletext = (e) => {
    if (e.key === 'Enter') {
      let text = null;
      if (textref.current != null) {
        text = textref.current.value
        textref.current.value = "";
      }

      let data = null
      if (text) {
        setmessages((prev) => {
          return [...prev, `You : ${text}`]
        })

        data = {
          type: 'chat',
          payload: {
            message: text,
            roomId: roomId,
            username: uname
          }
        }
      }

      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify(data))
      }
    }
  }

  const editorref = useRef<any>(null)
  const handleEditorDidMount = (editor : any)=>{
    editorref.current = editor;
  }

  return (
    <>
      <div className="font-sans bg-core-bg bg-[radial-gradient(circle,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:28px_28px] min-h-screen h-screen w-screen overflow-hidden relative flex flex-col items-center">
        {/* Ambient Depth Blobs */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_50%_40%_at_15%_10%,rgba(0,240,255,0.04)_0%,transparent_60%),radial-gradient(ellipse_40%_35%_at_85%_90%,rgba(124,58,237,0.04)_0%,transparent_60%),radial-gradient(ellipse_30%_30%_at_50%_50%,rgba(0,0,0,0.3)_0%,transparent_70%)]" />

        {/* ══ DYNAMIC ISLAND ════════════════════════════════════════════════ */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-0 bg-[#0a0a0e]/85 border border-white/10 rounded-full p-0 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.04)] animate-fadeUp whitespace-nowrap overflow-hidden">
          
          <div className="flex items-center gap-2 py-[9px] pl-[14px] pr-4 border-r border-white/5">
            <span className="w-[7px] h-[7px] rounded-full bg-core-green shadow-[0_0_6px_rgba(74,222,128,0.6)] animate-liveFlash shrink-0" />
            <span className="font-mono text-[10px] font-medium text-core-green/80 tracking-[0.12em]">LIVE</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 py-[9px] px-4 border-r border-white/5">
            <span className="font-mono text-[10px] text-white/20 tracking-[0.08em]">ROOM</span>
            <span className="font-mono text-[11px] text-core-cyan tracking-[0.06em] opacity-75">{roomId ?? 'SESSION_ID_HERE'}</span>
          </div>

          <div className="flex items-center gap-2 py-[9px] px-3.5 hidden md:flex">
            <div className="flex items-center -gap-1">
              {croomusers && croomusers.map((user, index) => {
                const colors = [
                  "bg-core-cyan/20 text-core-cyan",
                  "bg-[#7c3aed]/20 text-[#c084fc]",
                  "bg-core-green/20 text-core-green"
                ];
                const colorClass = colors[index % 3];

                return (
                  <div key={index} className={`w-5 h-5 rounded-full border border-black/60 flex items-center justify-center font-mono text-[8px] font-semibold -ml-[5px] first:ml-0 ${colorClass}`} title={user}>
                    {user ? user.charAt(0).toUpperCase() : '?'}
                  </div>
                );
              })}
            </div>
            <span className="font-mono text-[10px] text-white/20 tracking-[0.06em]">
              {croomusers && croomusers.length === 1 ? '1 Person' : `${croomusers?.length} people`}
            </span>
          </div>
        </div>

        {/* ══ MAIN STAGE ════════════════════════════════════════════════════ */}
        <div className="relative z-10 flex flex-col md:flex-row items-start gap-4 w-full max-w-[100vw] h-screen pt-[82px] pb-20 px-5 md:px-5 md:pb-20 overflow-y-auto md:overflow-hidden">

          {/* ── Editor Panel ── */}
          <div className="flex flex-col bg-black/45 border border-white/5 rounded-xl overflow-hidden backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.7),0_8px_24px_rgba(0,0,0,0.5)] h-[50vh] md:h-full flex-none md:flex-[55] animate-[fadeUp_0.6s_ease_both_0.05s] transition-colors hover:border-white/10 relative">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between py-2.5 px-3.5 border-b border-white/5 bg-black/25 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2.5 h-2.5 rounded-full opacity-75 bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full opacity-75 bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full opacity-75 bg-[#28c840]" />
                </div>
                <span className="font-mono text-[11px] text-white/45 tracking-[0.08em]">main.js</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9.5px] text-core-cyan/50 bg-core-cyan/5 border border-core-cyan/10 rounded px-2 py-0.5 tracking-[0.08em]">JavaScript</span>
                <span className="font-mono text-[9.5px] text-core-green/55 bg-core-green/5 border border-core-green/10 rounded px-2 py-0.5 tracking-[0.08em]">SYNCING</span>
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative min-h-0">
              <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-core-cyan/10 to-transparent pointer-events-none z-[2]" />
              <Editor
                height="100%"
                width="100%"
                theme="vs-dark"
                defaultLanguage="javascript"
                value={content}
                onChange={handlemytype}
                onMount={handleEditorDidMount}
                options={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  lineHeight: 22,
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                  minimap: { enabled: false },
                  renderLineHighlight: 'none',
                  overviewRulerBorder: false,
                  scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
                }}
              />
            </div>
          </div>

          {/* ── Output Panel ── */}
          <div className={`flex flex-col bg-black/45 border rounded-xl overflow-hidden backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.7),0_8px_24px_rgba(0,0,0,0.5)] h-[50vh] md:h-full flex-none md:flex-[45] animate-[fadeUp_0.6s_ease_both_0.12s] transition-colors relative ${cexecutedvalue ? 'border-core-green/10 animate-[outputBlink_3s_ease-in-out_infinite]' : 'border-white/5 hover:border-white/10'}`}>
             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between py-2.5 px-3.5 border-b border-white/5 bg-black/25 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2.5 h-2.5 rounded-full opacity-75 bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full opacity-75 bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full opacity-75 bg-[#28c840]" />
                </div>
                <span className="font-mono text-[11px] text-white/45 tracking-[0.08em]">OUTPUT_CONSOLE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9.5px] text-core-cyan/50 bg-core-cyan/5 border border-core-cyan/10 rounded px-2 py-0.5 tracking-[0.08em]">node v22</span>
                {cexecutedvalue && <span className="font-mono text-[9.5px] text-core-green/55 bg-core-green/5 border border-core-green/10 rounded px-2 py-0.5 tracking-[0.08em]">DONE</span>}
              </div>
            </div>

            <div className="flex-1 py-4 px-4 overflow-y-auto min-h-0 font-mono text-[12.5px] leading-[1.75] text-core-green/85 whitespace-pre-wrap break-all scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {cexecutedvalue ? (
                <>
                  <span className="text-core-cyan/35 text-[11px] mb-2 block tracking-[0.08em]">{'>'} process.stdout</span>
                  {cexecutedvalue}
                </>
              ) : (
                <span className="text-white/20 font-mono text-[11.5px] tracking-[0.04em] italic">
                  {'// Awaiting execution...\n// Press ⚡ EXECUTE to run your code.'}
                </span>
              )}
            </div>
          </div>

        </div>

        {/* ══ ACTION DOCK ═══════════════════════════════════════════════════ */}
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-[1px] bg-[#0a0a0e]/90 border border-white/10 rounded-full p-[5px] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.04)] animate-[fadeUp_0.5s_ease_both_0.2s]">
          <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-full font-mono text-[10px] tracking-[0.08em] text-white/20 transition-colors hover:text-white/45">
            <div className="w-[5px] h-[5px] rounded-full bg-core-green/50 shadow-[0_0_5px_rgba(74,222,128,0.4)] shrink-0" />
            WS CONNECTED
          </div>
          
          <div className="w-[1px] h-[22px] bg-white/5 mx-1 shrink-0" />
          
          <button className="flex items-center gap-2 py-2 px-5 rounded-full font-mono text-xs font-medium tracking-[0.1em] text-core-bg bg-gradient-to-br from-core-cyan/95 to-[#00c8f0]/90 border-none cursor-pointer relative overflow-hidden transition-all duration-150 shadow-[0_0_0_1px_rgba(0,240,255,0.3),0_4px_20px_rgba(0,240,255,0.25)] animate-[executeBreathe_3s_ease-in-out_infinite] hover:scale-105 hover:shadow-[0_0_0_1px_rgba(0,240,255,0.5),0_6px_28px_rgba(0,240,255,0.35)] hover:animate-none active:scale-95 active:shadow-[0_0_0_1px_rgba(0,240,255,0.4),0_2px_12px_rgba(0,240,255,0.2)]" onClick={handlerunbutton}>
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-full" />
            <span className="text-[13px] leading-none shrink-0">⚡</span> EXECUTE
          </button>
          
          <div className="w-[1px] h-[22px] bg-white/5 mx-1 shrink-0" />
          
          <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-full font-mono text-[10px] tracking-[0.08em] text-white/20 transition-colors hover:text-white/45">
            <span className="flex items-center gap-1 font-mono text-[9.5px] text-core-green/40 tracking-[0.06em]">
              <span className="w-1 h-1 rounded-full bg-core-green/50" />
              AUTOSAVE
            </span>
          </div>
        </div>

        {/* ══ FLOATING CHAT WIDGET ═══════════════════════════════════════════ */}
        {!isChatOpen ? (
          <button 
            className="fixed md:bottom-20 md:right-6 bottom-20 right-4 z-[200] flex items-center gap-2 py-3 px-5 rounded-full font-mono text-[11px] font-medium tracking-[0.08em] text-core-bg bg-gradient-to-br from-core-cyan/95 to-[#00c8f0]/90 border-none cursor-pointer transition-all duration-200 shadow-[0_0_0_1px_rgba(0,240,255,0.3),0_4px_20px_rgba(0,240,255,0.25)] animate-chatPulse hover:scale-105 hover:shadow-[0_0_0_1px_rgba(0,240,255,0.5),0_6px_28px_rgba(0,240,255,0.4)] hover:animate-none active:scale-95" 
            onClick={() => setIsChatOpen(true)}
          >
            <span className="text-base leading-none">💬</span>
            TEAM CHAT
            {/* UPDATED: Only show badge if unreadCount > 0 */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-[#ff5f57] text-white text-[10px] font-semibold flex items-center justify-center shadow-[0_2px_8px_rgba(255,95,87,0.5)]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        ) : (
          <div className="fixed md:bottom-20 md:right-6 bottom-20 right-4 w-[calc(100vw-32px)] md:w-[340px] max-h-[440px] z-[200] flex flex-col bg-[#0a0a0e]/95 border border-white/10 rounded-2xl backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.7),0_8px_24px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] animate-chatSlideIn overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center justify-between py-3.5 px-4 bg-black/40 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-core-cyan/20 to-core-cyan/5 border border-core-cyan/20 flex items-center justify-center text-sm">💬</div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs font-semibold text-white/90 tracking-[0.04em]">TEAM CHAT</span>
                  <span className="font-mono text-[10px] text-white/20 tracking-[0.06em]">
                    {croomusers ? `${croomusers.length} online` : 'Connecting...'}
                  </span>
                </div>
              </div>
              <button 
                className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 text-white/45 text-sm cursor-pointer flex items-center justify-center transition-all hover:bg-[#ff5f57]/15 hover:border-[#ff5f57]/30 hover:text-[#ff5f57]" 
                onClick={() => setIsChatOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 min-h-[200px] max-h-[280px] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-white/20">
                  <span className="text-2xl opacity-50">🗨️</span>
                  <span className="font-mono text-[11px] tracking-[0.04em] italic">{"// No messages yet..."}</span>
                </div>
              ) : (
                <>
                  {messages.map((m, index) => {
                    const isMe = m.startsWith('You :');
                    return (
                      <div 
                        key={index} 
                        className={`max-w-[85%] py-2.5 px-3.5 rounded-xl font-mono text-xs leading-relaxed break-words ${isMe ? 'self-end bg-gradient-to-br from-core-cyan/15 to-core-cyan/5 border border-core-cyan/25 text-core-cyan/95 rounded-br-sm' : 'self-start bg-white/5 border border-white/10 text-white/90 rounded-bl-sm'}`}
                      >
                        {m}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Input */}
            <div className="py-3 px-3.5 bg-black/50 border-t border-white/5">
              <input
                ref={textref}
                onKeyDown={handletext}
                className="w-full bg-white/5 border border-white/10 rounded-[10px] py-2.5 px-3.5 font-mono text-xs text-white/90 outline-none transition-all focus:border-core-cyan/40 focus:bg-core-cyan/5 focus:shadow-[0_0_0_3px_rgba(0,240,255,0.08)] placeholder:text-white/20"
                type="text"
                placeholder="Type a message & press Enter..."
              />
            </div>
          </div>
        )}

      </div>
    </>
  )
}

export default Codeeditor
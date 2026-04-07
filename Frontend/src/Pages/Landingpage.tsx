import axios from "axios"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from 'react-toastify'


function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setRevealed(entry.isIntersecting),
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, revealed }
}

const FEATURES = [
  {
    title: "Real-Time IDE",
    description: "Seamless collaborative editing with real-time state syncing. See your team's changes appear live on your screen as they type.",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
    badge: null,
  },
  {
    title: "Live Chat",
    description: "Instant messaging built right into the development workspace. Communicate without context switching.",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    badge: null,
  },
  {
    title: "Voice & Video",
    description: "High-fidelity WebRTC communication for seamless pair programming and team collaboration.",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
    badge: "COMING SOON",
  },
]

const Landingpage = () => {

  const isLoggedIn = !!localStorage.getItem('authorization');
  const [isSignup, setisSignup] = useState<boolean>(true)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200)
    return () => clearTimeout(timer)
  }, [])

  const navigate = useNavigate()
  const pageTopRef = useRef<HTMLDivElement>(null)

  const featuresReveal = useScrollReveal(0.08)
  const creatorReveal = useScrollReveal(0.08)
  const footerReveal = useScrollReveal(0)

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })


  // @ts-ignore
  async function handlesignup(e) {
    e.preventDefault()
    const formdata = new FormData(e.currentTarget)
    const content = Object.fromEntries(formdata)
    try {
      const response = await axios.post('http://localhost:3000/api/v1/signup', content)
      toast.dismiss()
      toast.success(response.data.message)
      setisSignup(false)
    } catch (e) {
      // @ts-ignore
      const errors = e.response?.data?.message

      toast.dismiss()
      if (typeof errors === 'object' && errors !== null && !Array.isArray(errors)) {
        // this error is specifically because of zod validation of the input
        Object.entries(errors).forEach(([fieldName, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            const beautifulfieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
            toast.error(`${beautifulfieldName} : ${messages[0]}`)
          }
        })
      }
      else if (typeof errors === 'string') {
        toast.error(errors);
      }
      else {
        toast.error("Something Went wrong!")
      }
    }
  }

  // @ts-ignore
  async function handlesignin(e) {
    e.preventDefault()
    const formdata = new FormData(e.currentTarget)
    const content = Object.fromEntries(formdata)
    try {
      const response = await axios.post('http://localhost:3000/api/v1/signin', content)
      localStorage.setItem('authorization', response.data.token)
      localStorage.setItem('username', response.data.username)
      toast.success(response.data.message)
      navigate('/Dashboard')
    } catch (e) {
      toast.dismiss()
      // @ts-ignore
      if (e.response?.status === 401 || e.response?.status === 403) {
        localStorage.removeItem('authorization');
        localStorage.removeItem('username');
        toast.error("Session expired. Please log in again.");
        navigate('/'); // Kick them back to the landing page
      }
      else{
        // @ts-ignore
        toast.error(e.response?.data?.message || "Something went wrong!")
      }
    }
  }

  return (
    <>
      {/* Toastify overrides — Required for external portal styling */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Geist:wght@300;400;500;600;700&display=swap');
        html { scroll-behavior: smooth; }
        body { background-color: #09090b }
        .Toastify__toast-container { font-family: 'JetBrains Mono', monospace !important; font-size: 11.5px !important; letter-spacing: 0.04em !important; }
        .Toastify__toast { background: #09090b !important; border: 1px solid rgba(0,240,255,0.25) !important; border-radius: 4px !important; color: rgba(255,255,255,0.8) !important; box-shadow: none !important; padding: 10px 14px !important; min-height: 0 !important; }
        .Toastify__toast--success { border-color: rgba(74,222,128,0.35) !important; }
        .Toastify__toast--success .Toastify__toast-icon svg { fill: #4ade80 !important; }
        .Toastify__toast--error   { border-color: rgba(255,80,80,0.35)  !important; }
        .Toastify__toast--error .Toastify__toast-icon svg   { fill: #ff5f5f !important; }
        .Toastify__toast-body { padding: 0 !important; margin: 0 !important; gap: 8px !important; }
        .Toastify__progress-bar--success { background: #4ade80 !important; height: 1px !important; }
        .Toastify__progress-bar--error   { background: #ff5f5f !important; height: 1px !important; }

      `}</style>

      {/* Splash Screen */}
      {showSplash && (
        <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center animate-splash">
          <div className="font-mono text-4xl text-white font-bold tracking-wide flex items-center gap-1">
            <span className="text-core-cyan">{'>'}_</span> Corewire
            <span className="inline-block w-[14px] h-[32px] bg-core-cyan ml-2 rounded-sm animate-blink" />
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[54px] flex items-center justify-between px-5 md:px-9 border-b border-core-border bg-core-bg/85 backdrop-blur-md">
        <button className="flex items-center font-mono text-sm font-semibold tracking-wide text-white/90 cursor-pointer bg-none border-none p-0 transition-opacity hover:opacity-65" onClick={scrollToTop}>
          <span className="text-core-cyan">{'>'}_&nbsp;</span>
          Corewire
          <span className="inline-block w-[8px] h-[15px] bg-core-cyan ml-[3px] rounded-sm align-middle shadow-[0_0_8px_rgba(0,240,255,0.5)] animate-cursorPulse" />
        </button>
        <div className="hidden md:flex items-center gap-7">
          <button className="font-mono text-[10.5px] text-white/30 tracking-widest cursor-pointer transition-colors hover:text-core-cyan" onClick={scrollToTop}>HOME</button>
          <a className="font-mono text-[10.5px] text-white/30 tracking-widest cursor-pointer transition-colors hover:text-core-cyan" href="#features">FEATURES</a>
          <a className="font-mono text-[10.5px] text-white/30 tracking-widest cursor-pointer transition-colors hover:text-core-cyan" href="#creator">ABOUT</a>
          <a className="font-mono text-[10.5px] text-white/30 tracking-widest cursor-pointer transition-colors hover:text-core-cyan" href="https://github.com/Chetanwadhwa03/Collaborative-Code-Editor-" target="_blank" rel="noreferrer">GITHUB</a>
        </div>
      </nav>

      <div className="font-sans bg-core-bg min-h-screen flex flex-col pt-[54px]" ref={pageTopRef}>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-54px)]">
          {/* Left Hero */}
          <div className="w-full md:w-1/2 flex flex-col justify-center items-center py-12 px-6 md:py-12 md:px-14 relative border-b md:border-b-0 md:border-r border-core-border overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px] animate-gridShimmer pointer-events-none" />
            <div className="absolute rounded-full pointer-events-none w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,240,255,0.09)_0%,transparent_65%)] top-[40%] left-[40%] -translate-x-[55%] -translate-y-[55%]" />
            <div className="absolute rounded-full pointer-events-none w-[320px] h-[320px] bg-[radial-gradient(circle,rgba(168,85,247,0.07)_0%,transparent_70%)] bottom-[5%] right-[5%]" />
            <div className="absolute rounded-full pointer-events-none w-[220px] h-[220px] bg-[radial-gradient(circle,rgba(0,240,255,0.06)_0%,transparent_70%)] top-[10%] right-[15%]" />
            <div className="absolute w-[22px] h-[22px] top-[22px] left-[22px] border-t border-l border-core-cyan animate-cornerPulse" />
            <div className="absolute w-[22px] h-[22px] bottom-[22px] right-[22px] border-b border-r border-core-purple animate-cornerPulseDelay" />

            <div className="relative z-10 w-full max-w-[400px] animate-fadeUp">
              <div className="inline-flex items-center gap-2 bg-core-cyan/5 border border-core-cyan/15 rounded-full py-[5px] pr-[14px] pl-[10px] mb-8">
                <span className="w-[6px] h-[6px] rounded-full bg-core-cyan animate-liveFlash shadow-[0_0_6px_var(--cyan)]" />
                <span className="font-mono text-[11px] text-core-cyan/70 tracking-widest">BETA · 6 peers online</span>
              </div>
              <h1 className="text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.1] tracking-tight mb-4 text-transparent bg-clip-text bg-[linear-gradient(135deg,#fff_0%,#c0e8ff_40%,#00f0ff_70%,#a855f7_100%)]">
                Code Together.<br />Execute Anywhere.
              </h1>
              <p className="text-[14px] text-white/30 leading-relaxed mb-10 font-light tracking-wide">
                A zero-latency collaborative IDE built for engineering teams who ship at the speed of thought.
              </p>

              {/* Auth Card */}
              <div className="bg-white/[0.025] border border-core-border rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-core-cyan/30 to-transparent" />

                {isLoggedIn ? (
                  // if the person is already logged in , means token is present in localstorage.
                  <div className="flex flex-col items-center text-center gap-4 py-4 animate-formFadeIn">
                    <div className="w-12 h-12 rounded-full bg-core-cyan/10 border border-core-cyan/30 flex items-center justify-center text-core-cyan mb-2 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <div>
                      <h3 className="font-mono text-[14px] text-white/90 mb-1">Welcome back, <span className="text-core-cyan">{localStorage.getItem('username') || 'Developer'}</span></h3>
                      <p className="font-sans text-[13px] text-white/40">Your secure workspace is ready.</p>
                    </div>

                    <button onClick={() => navigate('/Dashboard')} className="w-full mt-2 p-3 rounded-lg border border-core-cyan/30 bg-gradient-to-br from-core-cyan/10 to-core-purple/10 text-core-cyan font-mono text-xs font-medium tracking-wider cursor-pointer relative overflow-hidden transition-all hover:shadow-[0_0_24px_rgba(0,240,255,0.18)] hover:border-core-cyan/50 active:scale-[0.985] group">
                      <div className="absolute inset-0 bg-gradient-to-br from-core-cyan/15 to-core-purple/15 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
                      <span className="relative z-10">→ ENTER WORKSPACE</span>
                    </button>

                    <button 
                      onClick={() => { 
                        localStorage.removeItem('authorization'); 
                        localStorage.removeItem('username'); 
                        window.location.reload(); 
                      }} 
                      className="text-[10px] text-white/20 hover:text-white/60 underline mt-3 font-mono cursor-pointer transition-colors"
                    >
                      _disconnect_session
                    </button>
                  </div>
                ) : (
                  // if the person is logged out
                  <>
                    <div className="flex bg-black/40 border border-core-border rounded-full p-[3px] mb-6 relative">
                      <div className="absolute top-[3px] bottom-[3px] left-[3px] w-[calc(50%-3px)] bg-gradient-to-br from-core-cyan/10 to-core-purple/10 border border-core-cyan/25 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.34,1.3,0.64,1)] shadow-[0_0_16px_rgba(0,240,255,0.08)]" style={{ transform: isSignup ? "translateX(0)" : "translateX(100%)" }} />
                      <button type="button" className="flex-1 text-center py-2 font-mono text-[11.5px] tracking-[0.06em] cursor-pointer relative z-10 transition-colors" style={{ color: isSignup ? "rgba(0,240,255,0.9)" : "rgba(255,255,255,0.28)" }} onClick={() => setisSignup(true)}>_sign_up</button>
                      <button type="button" className="flex-1 text-center py-2 font-mono text-[11.5px] tracking-[0.06em] cursor-pointer relative z-10 transition-colors" style={{ color: !isSignup ? "rgba(0,240,255,0.9)" : "rgba(255,255,255,0.28)" }} onClick={() => setisSignup(false)}>_sign_in</button>
                    </div>

                    <div className="relative">
                      <div className={`flex flex-col gap-3 transition-all duration-300 ${isSignup ? "opacity-100 translate-y-0 animate-formFadeIn" : "opacity-0 translate-y-[6px] pointer-events-none absolute inset-0"}`}>
                        <form className="flex flex-col gap-3" onSubmit={handlesignup}>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[10.5px] text-white/20 tracking-widest">username</label>
                            <input name="username" className="bg-black/55 border border-white/5 rounded-lg px-3.5 py-2.5 text-white/85 font-mono text-[13px] outline-none transition-all focus:border-core-cyan/40 focus:shadow-[0_0_0_3px_rgba(0,240,255,0.07),inset_0_0_12px_rgba(0,240,255,0.02)] w-full placeholder:text-white/20" type="text" placeholder="your_handle" tabIndex={isSignup ? 0 : -1} />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[10.5px] text-white/20 tracking-widest">email</label>
                            <input name="email" className="bg-black/55 border border-white/5 rounded-lg px-3.5 py-2.5 text-white/85 font-mono text-[13px] outline-none transition-all focus:border-core-cyan/40 focus:shadow-[0_0_0_3px_rgba(0,240,255,0.07),inset_0_0_12px_rgba(0,240,255,0.02)] w-full placeholder:text-white/20" type="text" placeholder="you@company.io" tabIndex={isSignup ? 0 : -1} />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[10.5px] text-white/20 tracking-widest">password</label>
                            <input name="password" className="bg-black/55 border border-white/5 rounded-lg px-3.5 py-2.5 text-white/85 font-mono text-[13px] outline-none transition-all focus:border-core-cyan/40 focus:shadow-[0_0_0_3px_rgba(0,240,255,0.07),inset_0_0_12px_rgba(0,240,255,0.02)] w-full placeholder:text-white/20" type="password" placeholder="••••••••••••" tabIndex={isSignup ? 0 : -1} />
                          </div>
                          <button type="submit" className="mt-1 p-3 w-full rounded-lg border border-core-cyan/30 bg-gradient-to-br from-core-cyan/10 to-core-purple/10 text-core-cyan font-mono text-xs font-medium tracking-wider cursor-pointer relative overflow-hidden transition-all hover:shadow-[0_0_24px_rgba(0,240,255,0.18)] hover:border-core-cyan/50 active:scale-[0.985] group" tabIndex={isSignup ? 0 : -1}>
                            <div className="absolute inset-0 bg-gradient-to-br from-core-cyan/15 to-core-purple/15 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
                            <span className="relative z-10">→ INITIALIZE ACCOUNT</span>
                          </button>
                        </form>
                      </div>

                      <div className={`flex flex-col gap-3 transition-all duration-300 ${!isSignup ? "opacity-100 translate-y-0 animate-formFadeIn" : "opacity-0 translate-y-[6px] pointer-events-none absolute inset-0"}`}>
                        <form className="flex flex-col gap-3" onSubmit={handlesignin}>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[10.5px] text-white/20 tracking-widest">email</label>
                            <input name="email" className="bg-black/55 border border-white/5 rounded-lg px-3.5 py-2.5 text-white/85 font-mono text-[13px] outline-none transition-all focus:border-core-cyan/40 focus:shadow-[0_0_0_3px_rgba(0,240,255,0.07),inset_0_0_12px_rgba(0,240,255,0.02)] w-full placeholder:text-white/20" type="text" placeholder="you@company.io" tabIndex={!isSignup ? 0 : -1} />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[10.5px] text-white/20 tracking-widest">password</label>
                            <input name="password" className="bg-black/55 border border-white/5 rounded-lg px-3.5 py-2.5 text-white/85 font-mono text-[13px] outline-none transition-all focus:border-core-cyan/40 focus:shadow-[0_0_0_3px_rgba(0,240,255,0.07),inset_0_0_12px_rgba(0,240,255,0.02)] w-full placeholder:text-white/20" type="password" placeholder="••••••••••••" tabIndex={!isSignup ? 0 : -1} />
                          </div>
                          <button type="submit" className="mt-1 p-3 w-full rounded-lg border border-core-cyan/30 bg-gradient-to-br from-core-cyan/10 to-core-purple/10 text-core-cyan font-mono text-xs font-medium tracking-wider cursor-pointer relative overflow-hidden transition-all hover:shadow-[0_0_24px_rgba(0,240,255,0.18)] hover:border-core-cyan/50 active:scale-[0.985] group" tabIndex={!isSignup ? 0 : -1}>
                            <div className="absolute inset-0 bg-gradient-to-br from-core-cyan/15 to-core-purple/15 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
                            <span className="relative z-10">→ AUTHENTICATE</span>
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="text-center mt-5 font-mono text-[11px] text-white/20">
                      {isSignup ? "// already deployed?" : "// new to codelink?"}{" "}
                      <button type="button" className="text-core-cyan/50 hover:text-core-cyan underline underline-offset-4 transition-colors" onClick={() => setisSignup(!isSignup)}>
                        {isSignup ? "sign_in()" : "sign_up()"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — IDE demo */}
          <div className="w-full md:w-1/2 flex flex-col justify-center items-center py-10 px-6 md:px-12 relative overflow-hidden bg-core-panel">
            <div className="absolute left-0 right-0 h-[120px] bg-gradient-to-b from-transparent via-core-cyan/5 to-transparent animate-scanDown pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_70%_40%,rgba(168,85,247,0.05)_0%,transparent_70%)] pointer-events-none" />

            {/* ── TOP DECORATION: Routing Line ── */}
            <div className="flex items-center gap-4 mb-6 w-full max-w-[640px] opacity-70 relative z-10 animate-fadeUp">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-core-cyan/30" />
              <span className="font-mono text-[9px] text-core-cyan tracking-[0.25em]">LIVE_WORKSPACE_PREVIEW</span>
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-core-cyan/30" />
            </div>

            {/* ── FLOATING VIDEO PLAYER ── */}
            <div className="relative z-10 w-full max-w-[640px] rounded-xl overflow-hidden border border-white/10 shadow-[0_0_0_1px_rgba(0,240,255,0.15),0_30px_80px_rgba(0,0,0,0.8),0_0_60px_rgba(0,240,255,0.08)] animate-[fadeUp_0.8s_0.15s_ease_both,float_6s_ease-in-out_infinite_0.8s] group">

              <div className="absolute inset-0 bg-gradient-to-br from-core-cyan/20 to-core-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay pointer-events-none z-20" />

              <div className="flex items-center px-4 py-3 bg-black/90 border-b border-white/10 absolute top-0 left-0 right-0 z-30 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.3)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.3)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.3)]" />
                </div>
                <div className="mx-auto font-mono text-[10px] text-white/30 tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-liveFlashFast" />
                  wss://relay.corewire.io
                </div>
              </div>

              <div className="pt-[36px] bg-[#09090b] transform perspective-[2000px] rotate-y-[-12deg] rotate-x-[8deg] shadow-[-20px_20px_40px_rgba(0,0,0,0.5)] transition-all duration-700 hover:rotate-y-0 hover:rotate-x-0">
                <video
                  src="/demo.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-500 scale-[1.01]"
                />
              </div>
            </div>

            {/* ── BOTTOM DECORATION: Activity Stream & Peers ── */}
            <div className="w-full max-w-[640px] mt-6 relative z-10 animate-[fadeUp_0.8s_0.3s_ease_both]">

              {/* Fake Activity Terminal */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 backdrop-blur-sm mb-4">
                <div className="font-mono text-[9px] text-white/30 mb-3 tracking-[0.2em] border-b border-white/5 pb-2">NETWORK_ACTIVITY_LOG</div>
                <div className="flex flex-col gap-2.5 font-mono text-[10.5px]">
                  <div className="flex items-center gap-3 text-white/40">
                    <span className="text-[#4ade80]">✓</span>
                    <span>[sync] Delta applied from @peer_7</span>
                    <span className="ml-auto text-white/20">just now</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/40">
                    <span className="text-[#4ade80]">✓</span>
                    <span>[exec] Code compiled successfully</span>
                    <span className="ml-auto text-white/20">2s ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-core-cyan/70">
                    <span className="animate-pulse">⟳</span>
                    <span>[ws] Awaiting incoming events...</span>
                  </div>
                </div>
              </div>

              {/* Collaborators Row */}
              <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
                <span className="font-mono text-[10px] text-white/30 tracking-widest uppercase">Active Node Topology:</span>
                <div className="flex gap-2 items-center">
                  {["AK", "SR", "JL", "DM"].map(p => (
                    <div key={p} className="w-6 h-6 rounded-full border border-core-cyan/20 flex items-center justify-center font-mono text-[9px] text-core-cyan/70 bg-core-cyan/5 shadow-[0_0_8px_rgba(0,240,255,0.1)]">{p}</div>
                  ))}
                  <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center font-mono text-[9px] text-white/40 bg-white/5">+2</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" ref={featuresReveal.ref} className={`bg-core-bg border-t border-core-border py-24 px-5 md:px-12 relative overflow-hidden transition-opacity duration-500 ${featuresReveal.revealed ? 'opacity-100 animate-revealZoom' : 'opacity-0'}`}>
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_30%_20%,rgba(0,240,255,0.03)_0%,transparent_60%),radial-gradient(ellipse_50%_40%_at_70%_80%,rgba(168,85,247,0.03)_0%,transparent_60%)]" />

          <div className="text-center mb-16 relative z-10">
            <div className="font-mono text-[11px] tracking-[0.2em] text-core-cyan mb-4 drop-shadow-[0_0_20px_rgba(0,240,255,0.5)]">{'>'} CORE CAPABILITIES</div>
            <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-tight text-white/90 mb-4">Built for Real-Time Collaboration</h2>
            <p className="text-[15px] text-white/35 max-w-[500px] mx-auto leading-relaxed">Everything you need to code, communicate, and ship together — without leaving your IDE.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto relative z-10">
            {FEATURES.map((feature, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 relative overflow-hidden backdrop-blur-xl transition-all duration-300 hover:border-core-cyan/25 hover:shadow-[0_0_40px_rgba(0,240,255,0.08),inset_0_0_60px_rgba(0,240,255,0.02)] hover:-translate-y-1 group">
                <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-transparent to-transparent transition-colors duration-300 group-hover:from-core-cyan/40 group-hover:to-core-purple/30 pointer-events-none" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
                {feature.badge && <span className="absolute top-5 right-5 font-mono text-[9px] tracking-widest text-core-cyan bg-core-cyan/10 border border-core-cyan/30 rounded px-2.5 py-1 animate-badgeGlow">{feature.badge}</span>}
                <div className="w-14 h-14 rounded-xl bg-core-cyan/5 border border-core-cyan/15 flex items-center justify-center text-core-cyan mb-5">{feature.icon}</div>
                <h3 className="font-mono text-base font-semibold text-white/90 mb-3 tracking-wide">{feature.title}</h3>
                <p className="text-[13px] text-white/40 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Creator Section */}
        <section id="creator" ref={creatorReveal.ref} className={`bg-core-bg border-t border-core-border py-24 px-5 md:px-12 relative overflow-hidden transition-opacity duration-500 ${creatorReveal.revealed ? 'opacity-100 animate-revealZoom' : 'opacity-0'}`}>
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(0,240,255,0.05)_0%,transparent_65%),radial-gradient(ellipse_40%_45%_at_75%_30%,rgba(168,85,247,0.04)_0%,transparent_60%),radial-gradient(ellipse_35%_40%_at_25%_70%,rgba(0,240,255,0.03)_0%,transparent_60%)]" />

          <div className="text-center mb-16 relative z-10">
            <div className="font-mono text-[13px] tracking-[0.25em] text-core-cyan mb-4 drop-shadow-[0_0_30px_rgba(0,240,255,0.6),0_0_60px_rgba(0,240,255,0.3)] animate-glowPulse">{'>'} MEET THE CREATOR</div>
          </div>

          <div className="max-w-[1100px] mx-auto relative z-10">
            <div className="flex flex-col lg:grid lg:grid-cols-[320px_1fr] gap-10 lg:gap-16 bg-black/50 border border-white/10 rounded-[24px] p-8 md:p-12 backdrop-blur-xl shadow-[0_0_0_1px_rgba(0,240,255,0.05),0_60px_120px_rgba(0,0,0,0.6),0_0_100px_rgba(0,240,255,0.04),inset_0_1px_0_rgba(255,255,255,0.05)]">

              <div className="flex flex-col md:flex-row lg:flex-col items-center justify-center gap-6 md:gap-8 lg:gap-6">
                <div className="w-[140px] h-[140px] md:w-[160px] md:h-[160px] lg:w-[220px] lg:h-[220px] rounded-3xl p-1 bg-gradient-to-br from-core-cyan/60 via-core-purple/50 to-core-cyan/60 shadow-[0_0_40px_rgba(0,240,255,0.25),0_0_80px_rgba(0,240,255,0.1),0_0_120px_rgba(168,85,247,0.1)] animate-glowPulse">
                  <div className="w-full h-full rounded-[20px] overflow-hidden bg-core-cyan/5 border-[3px] border-core-bg flex items-center justify-center">
                    <img src="/chetan-reading.png" alt="Chetan Wadhwa" className="w-full h-full object-cover grayscale-[10%] transition-all duration-400 hover:grayscale-0 hover:scale-105" onError={(e) => { e.currentTarget.style.display = 'none'; const fb = e.currentTarget.parentElement?.querySelector('.fallback-img') as HTMLElement | null; if (fb) fb.style.display = 'flex' }} />
                    <div className="fallback-img hidden w-full h-full items-center justify-center flex-col gap-1.5 font-mono text-xs text-core-cyan/30 text-center leading-relaxed">
                      <span>// avatar</span><span>// not found</span>
                    </div>
                  </div>
                </div>
                <div className="font-mono text-[13px] text-core-cyan/60 tracking-widest">@chetanwadhwa</div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="font-mono text-2xl font-bold text-white/95 mb-2 tracking-wide"><span className="text-core-cyan">chetanw</span>@<span className="text-core-cyan">corewire</span></div>
                <div className="font-mono text-xs text-white/10 mb-7 tracking-wide">────────────────────────────────────────</div>

                <div className="flex flex-col gap-3.5 mb-7">
                  <div className="flex items-baseline"><span className="font-mono text-[13px] text-core-cyan tracking-widest min-w-[100px] opacity-70">Name</span><span className="font-mono text-[13px] text-white/15 mx-4">:</span><span className="font-mono text-[14px] text-white/70 leading-relaxed">Chetan Wadhwa</span></div>
                  <div className="flex items-baseline"><span className="font-mono text-[13px] text-core-cyan tracking-widest min-w-[100px] opacity-70">Role</span><span className="font-mono text-[13px] text-white/15 mx-4">:</span><span className="font-mono text-[14px] text-white/70 leading-relaxed">Full Stack Web Developer</span></div>
                  <div className="flex items-baseline"><span className="font-mono text-[13px] text-core-cyan tracking-widest min-w-[100px] opacity-70">Stack</span><span className="font-mono text-[13px] text-white/15 mx-4">:</span><span className="font-mono text-[14px] text-white/70 leading-relaxed">TypeScript · Node.js · React · Express · Websockets</span></div>
                  <div className="flex items-baseline"><span className="font-mono text-[13px] text-core-cyan tracking-widest min-w-[100px] opacity-70">Status</span><span className="font-mono text-[13px] text-white/15 mx-4">:</span><span className="font-mono text-[14px] text-[#4ade80]/80 leading-relaxed">Open to collaborate</span></div>
                </div>

                <div className="h-[1px] bg-gradient-to-r from-core-cyan/20 via-core-purple/10 to-transparent my-6" />

                <p className="font-sans text-[15px] italic font-light text-white/45 leading-[1.8] border-l-[3px] border-core-cyan/25 pl-5 mb-8">
                  &ldquo;Specializing in TypeScript and real-time architecture. I like turning hard backend problems into fast, instantly responsive web apps.&rdquo;
                </p>

                <div className="flex gap-4 flex-wrap">
                  <a className="font-mono text-xs text-white/40 tracking-wide border border-white/10 rounded-lg px-6 py-3 no-underline flex items-center gap-2.5 transition-all duration-250 cursor-pointer bg-black/30 hover:text-core-cyan hover:border-core-cyan/40 hover:bg-core-cyan/10 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] hover:-translate-y-0.5" href="https://github.com/Chetanwadhwa03" target="_blank" rel="noreferrer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" /></svg>
                    [ GITHUB ]
                  </a>
                  <a className="font-mono text-xs text-white/40 tracking-wide border border-white/10 rounded-lg px-6 py-3 no-underline flex items-center gap-2.5 transition-all duration-250 cursor-pointer bg-black/30 hover:text-core-cyan hover:border-core-cyan/40 hover:bg-core-cyan/10 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] hover:-translate-y-0.5" href="https://www.linkedin.com/in/chetan-wadhwa-9174051a3/" target="_blank" rel="noreferrer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    [ LINKEDIN ]
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer ref={footerReveal.ref} className={`border-t border-core-border py-5 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-3.5 md:gap-0 bg-black/20 transition-opacity duration-500 ${footerReveal.revealed ? 'opacity-100 animate-revealZoom' : 'opacity-0'}`}>
          <span className="font-mono text-[10.5px] text-white/15 tracking-wide text-center md:text-left">© 2026 Corewire. All systems operational.</span>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="font-mono text-[10px] text-[#4ade80]/50 tracking-widest flex items-center gap-1.5">
              <span className="w-[5px] h-[5px] rounded-full bg-[#4ade80] shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
              [ STATUS: ONLINE ]
            </div>
            <a className="font-mono text-[10px] text-white/20 tracking-widest cursor-pointer transition-colors hover:text-core-cyan" href="https://github.com/Chetanwadhwa03/Collaborative-Code-Editor-" target="_blank" rel="noreferrer">[ REPO ]</a>
            <a className="font-mono text-[10px] text-white/20 tracking-widest cursor-pointer transition-colors hover:text-core-cyan" href="chetanwadhwa03@gmail.com">[ CONTACT ]</a>
          </div>
        </footer>

      </div>
    </>
  )
}

export default Landingpage
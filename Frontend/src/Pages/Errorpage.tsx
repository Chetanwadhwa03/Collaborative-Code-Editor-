import { Link } from 'react-router-dom';

const Errorpage = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 font-mono">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Terminal/Glitch Style Status Code */}
        <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 animate-pulse">
          ERR
        </h1>

        <div className="bg-[#1e293b] p-8 rounded-xl shadow-2xl border border-gray-700/50 relative overflow-hidden">
          {/* Decorative top bar to mimic a code editor window */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>

          <h2 className="text-2xl font-bold text-gray-100 mb-3">
            System_Failure
          </h2>

          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            <span className="text-red-400">Uncaught Exception:</span> Something went completely wrong. The compiler is confused, the WebSockets are tangled, and the connection was lost.
          </p>

          <Link 
            to="/" 
            className="inline-block w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
          >
            {">"} restart_session()
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Errorpage;
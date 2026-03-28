# ⚡ CoreWire: Real-Time Collaborative Code Engine

> **Status:** Phase 1 (MVP) Completed 🚀 | Built in 7 Days

A high-performance, real-time collaborative code execution environment built for developers. This platform allows multiple users to seamlessly join isolated workspaces and write code together with zero-latency synchronization, mimicking industry-standard tools like VS Code Live Share.

## 🎯 The Vision (Phase 1 MVP)
The goal of Phase 1 was to build a rock-solid, scalable core engine. Rather than focusing solely on UI, the primary focus was establishing a bulletproof WebSocket architecture, secure JWT authentication, and a robust MongoDB schema capable of handling concurrent data without race conditions.

## 🛠️ Tech Stack
* **Frontend:** React.js, Tailwind CSS, React Router DOM
* **Core Editor:** `@monaco-editor/react` (Microsoft's VS Code engine)
* **Backend:** Node.js, Express.js
* **Real-Time Engine:** Native WebSockets (`ws`)
* **Database & ORM:** MongoDB, Mongoose
* **Security & Auth:** JSON Web Tokens (JWT), bcrypt (Password Hashing), Zod (Input Validation)
* **ID Generation:** `nanoid` (Collision-resistant room IDs)

## 💡 Engineering Highlights (What makes this special)

Recruiters & Reviewers, here are the core engineering challenges solved in this build:

1. **Defeating "Stale Closures" in React:** Architected a custom WebSocket listener inside `useEffect` combined with Monaco Editor's `onChange` event to prevent React state asynchrony from causing infinite re-render loops during rapid keystrokes.
   
2. **Preventing Database Race Conditions:** Implemented **MongoDB Compound Unique Indexes** (`roomname` + `ownerId`) to ensure data integrity. This acts as an impenetrable backend shield against concurrent API spamming, gracefully catching `E11000` Duplicate Key Errors.

3. **Optimized Payload Delivery:**
   Designed the WebSocket payload structure to handle full-string document syncs efficiently for MVP, paving the way for future CRDT/OT algorithm integration.

4. **Secure "Live Hologram" Auth Flow:**
   Built a seamless, single-page authentication flow bridging the gap between secure JWT local storage management and immediate programmatic navigation (via `useNavigate`), completely avoiding the dreaded "flickering" state.

## 🚀 Key Features
* **Custom Auth System:** Fully custom Signup/Signin flow with Zod validation and bcrypt hashing.
* **Workspace Generation:** Users can dynamically spawn isolated coding rooms with 5-character NanoIDs.
* **Real-Time Code Sync:** Multi-client broadcasting via WebSockets.
* **Smart UI States:** Handled loading states, disabled buttons during network requests, and precise Axios error-catching (drilling down to `e.response?.data?.message`).

## ⚙️ Local Installation

**1. Clone the repository**

```bash
git clone (https://github.com/Chetanwadhwa03/Collaborative-Code-Editor.git)
cd Collaborative-Code-Editor
cd backend
npm install
# Create a .env file and add your MongoDB URI and JWT_SECRET_KEY
node server.js
#Setup Frontend
cd frontend
npm install
npm run dev

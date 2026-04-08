# ⚡ CoreWire: The Multiplayer Code Workspace

[![Live Demo](https://img.shields.io/badge/Live%20Demo-corewire.vercel.app-00e5ff?style=for-the-badge&logo=vercel)](https://corewire.vercel.app/)
[![Backend Status](https://img.shields.io/badge/Backend-Deployed_on_Railway-4B4B4B?style=for-the-badge&logo=railway)](https://collaborative-code-editor-production-e29e.up.railway.app)

**CoreWire** is a high-performance, real-time collaborative code execution environment. It allows multiple developers to join isolated workspaces, write code together with zero-latency synchronization, chat in real-time, and execute code directly in the browser. 

Think of it as a lightweight, browser-based fusion of VS Code Live Share and an interactive terminal.

### 🎥 See it in Action
https://github.com/user-attachments/assets/e580c223-0029-454d-9f66-2da2353d68a9

---

## 🚀 Key Features

* **Real-Time Bi-Directional Sync:** Powered by native WebSockets for sub-millisecond code synchronization across multiple clients.
* **Live Code Execution:** Integrated with the JDoodle Compiler API to execute Node.js code securely in the cloud and return terminal output instantly.
* **Persistent Workspaces (Auto-Save):** These aren't just ephemeral rooms. Your code is automatically saved to the database 5 seconds after you stop typing, keeping your work safe even if you leave.
* **The "Ping-Pong" Mute Protocol:** Custom React `useRef` architecture built to intercept Monaco Editor's internal state updates, preventing infinite WebSocket broadcast loops.
* **Secure Authentication:** Custom JWT-based authentication flow with `bcrypt` password hashing and strict `zod` input validation.
* **In-App Team Chat:** A floating, real-time chat widget for seamless communication without leaving the editor context.





---

## 🛠️ The Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS (Custom Dark/Neon UI)
* `@monaco-editor/react` (Microsoft's VS Code engine)
* React Router DOM & React Toastify

**Backend:**
* Node.js & Express.js
* Native WebSockets (`ws`)
* MongoDB Atlas & Mongoose
* Axios (for 3rd-party compiler API calls)

**Deployment & DevOps:**
* **Frontend:** Vercel (Configured with SPA routing rules)
* **Backend:** Railway (Configured for dynamic port binding & WebSocket secure upgrades)

---

## 🧠 Engineering Highlights (For Reviewers)

During development, several complex architectural challenges were solved to ensure security and synchronization:

1.  **Tamper-Proof Chat Identities:** Instead of trusting the frontend to send chat usernames (which can be easily spoofed in Chrome DevTools), the backend maintains a strict `Socket -> Username` Map. Your identity is locked in at the server level, making impersonation impossible.
2.  **Solving the "Late Joiner" & Refresh Desync:** Initially, the frontend tracked who was in the room. But if a user refreshed their page, their local array emptied, causing a UI mismatch with other users. The architecture was rewritten so the backend acts as the single source of truth, broadcasting the definitive active user list on every join, leave, or refresh.
3.  **Multi-Tab User Deduplication:** If a user opens the same room in three different browser tabs, they generate three distinct WebSocket connections. To keep the "Dynamic Island" active user count accurate, the backend maps those sockets to their specific username and passes them through a JavaScript `Set`, ensuring they are only counted as one active person.
4.  **Debounced Database Writes:** To support the auto-save feature without crashing the database, I implemented a custom debounce hook. The system waits until the user pauses typing for 5 seconds before sending the payload to MongoDB, drastically reducing database write operations.
5.  **State Management & Closures:** Defeated React's "stale closure" problem by heavily utilizing `useRef` to maintain synchronous flags during asynchronous WebSocket events.

---

## 🔮 Phase 2 Roadmap

CoreWire's core engine is stable, but the vision extends further. Upcoming features include:
* **CRDT Integration:** Replacing the current full-string WebSocket payload with Conflict-Free Replicated Data Types (CRDT) to handle granular cursor positions and prevent overlapping text collisions.
* **WebRTC Video & Voice:** Implementing peer-to-peer audio and video channels so developers can talk directly through the browser while coding.
* **Multi-Language Support:** Expanding the JDoodle compiler integration to support Python, C++, and Java execution.
* **Account Security:** Adding OTP-based email verification during the signup flow.

---

## 💻 Run it Locally

Want to test the engine yourself? Here is how to spin it up:

### 1. Clone & Setup Backend

```bash
# Clone the repository
git clone [https://github.com/Chetanwadhwa03/Collaborative-Code-Editor.git](https://github.com/Chetanwadhwa03/Collaborative-Code-Editor.git)

# Navigate to the backend directory
cd Collaborative-Code-Editor/backend

# Install dependencies
npm install

# Create environment variables
touch .env
```

*Add the following to your backend `.env` file:*

```env
PORT=3000
MONGODB_URI="your_mongodb_connection_string"
JWT_SECRET_KEY="your_secret_key"
Client_ID="your_jdoodle_client_id"
Client_Secret="your_jdoodle_client_secret"
```

*Start the server:*

```bash
# Run the backend (We recommend using nodemon or ts-node-dev for development)
npm run dev 
# OR
node dist/server.js
```

### 2. Setup Frontend

Open a **new** terminal window:

```bash
# Navigate to the frontend directory
cd Collaborative-Code-Editor/frontend

# Install dependencies
npm install

# Create environment variables
touch .env
```

*Add the following to your frontend `.env` file:*

```env
VITE_BACKEND_URL="http://localhost:3000"
```

*Start the React app:*

```bash
npm run dev
```

*(Note: If testing locally, ensure your frontend WebSocket connection is temporarily updated to point to `ws://localhost:3000` rather than the live Railway URL).*

***

*(Feel free to reach out on [LinkedIn](https://www.linkedin.com/in/chetan-wadhwa-9174051a3/) if you have any questions or feedback about the codebase!)*

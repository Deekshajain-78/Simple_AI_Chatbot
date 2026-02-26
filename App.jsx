import React, { useState } from 'react'
import Chat from './components/Chat'

export default function App(){
  const [backend, setBackend] = useState('http://localhost:8000/chat')
  const [mode, setMode] = useState('rest')

  return (
    <div className="app-root">
      <header className="topbar">
        <h1>Animated Chatbot</h1>
        <div className="controls">
          <input value={backend} onChange={e=>setBackend(e.target.value)} />
          <select value={mode} onChange={e=>setMode(e.target.value)}>
            <option value="rest">REST</option>
            <option value="ws">WebSocket</option>
          </select>
        </div>
      </header>
      <main>
        <Chat backendUrl={backend} mode={mode} />
      </main>
    </div>
  )
}

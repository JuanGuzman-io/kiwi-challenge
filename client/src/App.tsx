import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RewardsHome } from './features/rewards/components/RewardsHome'
import './App.css'

// Placeholder for withdrawal page (out of scope for this feature)
function WithdrawPage() {
  return (
    <div>
      <h1>Withdraw</h1>
      <p>Withdrawal flow placeholder (out of scope for this feature)</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/rewards" element={<RewardsHome />} />
        <Route path="/withdraw" element={<WithdrawPage />} />
        <Route path="/" element={<Navigate to="/rewards" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

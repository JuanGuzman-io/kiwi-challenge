import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RewardsHome } from './features/rewards/components/RewardsHome'
import { WithdrawScreen } from './features/rewards/components/withdraw/WithdrawScreen'
import { WithdrawSuccessScreen } from './features/rewards/components/withdraw/WithdrawSuccessScreen'
import { AccountList } from './features/rewards/components/withdraw/AccountList'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/rewards" element={<RewardsHome />} />
        <Route path="/withdraw" element={<WithdrawScreen />} />
        <Route path="/withdraw/accounts" element={<AccountList />} />
        <Route path="/withdraw/success" element={<WithdrawSuccessScreen />} />
        <Route path="/" element={<Navigate to="/rewards" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

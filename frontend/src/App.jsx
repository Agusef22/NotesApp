import Home from './pages/Home/Home'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login/Login'
import SignUp from './pages/SignUp/SignUp'
import Admin from './pages/Admin/Admin'

const routes = (
  <Router>
    <Routes>
      <Route path='/' exact element={<Home />} />
      <Route path='/dashboard' exact element={<Home />} />
      <Route path='/login' exact element={<Login />} />
      <Route path='/signup' exact element={<SignUp />} />
      <Route path='/admin' exact element={<Admin />} />
    </Routes>
  </Router>
)

const App = () => {
  return <div>{routes}</div>
}

export default App

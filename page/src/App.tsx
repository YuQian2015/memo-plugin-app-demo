import './App.scss'
import IndexPage from './pages/IndexPage'
import { Route, Routes, HashRouter } from 'react-router-dom'

function App() {
  return <div className='App'>
    <div className='pages'>
      <HashRouter>
        <Routes>
          <Route path="/" element={<IndexPage />} />
        </Routes>
      </HashRouter>
    </div>
  </div>
}

export default App

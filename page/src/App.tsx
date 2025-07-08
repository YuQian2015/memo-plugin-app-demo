import './App.scss'
import IndexPage from './pages/IndexPage'
import { Route, Routes, HashRouter } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { initI18n } from './lib'

function App() {

  const [i18nInitialized, setI18nInitialized] = useState(false);

  // 初始化 i18n
  useEffect(() => {
    initI18n()
      .then(() => {
        setI18nInitialized(true);
      })
      .catch((error) => {
        console.error("Failed to initialize i18n:", error);
        // 即使初始化失败也要设置状态，避免无限加载
        setI18nInitialized(true);
      });
  }, []);

  return <div className='App'>
    <Toaster />
    <div className='pages'>
      {!i18nInitialized ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          </div>
        </div>
      ) : (
        <HashRouter>
          <Routes>
            <Route path="/" element={<IndexPage />} />
          </Routes>
        </HashRouter>
      )}
    </div>
  </div>
}

export default App

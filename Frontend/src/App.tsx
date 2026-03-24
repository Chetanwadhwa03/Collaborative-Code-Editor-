import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './App.css'
import Landingpage from './Pages/Landingpage'
import Codeeditor from './Pages/Codeeditor'
import Dashboard from './Pages/Dashboard'
import Errorpage from './Pages/Errorpage'


function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' Component={Landingpage}></Route>
          <Route path='/Codeeditor' Component={Codeeditor}></Route>
          <Route path='/Dashboard' Component={Dashboard}></Route>
          <Route path='*' Component={Errorpage}></Route>
        </Routes>
      </BrowserRouter>


    </>
  )
}

export default App

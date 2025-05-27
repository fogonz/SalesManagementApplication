import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter , RouterProvider} from 'react-router-dom'
import './index.css'
import App from './App'
import HelpMenu from './components/StaticComponents/help'


const router = createBrowserRouter([
  {path:"/", element: <App></App>},
  {path:"/administrador", element: <div style={{color:"black"}}><h1>PLACEHOLDER: ventana adminstración y estadísticas</h1></div>},
  {path:"/ayuda", element: <HelpMenu></HelpMenu>},
]); 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>,
)

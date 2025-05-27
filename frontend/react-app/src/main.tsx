import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter , RouterProvider} from 'react-router-dom'
import './index.css'
import App from './App'
import HelpMenu from './components/staticComponents/help'


const router = createBrowserRouter([
  {path:"/", element: <App></App>},
  {path:"/ayuda", element: <HelpMenu></HelpMenu>},
]); 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>,
)

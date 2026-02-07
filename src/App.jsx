import { BrowserRouter } from 'react-router-dom'
import AppLayout from "./AppLayout"
import { AuthProvider } from "./context/AuthContext"

function App() {

  return (
    <div className="app-wrapper">
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
    </div>
  )
}

export default App;

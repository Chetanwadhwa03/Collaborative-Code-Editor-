import { Navigate } from "react-router-dom"

const ProtectedRoute = ({children}: { children: React.ReactNode }) => {
    const token = localStorage.getItem('authorization')

    if (!token) {
      alert('Please login to access this page.')
      return <Navigate to={'/'}></Navigate>
    }
    else{
        return children
    }
  
}

export default ProtectedRoute

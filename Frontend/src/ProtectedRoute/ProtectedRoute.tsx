import { Navigate } from "react-router-dom"
import {toast} from 'react-toastify'

const ProtectedRoute = ({children}: { children: React.ReactNode }) => {
    const token = localStorage.getItem('authorization')

    if (!token) {
      toast.error('Just Signup and enjoy the editor!',{
        position:'top-right'
      })
      return <Navigate to={'/'}></Navigate>
    }
    else{
        return children
    }
  
}

export default ProtectedRoute

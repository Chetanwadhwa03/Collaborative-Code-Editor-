import axios from "axios"
import {useState } from "react"
import { useNavigate } from "react-router-dom"

const Landingpage = () => {
  const [isSignup, setisSignup] = useState<boolean>(true)
  const navigate = useNavigate()


  // @ts-ignore
  async function handlesignup(e) {
    console.log('In the handlesignup function')
    e.preventDefault()

    const formdata = new FormData(e.currentTarget)
    const content = Object.fromEntries(formdata)
    console.log('Content: ',content);
    

    try {
      const response = await axios.post('http://localhost:3000/api/v1/signup', content)
      alert(response.data.message)
      setisSignup(false);
    }
    catch (e) {
      // @ts-ignore
      alert(e.response.data.message)
    }
  }

  // @ts-ignore
  async function handlesignin(e){
    e.preventDefault()

    const formdata = new FormData(e.currentTarget)
    const content = Object.fromEntries(formdata)
    console.log('Signin Content: ', content);

    try{
      const response = await axios.post('http://localhost:3000/api/v1/signin', content)

      const ctoken = response.data.token
      localStorage.setItem('authorization',ctoken);
      alert(response.data.message)
      navigate('/Dashboard')
    }
    catch(e){
      // @ts-ignore
      alert(e.response.data.message)
    }
  }


  return (
    <div className="bg-[#09090b] h-screen m-0 p-0 flex gap-3">
      <div className=" text-white mt-3 mb-3  w-[50vw] border-2 border-white rounded-2xl flex">
        <div className={`${(!isSignup) ? "hidden":"block" } text-yellow-400 border-2 border-pink-400 rounded-2xl  justify-center h-[30vh] w-[30vw] ml-[10vw] mt-[30vh] text-center`}>
          <h1>Signup</h1>
          <form className="mt-4 flex flex-col m-2" onSubmit={handlesignup}>
            <input name="username" className="p-2" type="text" placeholder="Enter the name."></input>
            <input name="email"  className="p-2" type="text" placeholder="Enter the email."></input>
            <input name="password" className="p-2" type="text" placeholder="Enter the password."></input>
            <button className="p-2 rounded-2xl border-2 cursor-pointer bg-yellow-100 hover:bg-gray-50 text-black">Submit</button>
          </form>

        </div>

        <div className={`${(isSignup) ? "hidden":"block" } text-yellow-400 border-2 border-pink-400 rounded-2xl  justify-center h-[30vh] w-[30vw] ml-[10vw] mt-[30vh] text-center`}>
          <h1>Signin</h1>
          <form className="mt-4 flex flex-col m-2" onSubmit={handlesignin}>
            <input name="email" className="p-2" type="text" placeholder="Enter the email."></input>
            <input name="password" className="p-2" type="text" placeholder="Enter the password."></input>
            <button className="p-2 rounded-2xl border-2 cursor-pointer bg-yellow-100 hover:bg-gray-50 text-black">Submit</button>
          </form>

        </div>

      </div>
      <div className=" text-white p-4 mt-3 mb-3 w-[50vw] border-2 border-red-600 rounded-2xl shadow-amber-300">
        Demo effects and everything will be displayed
      </div>

    </div>
  )
}

export default Landingpage

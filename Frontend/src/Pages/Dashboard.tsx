import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from 'axios'

const Dashboard = () => {
  const navigate = useNavigate();
  const [roomName, setroomName] = useState<string>()
  const [bVisible, setbVisible] = useState(true)
  const [roomId, setroomId] = useState<string>()
  const joinroomref = useRef<HTMLDivElement>(null)



  async function handlecreateroom() {
    try {
      const token = localStorage.getItem('authorization')

      setbVisible(false)
      const response = await axios.post('http://localhost:3000/api/v1/create-room',
        {
          "roomname": roomName,
        },
        {
          "headers": {
            "authorization": token
          }
        }
      )

      alert(response.data.message)

      if (joinroomref.current != null) {
        const obtroomId = response.data.roomId
        joinroomref.current.innerHTML = obtroomId
        setbVisible(true)
        navigate(`/Codeeditor/${obtroomId}`)
      }
    }
    catch (e) {
      setbVisible(true)
      // @ts-ignore
      alert(e.response.data.message)
      
    }
  }

  async function handlejoinroom(){
    try{
      const token = localStorage.getItem('authorization')
      const response = await axios.get(`http://localhost:3000/api/v1/join-room/${roomId}`,{
        headers:{
          authorization:token
        }
      })
      
      navigate(`/Codeeditor/${roomId}`)
      // For now it is alert, but later on we have to use toasts here.
      alert(response.data.message)
    }
    catch(e){
      // for now i have hardcoded the message, otherwise we have to pick it up from the server.
      alert("RoomId does not exist")
    }
  }


  return (
    <div className="bg-[#09090b] h-screen">
      <div className="relative flex space-x-4 items-center">
        <h1 className=" ml-[35vw] mb-[30vh]  text-7xl text-white font-bold">Catchy Text</h1>
        <div className="absolute right-5 bottom-55 rounded-full bg-white p-2">C</div>
      </div>

      <div className="flex justify-center align-center gap-100">
        <div className="bg-amber-300 p-4 rounded-xl border border-white h-[30vh] w-[25vw] ">
          <h2>Create Room</h2>
          <span className="flex gap-2">
            <input onChange={(e) => { setroomName(e.target.value) }} className="border-2 border-white rounded-2xl p-3" type="text " placeholder="Enter the room name" ></input>
            <button className={`border-2 border-white  p-2 cursor-pointer ${(!bVisible) ? 'hidden' : 'block hover:bg-gray-400'}`} onClick={handlecreateroom}>Create Room</button>
          </span>
          <div ref={joinroomref} className="border-2 bg-amber-50 mt-3 p-3 rounded-xl">
          </div>
        </div>
        <div className="bg-pink-200 p-4 rounded-xl border border-white  h-[30vh] w-[25vw]">
          <h2>Join Room</h2>
          <span className="flex gap-2">
            <input className="border-2 border-white rounded-2xl p-3" type="text " placeholder="Enter the room id" onChange={(e)=>{setroomId(e.target.value)}} ></input>
            <button className={`border-2 border-white  p-2 cursor-pointer block hover:bg-gray-400`} onClick={handlejoinroom}>Join Room</button>
          </span>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

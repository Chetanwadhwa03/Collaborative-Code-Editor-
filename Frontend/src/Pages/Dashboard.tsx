import { useEffect, useRef, useState } from "react"
import axios from 'axios'

const Dashboard = () => {

  const [roomName, setroomName] = useState<string>()
  const inputref = useRef(null)

  function handleinput() {
    if (inputref.current != null) {
      const croom = inputref.current
      setroomName(croom);
    }
  }

  useEffect(() => {
    try {
      const backendcall = async () => {
        const token = localStorage.getItem('authorization')

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
        alert(response.data.message + "with" + response.data.roomId)
      }

      backendcall()
    }
    catch (e) {
      console.log('Error encountered as ', e);
    }

  }, [roomName])



  return (
    <div className="bg-[#09090b] h-screen">
      <div className="relative flex space-x-4 items-center">
        <h1 className=" ml-[35vw] mb-[30vh]  text-7xl text-white font-bold">Catchy Text</h1>
        <div className="absolute right-5 bottom-55 rounded-full bg-white p-2">C</div>
      </div>

      <div className="flex justify-center align-center gap-100">
        <div className="bg-amber-300 p-4 rounded-xl border border-white h-[30vh] w-[25vw] ">
          <h2>Create Room</h2>
          <span><input ref={inputref} className="border-2 border-white rounded-2xl p-3" type="text " placeholder="Enter the room name" onChange={handleinput}></input></span>
        </div>
        <div className="bg-pink-200 p-4 rounded-xl border border-white  h-[30vh] w-[25vw]">
          <h2>Join Room</h2>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

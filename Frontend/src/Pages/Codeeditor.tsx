import { Editor } from "@monaco-editor/react"
import { useEffect, useState } from "react"


const Codeeditor = () => {
  const [websocket, setwebsocket] = useState<WebSocket>()
  // @ts-ignore
  const [uname, setuname] = useState<string>()
  const [content, setcurrcontent] = useState<string>("//Write your js code here !!!")

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080')
    setwebsocket(ws)

    ws.onopen = () => {
      // for now in a hardcoded way i am joining a xyz room so that my code synchronization can work in the backend
      const temproom = {
        type: 'join',
        payload: {
          roomId: 'xyz',
          username: 'chetan'
        }
      }

      ws.send(JSON.stringify(temproom))
    }


    // When my friend types the code and i have to update it in the editor.
    ws.onmessage = (data) => {
      // @ts-ignore
      const parseddata = JSON.parse(data.data)
      console.log('Message received !!!')

      if (parseddata.type === 'join') {
        const curruser = parseddata.payload.username
        alert(`${curruser} has joined the room`)
        setuname(curruser)
      }
      // important 
      else if (parseddata.type === 'code') {
        console.log('The received message has a type code.')
        setcurrcontent(parseddata.payload.content)
      }
    }
    
    // return ws.onclose()

  }, [])




  // When i type the code, i have to send it to the server but i dont have to update the content state.

  // @ts-ignore
  const handlemytype = (value: string | undefined, event) => {
    const data = {
      type: 'code',
      payload: {
        roomId: 'xyz',
        content: value
      }
    }
    websocket?.send(JSON.stringify(data))
  }


  return (
    <div className="bg-black h-screen relative" >
      <div className="bg-amber-300 absolute left-[45vw] p-2">
        Dynamic Island
      </div>
      <div className="absolute top-[10vh] w-screen h-[80vh]">

        <Editor height={"80vh"}
          theme="vs-dark"
          defaultLanguage="javascript"
          value={content}
          onChange={handlemytype}>
        </Editor>



      </div>
      <div className="bg-red-400 absolute left-[45vw] bottom-[2vh] p-2">
        Dock
      </div>





    </div>
  )
}

export default Codeeditor

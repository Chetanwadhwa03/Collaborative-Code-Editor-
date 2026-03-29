import { Editor } from "@monaco-editor/react"
import { useEffect, useState } from "react"
import axios from 'axios'


const Codeeditor = () => {
  const [websocket, setwebsocket] = useState<WebSocket>()
  // @ts-ignore
  const [uname, setuname] = useState<string>()
  const [content, setcurrcontent] = useState<string>("//Write your js code here !!!")
  const [currmonacovalue , setcurrmonacovalue ] = useState<string>("")

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
        // alert(`${curruser} has joined the room`)
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
    if(value){
      setcurrmonacovalue(value)
    }
    const data = {
      type: 'code',
      payload: {
        roomId: 'xyz',
        content: value
      }
    }
    websocket?.send(JSON.stringify(data))
  }

  async function handlerunbutton(){
    try{
      const token = localStorage.getItem('authorization')
      
      const response = await axios.post('http://localhost:3000/api/v1/run-code',{
        // for now i have hardcoded the language and the versionindex.
        content:currmonacovalue,
        language:"nodejs",
        versionindex:"4"
      },
      {
        "headers":{
          "authorization":token
        }
      })

      const message = response.data.message
      const output= response.data.output
      console.log('output is: ', output);

    }
    catch(e){
      // @ts-ignore
      const message = e.response ? e.response.data : e.message;
      // @ts-ignore
      const error = e.response ? e.response.data : e.error;
      
      console.log('Error encounterd as',error);
    }
  }



  return (
    <div className="bg-black h-screen relative" >
      <div className="bg-amber-300 absolute left-[45vw] p-2">
        Dynamic Island
      </div>
      <div className="absolute top-[10vh] w-screen h-[80vh] flex flex-col">
        <div className="bg-gray-200 justify-center w-[7vw] rounded-2xl p-2 text-center ml-[45vw] mb-2 cursor-pointer hover:bg-gray-400" onClick={handlerunbutton}>Run Code</div>
        <Editor height={"77vh"}
          theme="vs-dark"
          defaultLanguage="javascript"
          value={content}
          onChange={handlemytype}>
        </Editor>



      </div>
      <div className="bg-red-400 absolute left-[45vw] bottom-[1vh] p-2">
        Dock
      </div>





    </div>
  )
}

export default Codeeditor

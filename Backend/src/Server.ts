import express from 'express'
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import { WebSocketServer } from 'ws';
import bcrypt from 'bcrypt'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid';
import cors from 'cors'
import axios from 'axios'



import Usermodel from './Models/User.js'
import Roommodel from './Models/Room.js';
import Auth from './Middleware/Auth.js';


const app = express();

app.use(express.json());

const corsoptions = {
    origin: "http://localhost:5173"
}

app.use(cors(corsoptions))
dotenv.config()

mongoose.connect("mongodb+srv://lovewadhwa03_db_user:password12345@todoapp.zhg1uey.mongodb.net/collab-code-editor")



const zodschema = z.object({
    username: z.string().min(3, 'Minimum length of the username should be 3').max(5, 'You cannot give max length greater than 5').regex(/^[a-zA-Z0-9]+$/),
    email: z.email("Invalid Email Format"),
    // for strong password,we have to add the regex and i have to learn how to write them specifically using symbols like ^ and $
    password: z.string().min(3).max(10)
})

type zodtype = z.infer<typeof zodschema>

app.post('/api/v1/signup', async (req, res) => {
    try {
        console.log('In the signup API')
        const { username, email, password }: zodtype = req.body

        if (!username || !email || !password) {
            console.log('Faaltu ka error')
            return res.status(400).json({
                message: "Please provide all the credentials"
            })
        }

        const result = zodschema.safeParse(req.body)

        if (result.success) {
            const hashedpassword = await bcrypt.hash(password, 12);

            await Usermodel.create({
                name: username,
                email: email,
                password: hashedpassword
            })

            res.status(200).json({
                message: 'Signup Successful !!'
            })
            console.log('User has signed up !! ')
        }
        else {
            res.status(411).json({
                message: 'Input Validation failed'
            })
            console.log('Input validation failed')
        }
    }
    catch (e) {
        // @ts-ignore
        if (e.code === 11000) {
            return res.status(400).json({
                message: 'User already Exists'
            })
        }
        else {
            console.log('Error encountered as', e);
            return res.status(500).json({
                message: 'Internal Server Error'
            })
        }

    }
})

app.post('/api/v1/signin', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({
                message: 'Please enter all the credentials'
            })
        }

        const curruser = await Usermodel.findOne({
            email: email
        })

        if (!curruser) {
            return res.status(400).json({
                message: 'Please Signup First !!!'
            })
        }

        const hashedpassword = curruser.password
        const result = bcrypt.compare(hashedpassword, password)

        if (!result) {
            return res.status(403).json({
                message: 'Password is incorrect !!'
            })
        }

        // @ts-ignore
        const secretkey: string = process.env.JWT_SECRET_KEY

        const token = jwt.sign({
            email
        }, secretkey)

        return res.status(200).json({
            message: 'User Signed in Successfully !!',
            token: token
        })
    }
    catch (e) {
        console.log('Error encountered ', e)
        return res.status(500).json({
            message: 'Internal Server Error'
        })
    }



})

app.post('/api/v1/create-room', Auth, async (req, res) => {
    try {
        const { roomname } = req.body
        const email = res.locals.email

        const curruser = await Usermodel.findOne({
            email: email
        })

        if (!curruser) {
            return res.status(400).json({
                message: 'Please Signup First !!!'
            })
        }


        const ownerId = curruser._id
        const roomId = nanoid(5)

        const roomava = await Roommodel.findOne({
            roomname: roomname,
            ownerId: ownerId
        })

        if (roomava) {
            return res.status(400).json({
                message: 'Room already exists'
            })
        }

        await Roommodel.create({
            roomname: roomname,
            roomId: roomId,
            ownerId: ownerId,
            content: ""
        })

        res.status(200).json({
            message: 'Room Created Successfully',
            roomId: roomId
        })

        console.log('Room Created Successfully')

    }
    catch (e) {
        const error = e as any

        if (error.code === 11000) {
            console.log('Duplicate key error')
            return res.status(400).json({
                message: 'Room already exists'
            })
        }

        res.status(500).json({
            message: 'Internal server Eror'
        })
        console.log('Error encountered as', e)
    }

})

app.get('/api/v1/join-room/:roomId', Auth, async (req, res) => {
    try {
        const { roomId } = req.params
        console.log('RoomId: ', roomId)
        // @ts-ignore
        const currroom = await Roommodel.findOne({
            roomId: roomId
        })

        if (!currroom) {
            return res.status(400).json({
                message: 'Room Id does not exist'
            })
        }

        const content = currroom.content

        // i can pass the name of the user directly, because i have ref in the schema, but for now i am just extracting the id of it.
        const ownerId = currroom.ownerId

        res.status(200).json({
            message: 'Successfully joined the room !!',
            content: content,
            ownerId: ownerId

        })
    }
    catch (e) {
        console.log('Error encountered as', e)
        return res.status(500).json({
            message: 'Internal Server Error'
        })
    }





})

app.post('/api/v1/run-code', Auth, async (req, res) => {
    const { content, language, versionindex } = req.body

    if (!content || content.trim() === "") {
        return res.status(400).json({ message: "Write some code first !" });
    }

    try {
        const response = await axios.post('https://api.jdoodle.com/v1/execute', {
            "clientId": process.env.Client_ID?.trim(),
            "clientSecret": process.env.Client_Secret?.trim(),
            "script": content,
            "language": language,
            "versionIndex": versionindex
        },
        {
            "headers": {
                "Content-Type": 'application/json'
            }
        })

        const output = response.data.output

        if (output === "JDoodle - Timeout. If your program reads input, please enter the inputs in the STDIN box above or try to enable the 'Interactive' mode option above. Please check your program does not contain an infinite loop. Contact JDoodle support at hello@jdoodle.com for more information.") {
            return res.status(400).json({
                message: 'TIME LIMIT EXCEEDED, please check your code.'
            })
        }

        res.status(200).json({
            message: 'Code Executed successfully',
            output: output
        })
    }
    catch (e) {
        // @ts-ignore
        const error = e.response ? e.response.data : e.message;
        res.status(400).json({
            message: 'Code Execution failed.',
            error: error
        })
    }
})



app.listen(3000, () => {
    console.log('Server is listening on the port 3000')
})

// Websocket Server
const wss = new WebSocketServer({ port: 8080 });
let rooms = new Map()

wss.on('connection', (socket) => {
    console.log('Websocket server connected succesfully !!!')
    try {
        socket.on('message', (data) => {
            const parseddata = JSON.parse(data.toString())

            if (parseddata.type === 'join') {
                const roomId = parseddata.payload.roomId;

                if (!rooms.has(roomId)) {
                    rooms.set(roomId, [socket])
                }
                else {
                    // roomId already exists in the map, we have to join the room.
                    rooms.get(roomId).push(socket);
                }

                if (rooms.has(roomId)) {
                    // @ts-ignore
                    rooms.get(roomId).forEach(s => {
                        if (s != socket) {
                            s.send(JSON.stringify(parseddata))
                        }
                    });
                }

            }
            else if (parseddata.type === 'code') {
                // parseddata === 'code'
                const roomId = parseddata.payload.roomId;

                if (rooms.has(roomId)) {
                    // @ts-ignore
                    rooms.get(roomId).forEach(s => {
                        if (s != socket) {
                            s.send(JSON.stringify(parseddata))
                        }
                    });
                }
                else {
                    socket.send('The room does not exists !!')
                }
            }

        })
    }
    catch (e) {
        console.log('Error encountered in websocket server as', e);
    }
})

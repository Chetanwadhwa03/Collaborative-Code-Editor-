import express from 'express'
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import { WebSocketServer } from 'ws';
import bcrypt from 'bcrypt'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid';


import Usermodel from './Models/User.js'
import Roommodel from './Models/Room.js';
import Auth from './Middleware/Auth.js';

const app = express();

app.use(express.json());
dotenv.config()

mongoose.connect('')



const zodschema = z.object({
    username: z.string().min(3, 'Minimum length of the username should be 3').max(5, 'You cannot give max length greater than 5').regex(/^[a-zA-Z0-9]+$/),
    email: z.email("Invalid Email Format"),
    // for strong password,we have to add the regex and i have to learn how to write them specifically using symbols like ^ and $
    password: z.string().min(3).max(10)
})

type zodtype = z.infer<typeof zodschema>

app.post('/api/v1/signup', async (req, res) => {
    try {
        const { username, email, password }: zodtype = req.body
        if (!username || !email || !password) {
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
            console.log('User has signed up 1!! ')
        }
        else {
            res.status(411).json({
                message: 'Input Validation failed'
            })
            console.log('Input validation failed')
        }
    }
    catch (e) {
        res.status(500).json({
            message: 'Internal Server Error'
        })
        console.log('Error encountered as', e);
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
        const { roomname, content } = req.body
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
        res.status(500).json({
            message:'Internal server Eror'
        })
        console.log('Error encountered as',e)
    }

})

app.get('/api/v1/join-room-:roomid', (req, res) => {





})

// Websocket Server
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (socket) => {

})

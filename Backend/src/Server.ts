import express from 'express'
import mongoose from 'mongoose';
import { WebSocketServer } from 'ws';
import bcrypt from 'bcrypt'
import {z} from 'zod'
import Usermodel from './Models/User.js'
import Roommodel from './Models/Room.js';

const app = express();

app.use(express.json());

mongoose.connect('')


const zodschema = z.object({
    username:z.string().min(3).max(5),
    email:z.string(),
    password:z.string().regex(/[A-Z]/).min(3).max(10)
})

type zodtype = z.infer<typeof zodschema>

app.post('/api/v1/signup', async (req, res) => {
    try {
        const { username, email, password } : zodtype = req.body
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide all the credentials"
            })
        }

        const result = zodschema.safeParse(req.body)

        if(result.success){
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
        else{
            res.status(411).json({
                message:'Input Validation failed'
            })
            console.log('Input validation failed')
        }
    }
    catch (e) {
        res.status(500).json({
            message:'Internal Server Error'
        })
        console.log('Error encountered as',e);
    }
})

app.post('/api/v1/signin', (req, res) => {
    





})

app.post('/api/v1/create-room', (req, res) => {

})

app.get('/api/v1/join-room', (req, res) => {

})

// Websocket Server
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (socket) => {

})

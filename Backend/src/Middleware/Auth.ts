import type { Request,Response,NextFunction } from "express";
import jwt from 'jsonwebtoken'

function Auth(req:Request,res:Response,next:NextFunction){
    const token = req.headers.authorization
    if(!token){
        return res.status(403).json({
            message:'Session Expired'
        })
    }
    else{
        // @ts-ignore
        const data = jwt.verify(token,process.env.JWT_SECRET_KEY)
        res.locals.email = data.email
    }
    next()
}

export default Auth
import type { Request,Response,NextFunction } from "express";

function Auth(req:Request,res:Response,next:NextFunction){
    const token = req.headers.authorization
    if(!token){
        return res.status(403).json({
            message:'Session Expired'
        })
    }
    else{
        // @ts-ignore
        const email = jwt.verify(token,process.env.JWT_SECRET_KEY)
        res.locals.email = email
    }
    next()
}

export default Auth
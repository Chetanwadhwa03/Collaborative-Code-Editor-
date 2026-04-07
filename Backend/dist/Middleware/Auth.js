import jwt from 'jsonwebtoken';
function Auth(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(403).json({
            message: 'Session Expired'
        });
    }
    else {
        // @ts-ignore
        const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
        res.locals.email = data.email;
    }
    next();
}
export default Auth;
//# sourceMappingURL=Auth.js.map
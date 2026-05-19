import jwt from 'jsonwebtoken';
function Auth(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(403).json({
            message: 'Session Expired'
        });
    }
    try {
        // @ts-ignore
        const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
        res.locals.email = data.email;
        next();
    }
    catch (e) {
        // @ts-ignore
        if (e.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Session Expired, please login again',
                isExpired: true
            });
        }
        res.status(403).json({
            message: 'Invalid token'
        });
    }
}
export default Auth;
//# sourceMappingURL=Auth.js.map
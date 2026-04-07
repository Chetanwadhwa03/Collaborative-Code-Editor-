import type { Request, Response, NextFunction } from "express";
declare function Auth(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export default Auth;
//# sourceMappingURL=Auth.d.ts.map
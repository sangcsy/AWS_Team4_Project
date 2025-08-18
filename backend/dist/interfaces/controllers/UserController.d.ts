import { Request, Response } from 'express';
export declare class UserController {
    private userService;
    constructor();
    register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    checkNickname: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getMyTemperature: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=UserController.d.ts.map
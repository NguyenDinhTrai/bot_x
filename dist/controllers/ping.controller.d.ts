/// <reference types="express" />
import { Request } from '@loopback/rest';
import { TwitterService } from '../services';
export declare class PingController {
    twitterService: TwitterService;
    private req;
    constructor(twitterService: TwitterService, req: Request);
    ping(): Promise<object>;
    pingAxios(): Promise<object>;
    pingReply(): Promise<object>;
    getReply(): Promise<object>;
}

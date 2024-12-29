import { LifeCycleObserver } from '@loopback/core';
import { GptService, TwitterService } from '../services';
export declare class SchedulerManager implements LifeCycleObserver {
    twitterService: TwitterService;
    gptService: GptService;
    constructor(twitterService: TwitterService, gptService: GptService);
    getContentReplyFromGPT(content: string, reply: string): Promise<string>;
    private getContentFromGPT;
    start(): void;
    stop(): void;
}

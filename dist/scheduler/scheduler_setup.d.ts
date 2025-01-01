import { LifeCycleObserver } from '@loopback/core';
import { ContentTelegramRepository, GroupToPostContentRepository, MessageRepository } from '../repositories';
import { GptService, TelegramBotService, TwitterService } from '../services';
export declare class SchedulerManager implements LifeCycleObserver {
    twitterService: TwitterService;
    gptService: GptService;
    telegramBotService: TelegramBotService;
    contentTelegramRepository: ContentTelegramRepository;
    messageRepository: MessageRepository;
    groupToPostContentRepository: GroupToPostContentRepository;
    constructor(twitterService: TwitterService, gptService: GptService, telegramBotService: TelegramBotService, contentTelegramRepository: ContentTelegramRepository, messageRepository: MessageRepository, groupToPostContentRepository: GroupToPostContentRepository);
    getContentReplyFromGPT(content: string, reply: string): Promise<string>;
    private getContentFromGPT;
    start(): void;
    stop(): void;
}

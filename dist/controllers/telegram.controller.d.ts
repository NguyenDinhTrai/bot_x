import { ContentTelegramRepository, MessageRepository } from '../repositories';
import { GptService, TelegramBotService } from '../services';
export declare class TelegramController {
    telegramBotService: TelegramBotService;
    gptService: GptService;
    messageRepository: MessageRepository;
    contentTelegramRepository: ContentTelegramRepository;
    constructor(telegramBotService: TelegramBotService, gptService: GptService, messageRepository: MessageRepository, contentTelegramRepository: ContentTelegramRepository);
    handleTelegramUpdate(body: any): Promise<void>;
    private saveMessageAndGetContext;
    getContextChat(chatId: any): Promise<string>;
    getContentReplyFromGPT(context: string): Promise<string>;
}

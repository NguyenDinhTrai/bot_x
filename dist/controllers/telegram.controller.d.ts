import { GptService, TelegramBotService } from '../services';
export declare class TelegramController {
    telegramBotService: TelegramBotService;
    gptService: GptService;
    constructor(telegramBotService: TelegramBotService, gptService: GptService);
    handleTelegramUpdate(body: any): Promise<void>;
    getContentReplyFromGPT(content: string): Promise<string>;
}

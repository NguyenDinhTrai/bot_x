// Uncomment these imports to begin using these cool features!

import {service} from '@loopback/core';
import {post, requestBody} from '@loopback/rest';
import {prompt_reply_system} from '../constant';
import {ChatGptParam, MessGpt} from '../models';
import {GptService, TelegramBotService} from '../services';

// import {inject} from '@loopback/core';


export class TelegramController {
  constructor(
    @service(TelegramBotService)
    public telegramBotService: TelegramBotService,
    @service(GptService)
    public gptService: GptService,
  ) { }

  @post('api/telegram-webhook')
  async handleTelegramUpdate(
    @requestBody() body: any,
  ): Promise<void> {
    console.log('🚀 New update from Telegram:', body);
    const bot = this.telegramBotService.bot;
    // Dữ liệu update từ Telegram
    const update = body;

    if (update.message) {
      let isGroup = update.message.chat.type === "group";
      if (isGroup) {
        const chatId = update.message.chat.id;
        const text = update.message.text || '';
        const idOfSender = update.message.from.id;
        const nameOfSender = update.message.from.first_name + " " + update.message.from.last_name;

        // todo: save `text` to db
        const context_chat = this.getContextChat(idOfSender, chatId);

        let isMention = ((update.message.entities ?? []).length > 0) && (update.message.entities[0].type === "mention");
        if (isMention) {
          let content = text.replace("@dylan_tetris_bot", "");
          let content_reply = await this.getContentReplyFromGPT([], content);
          content_reply = nameOfSender + ", " + content_reply;
          // todo: save `content_reply` to db
          await bot.sendMessage(chatId, content_reply);
        }
      }
    }
  }

  async getContentReplyFromGPT(
    context: MessGpt[],
    content: string,
  ): Promise<string> {
    const res = await this.gptService.responseChat(new ChatGptParam({
      messages: [
        new MessGpt({
          role: "system",
          content: prompt_reply_system("bóng tối bao phủ vũ trụ"),
        }),
        new MessGpt({
          role: "user",
          content: `input: ${content}`,
        })
      ]
    }));
    const content_reply = (res as any)["choices"][0]["message"]["content"];
    return content_reply;
  }
}

// Uncomment these imports to begin using these cool features!

import {service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {post, requestBody} from '@loopback/rest';
import {max_number_of_message_for_context_bot_telegram, nameChatBotTelegram, prompt_reply_system_telegram, time_of_session_telegram_bot} from '../constant';
import {ChatGptParam, MessGpt} from '../models';
import {ContentTelegramRepository, MessageRepository} from '../repositories';
import {GptService, TelegramBotService} from '../services';

export class TelegramController {
  constructor(
    @service(TelegramBotService)
    public telegramBotService: TelegramBotService,
    @service(GptService)
    public gptService: GptService,
    @repository(MessageRepository)
    public messageRepository: MessageRepository,
    @repository(ContentTelegramRepository)
    public contentTelegramRepository: ContentTelegramRepository,
  ) { }

  @post('api/telegram-webhook')
  async handleTelegramUpdate(
    @requestBody() body: any,
  ): Promise<void> {
    try {
      console.log('🚀 New update from Telegram:', body);
      const bot = this.telegramBotService.bot;

      const update = body;

      if (update.message) {
        let isGroup = update.message.chat.type.includes("group");
        if (isGroup) {
          const chatId = update.message.chat.id;
          const text = update.message.text || '';
          const idOfSender = update.message.from.id;
          const nameOfSender = update.message.from.first_name + " " + update.message.from.last_name;
          let content = text;
          const context_chat = await this.saveMessageAndGetContext(idOfSender, nameOfSender, content, chatId);
          let isMention = ((update.message.entities ?? []).length > 0) && (update.message.entities[0].type === "mention");
          if (isMention) {
            let content_reply = await this.getContentReplyFromGPT(context_chat);
            await this.messageRepository.create({
              username: nameChatBotTelegram,
              text: content_reply,
              group_id: chatId,
              sender_id: idOfSender,
            });
            await bot.sendMessage(chatId, content_reply);
          }
        } else {
          let mess = "Chức năng này chỉ hoạt động trong group";
          await bot.sendMessage(update.message.chat.id, mess);
        }
      }
    } catch (e) {
      console.log(e);
    }

  }
  private async saveMessageAndGetContext(idOfSender: any, nameOfSender: string, content: any, chatId: any) {
    await this.messageRepository.create({
      sender_id: idOfSender,
      username: nameOfSender,
      text: content,
      group_id: chatId,
    });
    const context_chat = await this.getContextChat(chatId);
    return context_chat;
  }

  async getContextChat(chatId: any) {
    let timeBefore10Minutes = new Date();
    timeBefore10Minutes.setMinutes(timeBefore10Minutes.getMinutes() - time_of_session_telegram_bot);
    let messages = await this.messageRepository.find({
      where: {
        group_id: chatId,
        create_at: {
          between: [timeBefore10Minutes, new Date()]
        }
      }
    })
    if (messages.length > max_number_of_message_for_context_bot_telegram) messages = messages.slice(messages.length - max_number_of_message_for_context_bot_telegram, messages.length);
    let messagesTexts = messages.map((message) => message.username + ": " + message.text);
    return messagesTexts.join("\n");
  }

  async getContentReplyFromGPT(
    context: string,
  ): Promise<string> {
    const lastContent = await this.contentTelegramRepository.findOne({
      order: ['create_at DESC'],
    })
    if (lastContent == null) {
      throw new Error("Không tìm thấy content cuối cùng");
    };
    let content = lastContent.content;
    const res = await this.gptService.responseChat(new ChatGptParam({
      messages: [
        new MessGpt({
          role: "system",
          content: prompt_reply_system_telegram(content ?? ""),
        }),
        new MessGpt({
          role: "user",
          content: `${context}`,
        })
      ]
    }));
    const content_reply = (res as any)["choices"][0]["message"]["content"];
    return content_reply;
  }
}

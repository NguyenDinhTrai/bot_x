"use strict";
// Uncomment these imports to begin using these cool features!
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const constant_1 = require("../constant");
const models_1 = require("../models");
const repositories_1 = require("../repositories");
const services_1 = require("../services");
let TelegramController = class TelegramController {
    constructor(telegramBotService, gptService, messageRepository, contentTelegramRepository) {
        this.telegramBotService = telegramBotService;
        this.gptService = gptService;
        this.messageRepository = messageRepository;
        this.contentTelegramRepository = contentTelegramRepository;
    }
    async handleTelegramUpdate(body) {
        var _a;
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
                    let isMention = (((_a = update.message.entities) !== null && _a !== void 0 ? _a : []).length > 0) && (update.message.entities[0].type === "mention");
                    if (isMention) {
                        let content_reply = await this.getContentReplyFromGPT(context_chat);
                        await this.messageRepository.create({
                            username: constant_1.nameChatBotTelegram,
                            text: content_reply,
                            group_id: chatId,
                            sender_id: idOfSender,
                        });
                        await bot.sendMessage(chatId, content_reply);
                    }
                }
                else {
                    let mess = "Chức năng này chỉ hoạt động trong group";
                    await bot.sendMessage(update.message.chat.id, mess);
                }
            }
        }
        catch (e) {
            console.log(e);
        }
    }
    async saveMessageAndGetContext(idOfSender, nameOfSender, content, chatId) {
        await this.messageRepository.create({
            sender_id: idOfSender,
            username: nameOfSender,
            text: content,
            group_id: chatId,
        });
        const context_chat = await this.getContextChat(chatId);
        return context_chat;
    }
    async getContextChat(chatId) {
        let timeBefore10Minutes = new Date();
        timeBefore10Minutes.setMinutes(timeBefore10Minutes.getMinutes() - constant_1.time_of_session_telegram_bot);
        let messages = await this.messageRepository.find({
            where: {
                group_id: chatId,
                create_at: {
                    between: [timeBefore10Minutes, new Date()]
                }
            }
        });
        if (messages.length > constant_1.max_number_of_message_for_context_bot_telegram)
            messages = messages.slice(messages.length - constant_1.max_number_of_message_for_context_bot_telegram, messages.length);
        let messagesTexts = messages.map((message) => message.username + ": " + message.text);
        return messagesTexts.join("\n");
    }
    async getContentReplyFromGPT(context) {
        const lastContent = await this.contentTelegramRepository.findOne({
            order: ['create_at DESC'],
        });
        if (lastContent == null) {
            throw new Error("Không tìm thấy content cuối cùng");
        }
        ;
        let content = lastContent.content;
        const res = await this.gptService.responseChat(new models_1.ChatGptParam({
            messages: [
                new models_1.MessGpt({
                    role: "system",
                    content: (0, constant_1.prompt_reply_system_telegram)(content !== null && content !== void 0 ? content : ""),
                }),
                new models_1.MessGpt({
                    role: "user",
                    content: `${context}`,
                })
            ]
        }));
        const content_reply = res["choices"][0]["message"]["content"];
        return content_reply;
    }
};
exports.TelegramController = TelegramController;
tslib_1.__decorate([
    (0, rest_1.post)('api/telegram-webhook'),
    tslib_1.__param(0, (0, rest_1.requestBody)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], TelegramController.prototype, "handleTelegramUpdate", null);
exports.TelegramController = TelegramController = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.service)(services_1.TelegramBotService)),
    tslib_1.__param(1, (0, core_1.service)(services_1.GptService)),
    tslib_1.__param(2, (0, repository_1.repository)(repositories_1.MessageRepository)),
    tslib_1.__param(3, (0, repository_1.repository)(repositories_1.ContentTelegramRepository)),
    tslib_1.__metadata("design:paramtypes", [services_1.TelegramBotService,
        services_1.GptService,
        repositories_1.MessageRepository,
        repositories_1.ContentTelegramRepository])
], TelegramController);
//# sourceMappingURL=telegram.controller.js.map
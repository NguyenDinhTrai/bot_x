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
    constructor(telegramBotService, gptService, messageRepository, contentTelegramRepository, groupToPostContentRepository) {
        this.telegramBotService = telegramBotService;
        this.gptService = gptService;
        this.messageRepository = messageRepository;
        this.contentTelegramRepository = contentTelegramRepository;
        this.groupToPostContentRepository = groupToPostContentRepository;
    }
    async deleteAllData() {
        await this.messageRepository.deleteAll();
        await this.contentTelegramRepository.deleteAll();
        await this.groupToPostContentRepository.deleteAll();
    }
    async deleteAllSession() {
        let timeBefore10Minutes = new Date();
        timeBefore10Minutes.setMinutes(timeBefore10Minutes.getMinutes() - constant_1.minutes_of_session_telegram_bot);
        await this.messageRepository.deleteAll({
            create_at: {
                lt: timeBefore10Minutes
            }
        });
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
                    const idOfSender = update.message.from.id;
                    const context_chat = await this.saveMessageAndGetContext(update.message);
                    let isMention = (((_a = update.message.entities) !== null && _a !== void 0 ? _a : []).length > 0) && (update.message.entities[0].type === "mention");
                    if (isMention) {
                        let content_reply = await this.getContentReplyFromGPT(context_chat.rolesOfContext, context_chat.context, chatId);
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
    async saveMessageAndGetContext(message) {
        var _a, _b;
        const chatId = message.chat.id;
        const idOfSender = message.from.id;
        let nameOfSender = ((_a = message.from.first_name) !== null && _a !== void 0 ? _a : "") + " " + ((_b = message.from.last_name) !== null && _b !== void 0 ? _b : "");
        nameOfSender = nameOfSender.trim();
        const content = message.text || '';
        let group_title = message.chat.title;
        this.add_group_chat_to_post_content(group_title, chatId);
        await this.messageRepository.create({
            sender_id: idOfSender,
            username: nameOfSender,
            text: content,
            group_id: chatId,
        });
        const context_chat = await this.getContextChat(chatId);
        return context_chat;
    }
    async add_group_chat_to_post_content(group_title, chatId) {
        if (group_title.includes(constant_1.headerGroupPostContent)) {
            if (await this.groupToPostContentRepository.findOne({
                where: {
                    group_id: chatId,
                }
            }) == null)
                await this.groupToPostContentRepository.create({
                    group_id: chatId,
                });
        }
    }
    async getContextChat(chatId) {
        let timeBefore10Minutes = new Date();
        timeBefore10Minutes.setMinutes(timeBefore10Minutes.getMinutes() - constant_1.minutes_of_session_telegram_bot);
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
        let roles = [];
        for (let i = 0; i < messages.length; i++) {
            if (roles.indexOf(messages[i].username) === -1) {
                roles.push(messages[i].username);
            }
        }
        return {
            rolesOfContext: roles.join(", "),
            context: messagesTexts.join("\n")
        };
    }
    async getContentReplyFromGPT(rolesOfContext, context, chatId) {
        var _a;
        const lastContent = await this.contentTelegramRepository.findOne({
            order: ['create_at DESC'],
            where: {
                id_group: chatId,
            }
        });
        let prompt = "";
        if (lastContent == null) {
            prompt = (0, constant_1.prompt_user_telegram_no_content)(rolesOfContext, context);
        }
        else {
            prompt = (0, constant_1.prompt_reply_user_telegram)(rolesOfContext, (_a = lastContent.content) !== null && _a !== void 0 ? _a : "", context);
        }
        const res = await this.gptService.responseChat(new models_1.ChatGptParam({
            messages: [
                new models_1.MessGpt({
                    role: "user",
                    content: prompt,
                }),
            ]
        }));
        const content_reply = res["choices"][0]["message"]["content"];
        if (content_reply.startsWith(`${constant_1.nameChatBotTelegram}:`) || content_reply.startsWith(`@${constant_1.nameChatBotTelegram}: `)) {
            return content_reply.substring(content_reply.indexOf(":") + 1).trim();
        }
        return content_reply;
    }
};
exports.TelegramController = TelegramController;
tslib_1.__decorate([
    (0, rest_1.get)('api/delete-all-data'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], TelegramController.prototype, "deleteAllData", null);
tslib_1.__decorate([
    (0, rest_1.get)('api/delete-all-without-session'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], TelegramController.prototype, "deleteAllSession", null);
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
    tslib_1.__param(4, (0, repository_1.repository)(repositories_1.GroupToPostContentRepository)),
    tslib_1.__metadata("design:paramtypes", [services_1.TelegramBotService,
        services_1.GptService,
        repositories_1.MessageRepository,
        repositories_1.ContentTelegramRepository,
        repositories_1.GroupToPostContentRepository])
], TelegramController);
//# sourceMappingURL=telegram.controller.js.map
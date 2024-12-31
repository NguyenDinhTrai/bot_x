"use strict";
// Uncomment these imports to begin using these cool features!
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const rest_1 = require("@loopback/rest");
const constant_1 = require("../constant");
const models_1 = require("../models");
const services_1 = require("../services");
// import {inject} from '@loopback/core';
let TelegramController = class TelegramController {
    constructor(telegramBotService, gptService) {
        this.telegramBotService = telegramBotService;
        this.gptService = gptService;
    }
    async handleTelegramUpdate(body) {
        var _a;
        console.log('🚀 New update from Telegram:', body);
        const bot = this.telegramBotService.bot;
        // Dữ liệu update từ Telegram
        const update = body;
        if (update.message) {
            let isGroup = update.message.chat.type === "group";
            if (isGroup) {
                const chatId = update.message.chat.id;
                const text = update.message.text || '';
                const nameOfSender = update.message.from.first_name + " " + update.message.from.last_name;
                // todo: save `text` to db
                let isMention = (((_a = update.message.entities) !== null && _a !== void 0 ? _a : []).length > 0) && (update.message.entities[0].type === "mention");
                if (isMention) {
                    let content = text.replace("@dylan_tetris_bot", "");
                    let content_reply = await this.getContentReplyFromGPT(content);
                    content_reply = nameOfSender + ", " + content_reply;
                    await bot.sendMessage(chatId, content_reply);
                }
            }
        }
        // try {
        //   // 1. Kiểm tra nếu update có message:
        //   if (update.message) {
        //     const chatId = update.message.chat.id;
        //     const text = update.message.text || '';
        //     // 2. Ví dụ: trả lời đơn giản
        //     if (text === '/start') {
        //       await bot.sendMessage(chatId, 'Chào bạn, đây là bot LoopBack 4!');
        //     } else {
        //       await bot.sendMessage(chatId, `Bạn vừa gửi: ${text}`);
        //     }
        //   }
        //   // chanel post
        //   if (update.channel_post) {
        //     const chatId = update.channel_post.chat.id;
        //     let isMention = update.channel_post.entities[0].type === "mention";
        //     let text = update.channel_post.text || '';
        //     if (isMention) {
        //       text = text.replace("@dylan_tetris_bot", "");
        //       const content_reply = await this.getContentReplyFromGPT(text);
        //       await bot.sendMessage(chatId, content_reply);
        //     }
        //   }
        // } catch (error) {
        //   console.error('Lỗi xử lý Telegram Update:', error);
        // }
    }
    async getContentReplyFromGPT(content) {
        const res = await this.gptService.responseChat(new models_1.ChatGptParam({
            messages: [
                new models_1.MessGpt({
                    role: "system",
                    content: (0, constant_1.prompt_reply_system)("bóng tối bao phủ vũ trụ"),
                }),
                new models_1.MessGpt({
                    role: "user",
                    content: `input: ${content}`,
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
    tslib_1.__metadata("design:paramtypes", [services_1.TelegramBotService,
        services_1.GptService])
], TelegramController);
//# sourceMappingURL=telegram.controller.js.map
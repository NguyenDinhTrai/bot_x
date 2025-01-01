"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerManager = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository");
const node_cron_1 = tslib_1.__importDefault(require("node-cron"));
const constant_1 = require("../constant");
const models_1 = require("../models");
const repositories_1 = require("../repositories");
const services_1 = require("../services");
let SchedulerManager = class SchedulerManager {
    constructor(twitterService, gptService, telegramBotService, contentTelegramRepository, messageRepository, groupToPostContentRepository) {
        this.twitterService = twitterService;
        this.gptService = gptService;
        this.telegramBotService = telegramBotService;
        this.contentTelegramRepository = contentTelegramRepository;
        this.messageRepository = messageRepository;
        this.groupToPostContentRepository = groupToPostContentRepository;
        // Chạy Post bài viết lên Twitter mỗi ngày
        node_cron_1.default.schedule(constant_1.time_utc_post_tweeter_every_day, async () => {
            console.log("Post bài viết lên Twitter mỗi ngày");
            try {
                let content = await this.getContentFromGPT();
                while (content.length > 280) {
                    content = await this.getContentFromGPT();
                }
                await this.twitterService.postTweet(content);
            }
            catch (e) {
                console.log(e);
            }
        }, {
            timezone: "Etc/UTC"
        });
        node_cron_1.default.schedule(constant_1.time_utc_post_telegram_every_day, async () => {
            var _a;
            console.log("Post bài viết lên Telegram mỗi ngày");
            try {
                let groupsToPostContent = (await this.groupToPostContentRepository.find());
                for (let i = 0; i < groupsToPostContent.length; i++) {
                    let content = await this.getContentFromGPT();
                    content = await this.getContentFromGPT();
                    let id_group = (_a = groupsToPostContent[i].group_id) !== null && _a !== void 0 ? _a : "";
                    await this.telegramBotService.bot.sendMessage(id_group, content);
                    await this.contentTelegramRepository.create({
                        content: content,
                        id_group: id_group,
                    });
                }
            }
            catch (e) {
                console.log(e);
            }
        }, {
            timezone: "Etc/UTC"
        });
        // Chạy Reply bài viết lên Twitter mỗi 15 phút
        node_cron_1.default.schedule('*/16 * * * *', async () => {
            try {
                let RepliesToReplyInTodayTweet = await this.twitterService.getRepliesToReplyInTodayTweet();
                if (RepliesToReplyInTodayTweet == null)
                    return;
                for (let i = 0; i < RepliesToReplyInTodayTweet.repliesToReply.length; i++) {
                    let content = await this.getContentReplyFromGPT(RepliesToReplyInTodayTweet.tweetContent, RepliesToReplyInTodayTweet.repliesToReply[i].text);
                    while (content.length > 280) {
                        content = await this.getContentReplyFromGPT(RepliesToReplyInTodayTweet.tweetContent, RepliesToReplyInTodayTweet.repliesToReply[i].text);
                    }
                    await this.twitterService.replyToTweet(RepliesToReplyInTodayTweet.repliesToReply[i].id, content);
                }
            }
            catch (e) {
                console.log(e);
            }
        }, {
            timezone: "Etc/UTC"
        });
    }
    async getContentReplyFromGPT(content, reply) {
        const res = await this.gptService.responseChat(new models_1.ChatGptParam({
            messages: [
                new models_1.MessGpt({
                    role: "system",
                    content: (0, constant_1.prompt_reply_system)(content),
                }),
                new models_1.MessGpt({
                    role: "user",
                    content: `userReply: ${reply}`,
                })
            ]
        }));
        const content_reply = res["choices"][0]["message"]["content"];
        return content_reply;
    }
    async getContentFromGPT() {
        const res = await this.gptService.responseChat(new models_1.ChatGptParam({
            messages: [
                new models_1.MessGpt({
                    role: "system",
                    content: constant_1.prompt_system,
                }),
                new models_1.MessGpt({
                    role: "user",
                    content: constant_1.prompt_to_create_post,
                })
            ]
        }));
        const content = res["choices"][0]["message"]["content"];
        return content;
    }
    start() { }
    stop() { }
};
exports.SchedulerManager = SchedulerManager;
exports.SchedulerManager = SchedulerManager = tslib_1.__decorate([
    (0, core_1.injectable)(),
    tslib_1.__param(0, (0, core_1.service)(services_1.TwitterService)),
    tslib_1.__param(1, (0, core_1.service)(services_1.GptService)),
    tslib_1.__param(2, (0, core_1.service)(services_1.TelegramBotService)),
    tslib_1.__param(3, (0, repository_1.repository)(repositories_1.ContentTelegramRepository)),
    tslib_1.__param(4, (0, repository_1.repository)(repositories_1.MessageRepository)),
    tslib_1.__param(5, (0, repository_1.repository)(repositories_1.GroupToPostContentRepository)),
    tslib_1.__metadata("design:paramtypes", [services_1.TwitterService,
        services_1.GptService,
        services_1.TelegramBotService,
        repositories_1.ContentTelegramRepository,
        repositories_1.MessageRepository,
        repositories_1.GroupToPostContentRepository])
], SchedulerManager);
//# sourceMappingURL=scheduler_setup.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerManager = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const node_cron_1 = tslib_1.__importDefault(require("node-cron"));
const constant_1 = require("../constant");
const models_1 = require("../models");
const services_1 = require("../services");
let SchedulerManager = class SchedulerManager {
    constructor(twitterService, gptService) {
        this.twitterService = twitterService;
        this.gptService = gptService;
        // Chạy Post bài viết lên Twitter mỗi ngày
        node_cron_1.default.schedule(constant_1.time_utc_post_tweeter_every_day, async () => {
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
        // Chạy Reply bài viết lên Twitter mỗi 15 phút
        node_cron_1.default.schedule('*/15 * * * *', async () => {
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
    tslib_1.__metadata("design:paramtypes", [services_1.TwitterService,
        services_1.GptService])
], SchedulerManager);
//# sourceMappingURL=scheduler_setup.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PingController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const rest_1 = require("@loopback/rest");
const twitter_lite_1 = tslib_1.__importDefault(require("twitter-lite"));
const services_1 = require("../services");
const consumerKey = "f97B69FIzL0XfD6oVp33FhqYF";
const consumerSecret = "St4HubHPGwXcd0AJikstT9CL0bFwcOeFtuxID8ahm9tDl5ZgAW";
const accessToken = "1872892889140994048-sd8fon5KJkVcfIcRS23lxAHC2fEDQu";
const accessTokenSecret = "eWoYV7xGZDWOrEsTjjRoIcwW26V2Mehi0MwgwRxVwPEco";
let PingController = class PingController {
    constructor(twitterService, req) {
        this.twitterService = twitterService;
        this.req = req;
    }
    async ping() {
        try {
            const config = {
                consumer_key: consumerKey,
                consumer_secret: consumerSecret,
                access_token_key: accessToken,
                access_token_secret: accessTokenSecret,
                version: "2",
                extension: false,
            };
            const client = new twitter_lite_1.default(config);
            const res = await client.post("tweets", { text: "Hello World 12" });
            return {
                headers: this.req.headers,
                response: res,
            };
        }
        catch (e) {
            return {
                headers: this.req.headers,
                response: e,
            };
        }
    }
    async pingAxios() {
        try {
            const res = await this.twitterService.postTweet("Hello World 12dsdsd");
            return {
                response: res,
            };
        }
        catch (e) {
            return {
                response: e
            };
        }
    }
    async pingReply() {
        try {
            const res = await this.twitterService.replyToTweet("1440000000000000000", "Hello World 1d2");
            return {
                response: res,
            };
        }
        catch (e) {
            return {
                response: e
            };
        }
    }
    async getReply() {
        try {
            const res = await this.twitterService.getRepliesOfTweet("");
            return {
                response: res,
            };
        }
        catch (e) {
            return {
                response: e
            };
        }
    }
};
exports.PingController = PingController;
tslib_1.__decorate([
    (0, rest_1.get)('/ping-package'),
    (0, rest_1.response)(200, {}),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], PingController.prototype, "ping", null);
tslib_1.__decorate([
    (0, rest_1.get)('/ping-axios'),
    (0, rest_1.response)(200, {}),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], PingController.prototype, "pingAxios", null);
tslib_1.__decorate([
    (0, rest_1.get)('/ping-axios-reply'),
    (0, rest_1.response)(200, {}),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], PingController.prototype, "pingReply", null);
tslib_1.__decorate([
    (0, rest_1.get)('/ping-axios-get-reply'),
    (0, rest_1.response)(200, {}),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], PingController.prototype, "getReply", null);
exports.PingController = PingController = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.service)(services_1.TwitterService)),
    tslib_1.__param(1, (0, core_1.inject)(rest_1.RestBindings.Http.REQUEST)),
    tslib_1.__metadata("design:paramtypes", [services_1.TwitterService, Object])
], PingController);
//# sourceMappingURL=ping.controller.js.map
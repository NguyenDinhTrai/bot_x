
import {injectable, LifeCycleObserver, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import cron from 'node-cron';
import {nameChatBotTelegram, prompt_reply_user_telegram, prompt_system, prompt_to_create_post, time_utc_post_telegram_every_day, time_utc_post_tweeter_every_day} from '../constant';
import {ChatGptParam, MessGpt} from '../models';
import {ContentTelegramRepository, GroupToPostContentRepository, MessageRepository} from '../repositories';
import {GptService, TelegramBotService, TwitterService} from '../services';

@injectable()
export class SchedulerManager implements LifeCycleObserver {
  constructor(
    @service(TwitterService)
    public twitterService: TwitterService,
    @service(GptService)
    public gptService: GptService,
    @service(TelegramBotService)
    public telegramBotService: TelegramBotService,
    @repository(ContentTelegramRepository)
    public contentTelegramRepository: ContentTelegramRepository,
    @repository(MessageRepository)
    public messageRepository: MessageRepository,
    @repository(GroupToPostContentRepository)
    public groupToPostContentRepository: GroupToPostContentRepository,
  ) {
    // Chạy Post bài viết lên Twitter mỗi ngày
    cron.schedule(time_utc_post_tweeter_every_day, async () => {
      console.log("Post bài viết lên Twitter mỗi ngày");
      try {
        let content = await this.getContentFromGPT();
        while (content.length > 280) {
          content = await this.getContentFromGPT();
        }
        await this.twitterService.postTweet(content);
      } catch (e) {
        console.log(e);
      }

    }, {
      timezone: "Etc/UTC"
    });

    cron.schedule(time_utc_post_telegram_every_day, async () => {
      console.log("Post bài viết lên Telegram mỗi ngày");
      try {
        let groupsToPostContent = (await this.groupToPostContentRepository.find());
        for (let i = 0; i < groupsToPostContent.length; i++) {
          try {
            let content = await this.getContentFromGPT();
            content = await this.getContentFromGPT();
            let id_group = groupsToPostContent[i].group_id ?? "";
            await this.telegramBotService.bot.sendMessage(id_group, content);

            // delete older content
            await this.contentTelegramRepository.deleteAll({id_group: id_group, })

            await this.contentTelegramRepository.create({
              content: content,
              id_group: id_group,
            })
          } catch (e) {
            await this.groupToPostContentRepository.deleteById(groupsToPostContent[i].id);
            console.log(e)
          }
        }

      } catch (e) {
        console.log(e);
      }

    }, {
      timezone: "Etc/UTC"
    });

    // Chạy Reply bài viết lên Twitter mỗi 15 phút
    cron.schedule('*/16 * * * *', async () => {
      try {
        let RepliesToReplyInTodayTweet = await this.twitterService.getRepliesToReplyInTodayTweet();
        if (RepliesToReplyInTodayTweet == null) return;

        for (let i = 0; i < RepliesToReplyInTodayTweet.repliesToReply.length; i++) {
          try {
            let content = await this.getContentReplyFromGPT(
              RepliesToReplyInTodayTweet.tweetContent,
              RepliesToReplyInTodayTweet.repliesToReply[i].text,
            );
            while (content.length > 280) {
              content = await this.getContentReplyFromGPT(
                RepliesToReplyInTodayTweet.tweetContent,
                RepliesToReplyInTodayTweet.repliesToReply[i].text,
              );
            }

            await this.twitterService.replyToTweet(RepliesToReplyInTodayTweet.repliesToReply[i].id, content);
          } catch (e) {
            console.log(e);
          }
        }
      } catch (e) {
        console.log(e);
      }

    }, {
      timezone: "Etc/UTC"
    });

  }
  async getContentReplyFromGPT(
    content: string,
    reply: string,
  ): Promise<string> {
    const res = await this.gptService.responseChat(new ChatGptParam({
      messages: [
        new MessGpt({
          role: "user",
          content: prompt_reply_user_telegram(
            "user",
            content,
            `user: ${reply}`,
            nameChatBotTelegram,
          ),
        }),
      ]
    }));
    const content_reply = (res as any)["choices"][0]["message"]["content"];
    if (content_reply.startsWith(`${nameChatBotTelegram}:`) || content_reply.startsWith(`@${nameChatBotTelegram}: `)) {
      return content_reply.substring(content_reply.indexOf(":") + 1).trim();
    }
    return content_reply;
  }

  private async getContentFromGPT() {
    const res = await this.gptService.responseChat(new ChatGptParam({
      messages: [
        new MessGpt({
          role: "system",
          content: prompt_system,
        }),
        new MessGpt({
          role: "user",
          content: prompt_to_create_post,
        })
      ]
    }));
    const content = (res as any)["choices"][0]["message"]["content"];
    return content;
  }

  start(): void { }
  stop(): void { }
}


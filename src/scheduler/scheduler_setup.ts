
import {injectable, LifeCycleObserver, service} from '@loopback/core';
import cron from 'node-cron';
import {prompt_reply_system, prompt_system, prompt_to_create_post, time_utc_post_tweeter_every_day} from '../constant';
import {ChatGptParam, MessGpt} from '../models';
import {GptService, TwitterService} from '../services';

@injectable()
export class SchedulerManager implements LifeCycleObserver {
  constructor(
    @service(TwitterService)
    public twitterService: TwitterService,
    @service(GptService)
    public gptService: GptService,
  ) {
    // Chạy Post bài viết lên Twitter mỗi ngày
    cron.schedule(time_utc_post_tweeter_every_day, async () => {
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

    // Chạy Reply bài viết lên Twitter mỗi 15 phút
    cron.schedule('*/15 * * * *', async () => {
      try {
        let RepliesToReplyInTodayTweet = await this.twitterService.getRepliesToReplyInTodayTweet();
        if (RepliesToReplyInTodayTweet == null) return;

        for (let i = 0; i < RepliesToReplyInTodayTweet.repliesToReply.length; i++) {
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
          role: "system",
          content: prompt_reply_system(content),
        }),
        new MessGpt({
          role: "user",
          content: `userReply: ${reply}`,
        })
      ]
    }));
    const content_reply = (res as any)["choices"][0]["message"]["content"];
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


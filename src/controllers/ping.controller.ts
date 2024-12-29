import {inject, service} from '@loopback/core';
import {
  get,
  Request,
  response,
  RestBindings
} from '@loopback/rest';
import Twitter, {TwitterOptions} from 'twitter-lite';
import {TwitterService} from '../services';


const consumerKey = "f97B69FIzL0XfD6oVp33FhqYF";
const consumerSecret = "St4HubHPGwXcd0AJikstT9CL0bFwcOeFtuxID8ahm9tDl5ZgAW";
const accessToken = "1872892889140994048-sd8fon5KJkVcfIcRS23lxAHC2fEDQu";
const accessTokenSecret = "eWoYV7xGZDWOrEsTjjRoIcwW26V2Mehi0MwgwRxVwPEco";

export class PingController {
  constructor(
    @service(TwitterService)
    public twitterService: TwitterService,

    @inject(RestBindings.Http.REQUEST,)
    private req: Request) { }

  @get('/ping-package')
  @response(200, {})
  async ping(): Promise<object> {
    try {
      const config: TwitterOptions = {
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        access_token_key: accessToken,
        access_token_secret: accessTokenSecret,
        version: "2",
        extension: false,
      };
      const client = new Twitter(config);

      const res = await client.post("tweets", {text: "Hello World 12"});

      return {
        headers: this.req.headers,
        response: res,
      };

    } catch (e) {
      return {
        headers: this.req.headers,
        response: e,
      };
    }
  }

  @get('/ping-axios')
  @response(200, {})
  async pingAxios(): Promise<object> {
    try {
      const res = await this.twitterService.postTweet("Hello World 12dsdsd");

      return {
        response: res,
      };

    } catch (e) {
      return {
        response: e
      }

    }
  }

  @get('/ping-axios-reply')
  @response(200, {})
  async pingReply(): Promise<object> {
    try {
      const res = await this.twitterService.replyToTweet("1440000000000000000", "Hello World 1d2");

      return {
        response: res,
      };

    } catch (e) {
      return {
        response: e
      }

    }
  }

  @get('/ping-axios-get-reply')
  @response(200, {})
  async getReply(): Promise<object> {
    try {
      const res = await this.twitterService.getRepliesOfTweet("");
      return {
        response: res,
      }
    } catch (e) {
      return {
        response: e
      }
    }
  }

}

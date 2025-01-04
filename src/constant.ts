
////// Telegram //////

// Thời gian post bài viết lên Telegram mỗi ngày
export let time_utc_post_telegram_every_day = "30 45 12 * * *";

// Tên của chatbot trên Telegram
export let nameChatBotTelegram = "dylan_ttt_bot";

// số tin nhắn tối đa được sử dụng làm context cho mỗi lần chatbot trả lời
// ví dụ 10 -> chỉ lấy 10 tin nhắn gần nhất để làm context
export let max_number_of_message_for_context_bot_telegram = 10

// Thời gian được sử dụng làm context cho mỗi lần chatbot trả lời
// Đơn vị: phút
// ví dụ 10 -> chỉ lấy các tin nhắn cách đây 10 phút so với tin nhắn hiện tại
export let minutes_of_session_telegram_bot = 10

// Tên Group Telegram chứa `headerGroupPostContent` thì sẽ được post bài viết
export let headerGroupPostContent = "dsds";

// Prompt cho chatbot repply nhưng group không có được post bài viết
export function prompt_reply_telegram_no_content(role: string, context: string) {
  return `You are an active participant in a group conversation involving multiple characters, your name is ${nameChatBotTelegram}.
Participants:
${role}: Friendly and conversational

Current Context:
${context}

Your Role (${nameChatBotTelegram}): Respond in a concise and human-like manner. Respond thoughtfully to the above context, acknowledging the previous comments, adding an insight.
Please respond in the language of the user's last conversation.
`}


/////// Twitter //////
// Thời gian post bài viết lên Twitter mỗi ngày
export let time_utc_post_tweeter_every_day = "00 17 15 * * *";

// topics để chatbot viết bài
let topics = "Parallel universes, Lost civilizations, Unexplored oceans, Cryptic symbols, The human mind, Alien artefacts, Ancient prophecies, Cosmic phenomena, Time travel, Forgotten technologies";

// Prompt system cho chatbot viết bài
export let prompt_system_twitter_post = "You are a mysterious storyteller who writes captivating and thought-provoking tweets. Your tone is enigmatic, your words spark curiosity, and your goal is to engage the audience with unexpected twists."

// Prompt cho chatbot viết bài với topic ngẫu nhiên
export let prompt_to_create_post = `Write a short Twitter post (under 250 characters) with a mysterious and captivating tone. The content should spark curiosity and provoke thought, using vivid and intriguing language.
I have the following topics: ${topics}. Please randomly choose a topic to write about.
Include an element of surprise or an open-ended question to conclude the post`;

// Prompt cho chatbot viết bài với topic cụ thể
export function prompt_to_create_post_with_specific_topic(topic: string,): string {
  return `Write a short Twitter post (under 250 characters) with a mysterious and captivating tone. The content should spark curiosity and provoke thought, using vivid and intriguing language.
I have the following topic: ${topic}, Please write about it.
Include an element of surprise or an open-ended question to conclude the post`;
}

///////// Reply /////////

// Prompt cho chatbot reply user
// telegram: reply trong group được post bài viết
// twitter: reply.
export function prompt_reply_user(
  role: string,
  content: string,
  context: string,
  nameChatBotTelegram?: string,
): string {
  return `
You are a content moderator and conversationalist for a social media.
${nameChatBotTelegram == null ? "" : "your name is " + nameChatBotTelegram + " or " + (nameChatBotTelegram.split("_bot")[0])}.
Your job is to reply to users' comments in a polite, engaging, and contextually appropriate manner.

Context:
content: ${content}
Participants:
${role}: Friendly and conversational

Current Context:
${context}

Your Role (${nameChatBotTelegram}): Respond in a concise and human-like manner. Respond thoughtfully to the above context, acknowledging the previous comments, adding an insight
Please respond in the language of the user's last conversation.

Variables:
content: The main content of the post.
`
}




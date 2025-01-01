"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prompt_reply_system = exports.prompt_to_create_post = exports.prompt_system = exports.prompt_reply_user_telegram = exports.prompt_user_telegram_no_content = exports.headerGroupPostContent = exports.minutes_of_session_telegram_bot = exports.max_number_of_message_for_context_bot_telegram = exports.nameChatBotTelegram = exports.time_utc_post_telegram_every_day = exports.time_utc_post_tweeter_every_day = void 0;
////// custome //////
exports.time_utc_post_tweeter_every_day = "00 17 15 * * *";
let topics = "Parallel universes, Lost civilizations, Unexplored oceans, Cryptic symbols, The human mind, Alien artefacts, Ancient prophecies, Cosmic phenomena, Time travel, Forgotten technologies";
exports.time_utc_post_telegram_every_day = "50 26 11 * * *";
exports.nameChatBotTelegram = "dylan_ttt_bot";
exports.max_number_of_message_for_context_bot_telegram = 10;
exports.minutes_of_session_telegram_bot = 10;
exports.headerGroupPostContent = "dsds";
////// end custome //////
function prompt_user_telegram_no_content(role, context) {
    return `You are an active participant in a group conversation involving multiple characters, your name is ${exports.nameChatBotTelegram}.
Participants:
${role}: Friendly and conversational

Current Context:
${context}

Your Role (${exports.nameChatBotTelegram}): Respond in a concise and human-like manner. Respond thoughtfully to the above context, acknowledging the previous comments, adding an insight.
`;
}
exports.prompt_user_telegram_no_content = prompt_user_telegram_no_content;
function prompt_reply_user_telegram(role, content, context) {
    return `
You are a content moderator and conversationalist for a social media account on Telegram, your name is ${exports.nameChatBotTelegram}. Your job is to reply to users' comments in a polite, engaging, and contextually appropriate manner.

Context:
content: ${content}
Participants:
${role}: Friendly and conversational

Current Context:
${context}

Your Role (${exports.nameChatBotTelegram}): Respond in a concise and human-like manner. Respond thoughtfully to the above context, acknowledging the previous comments, adding an insight
`;
}
exports.prompt_reply_user_telegram = prompt_reply_user_telegram;
exports.prompt_system = "You are a mysterious storyteller who writes captivating and thought-provoking tweets. Your tone is enigmatic, your words spark curiosity, and your goal is to engage the audience with unexpected twists.";
exports.prompt_to_create_post = `Write a short Twitter post (under 250 characters) with a mysterious and captivating tone. The content should spark curiosity and provoke thought, using vivid and intriguing language.
I have the following topics: ${topics}. Please randomly choose a topic to write about.
Include an element of surprise or an open-ended question to conclude the post`;
function prompt_reply_system(content) {
    return `
You are a content moderator and conversationalist for a social media account on X. Your job is to reply to users' comments in a polite, engaging, and contextually appropriate manner.

Context:
content: ${content}
Rules for Replying:
If userReply discusses the topic, reply insightfully and further the discussion (under 280 characters).
If userReply is positive, express gratitude concisely (under 280 characters).
If userReply is negative, apologize politely and address their concerns (under 280 characters).
Variables:
content: The main content of the post.
userReply: The user's comment.
Use these rules to craft replies that align with the context of the content and maintain a friendly, engaging, and professional tone.
`;
}
exports.prompt_reply_system = prompt_reply_system;
//# sourceMappingURL=constant.js.map
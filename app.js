require('dotenv').config();

const https = require('https');
const axios = require('axios').default;

const pageId = process.env.PAGE_ID;
const fbAppId = process.env.FB_APP_ID;
const access_token = process.env.ACCESS_TOKEN;
const interval = process.env.POLLING_INTERVAL;
const postId = process.env.POST_ID;

const react_types = [ "LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY" ];

const postQueryId = `${pageId}_${postId}`;

async function get_react_type(type) {
    if (postQueryId === "") return 0;

    let url = `https://graph.facebook.com/${postQueryId}?fields=reactions.type(${type}).limit(0).summary(total_count)&access_token=${access_token}`;

    const response = await (await axios.get(url)).data;
    console.log(response);

    let count = response.reactions.summary.total_count;
    return count;
}

async function get_text_content() {
    let likes = await get_react_type(react_types[0]);
    let loves = await get_react_type(react_types[1]);
    let haha = await get_react_type(react_types[2]);
    let wow = await get_react_type(react_types[3]);
    let sad = await get_react_type(react_types[4]);
    let angry = await get_react_type(react_types[5]);

    console.log(likes);

    let text = `Nếu bạn đọc được bài viết này, hãy thả react bất kỳ cho bài viết này và refresh hoặc nhấn F5.
    Bài này hiện đang có
    ${likes} lượt like,
    ${loves} lượt tym,
    ${haha} lượt haha,
    ${wow} lượt wow,
    ${sad} lượt sad
    và ${angry} lượt phẫn nộ.`;

    return encodeURI(text);
}

async function update_post() {
    let msg = await get_text_content();
    let url = `https://graph.facebook.com/${postQueryId}?message=${msg}&access_token=${access_token}`;

    await axios.post(url);

    console.log("----------");
}

setInterval(update_post, interval);
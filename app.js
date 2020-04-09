const https = require('https');

const pageId = process.env.PAGE_ID;
const fbAppId = process.env.FB_APP_ID;
const access_token = process.env.ACCESS_TOKEN;
const interval = process.env.POLLING_INTERVAL;
const postId = process.env.POST_ID;

const react_types = [ "LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY" ];

const postQueryId = `${pageId}_${postId}`;

function get_react_type(type) {
    if (postQueryId === "") return 0;

    var url = `https://graph.facebook.com/${postQueryId}?fields=reactions.type(${type}).limit(0).summary(total_count)&access_token=${access_token}`;

    var count = 0;

    https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => { data += chunk; });

        res.on('end', () => {
            count = JSON.parse(data).reactions.summary.total_count;
            console.log(`Type ${type}: ${count}`);
        });
    }).on('error', (err) => {
        console.log(`Count Error: ${err.message}`);
    });

    return count;
}

function get_reactions() {
    var reacts = new Array(6);

    for (let i = 0; i < reacts.length; i++) {
        reacts[i] = get_react_type(react_types[i]);
    }

    console.log("-----");

    return reacts;
}

function get_text_content() {
    var reacts = get_reactions();

    var likes = reacts[0];
    var loves = reacts[1];
    var haha = reacts[2];
    var wow = reacts[3];
    var sad = reacts[4];
    var angry = reacts[5];

    var text = `Nếu bạn đọc được bài viết này, hãy thả react bất kỳ cho bài viết này và refresh hoặc nhấn F5.
    Bài này hiện đang có
    ${likes} lượt like,
    ${loves} lượt tym,
    ${haha} lượt haha,
    ${wow} lượt wow,
    ${sad} lượt sad
    và ${angry} lượt phẫn nộ.`;

    return encodeURI(text);
}

function update_post() {
    var msg = get_text_content();
    var url = `https://graph.facebook.com/${postQueryId}?message=${msg}&access_token=${access_token}`;

    var options = {
        method: 'POST'
    };
    
    https.request(url, options).on('error', (err) => {
        console.log(`Error: ${err.message}`);
    });
}

function create_post() {
    var msg = get_text_content();
    var url = `https://graph.facebook.com/${pageId}/feed?message=${msg}&access_token=${access_token}`;

    var options = {
        method: 'POST'
    };

    var req = https.request(url, options, (res) => {
        postId = res.id;
    });

    req.end();
}

setInterval(update_post, interval);
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

function get_text_content() {
    var likes = get_react_type(react_types[0]);
    var loves = get_react_type(react_types[1]);
    var haha = get_react_type(react_types[2]);
    var wow = get_react_type(react_types[3]);
    var sad = get_react_type(react_types[4]);
    var angry = get_react_type(react_types[5]);

    console.log(likes);

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
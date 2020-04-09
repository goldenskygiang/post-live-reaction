const http = require('http');

const pageId = process.env.PAGE_ID;
const fbAppId = process.env.FB_APP_ID;
const access_token = process.env.ACCESS_TOKEN;
const interval = process.env.POLLING_INTERVAL;

var postId = "";

const react_types = [ "LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY" ];

function get_react_type(type) {
    if (postId === "") return 0;

    var url =  `https://graph.facebook.com/${postId}
    ?fields=reactions.type(${type}).limit(0).summary(total_count)
    &access_token=${access_token}`;

    var count = 0;

    http.get(url, (res) => {
        count = res.reactions.summary.total_count;
    });

    return count;
}

function get_reactions() {
    var reacts = new Array(6);

    for (let i = 0; i < reacts.length; i++) {
        reacts[i] = get_react_type(react_types[i]);
    }

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

    var text = `Nếu bạn đọc được bài viết này, hãy thả react bất kỳ cho bài viết này và refresh hoặc nhấn F5.\n
    Bài này hiện đang có \n
    ${likes} lượt like, \n
    ${loves} lượt tym, \n
    ${haha} lượt haha, \n
    ${wow} lượt wow, \n
    ${sad} lượt sad \n
    và ${angry} lượt phẫn nộ.`;

    return text;
}

function update_post() {
    var msg = get_text_content();
    var url = `https://graph.facebook.com/${postId}?message=${msg}&access_token=${access_token}`;

    var options = {
        method: 'POST'
    };

    var req = http.request(url, options, (res) => {
        postId = res.id;
    });

    req.end();
}

function create_post() {
    var msg = get_text_content();
    var url = `https://graph.facebook.com/${pageId}/feed?message=${msg}&access_token=${access_token}`;

    var options = {
        method: 'POST'
    };

    var req = http.request(url, options, (res) => {
        postId = res.id;
    });

    req.end();
}

if (postId === "") {
    create_post();
}

setInterval(update_post, interval);
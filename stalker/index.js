const Twit = require("twit");
const fs = require("fs");

const config = fs.readFileSync(__dirname + "/_config.json");
const exclude = fs.readFileSync(__dirname + "/exclude.json");
const words = 10;
const tweets = 200;

const twit = new Twit(JSON.parse(config));

let stream = twit.stream('statuses/filter', {
    track: ['@StalkerBoter']
});
stream.on("tweet", function (tweet) {
    // Ignore replies
    if (tweet.in_reply_to_status_id_str)
        return;
    console.log(`Received tweet from ${tweet.user.screen_name}: "${tweet.text}"`);
    sendWordList(tweet.user, tweet);
});

function sendWordList(user, tweet) {
    twit.get("statuses/user_timeline", {
        user_id: user.id_str,
        exclude_replies: false,
        include_rts: false,
        count: tweets
    }, function (err, data, _response) {
        if (err) {
            console.error(err);
            return;
        }

        let counts = compileWordCounts(data);
        let highest = getHighestWordCounts(counts);

        let status = `@${user.screen_name} Here are your ${words} most used words from the last ${tweets} tweets:\n`;
        for (let word of highest) {
            let amount = counts.get(word);
            if (word.startsWith("@"))
                word = `<at>${word.substring(1)}`;
            status += `${amount}x ${word}\n`;
        }

        console.log(`Replying with "${status}"`);
        twit.post("statuses/update", {
            status: status,
            in_reply_to_status_id: tweet.id_str
        }, function (err, _data, _response) {
            if (err)
                console.error(err);
        });
    });
}

function compileWordCounts(tweets) {
    let wordCounts = new Map();
    for (let tweet of tweets) {
        for (let word of tweet.text.split(/[ |\n]/)) {
            let curr = wordCounts.get(word);
            if (!curr)
                curr = 0;
            wordCounts.set(word, curr + 1);
        }
    }
    return wordCounts;
}

function getHighestWordCounts(counts) {
    let chosen = [];
    for (let i = 0; i < words; i++) {
        let highestWord;
        for (let [k, v] of counts.entries()) {
            if (chosen.includes(k) || exclude.includes(k))
                continue;
            if (!highestWord || v > counts.get(highestWord))
                highestWord = k;
        }
        if (highestWord)
            chosen.push(highestWord);
    }
    return chosen;
}
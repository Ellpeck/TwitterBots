const Twit = require("twit");
const fs = require("fs");

const config = fs.readFileSync(__dirname + "/_config.json");
const twit = new Twit(JSON.parse(config));

doTheMath();
// every two hours
setInterval(doTheMath, 7200000);

function doTheMath() {
    let firstNum = Math.floor(Math.random() * 40) - 20;
    let secondNum = Math.floor(Math.random() * 40) - 20;

    let sign;
    let res;
    switch (Math.floor(Math.random() * 3)) {
        case 0:
            res = firstNum * secondNum;
            res += Math.floor(Math.random() * 80) - 40;
            sign = "*";
            break;
        case 1:
            res = firstNum + secondNum;
            sign = "+";
            break;
        case 2:
            res = firstNum - secondNum;
            sign = "-";
            break;
    }
    let correct = res;
    while (res == correct)
        res += Math.floor(Math.random() * 20) - 10;

    let firstStrg = firstNum.toString();
    let secondStrg = secondNum.toString();
    if (secondStrg.includes("-"))
        secondStrg = `(${secondStrg})`;

    let tweet = `${firstStrg} ${sign} ${secondStrg} = ${res}`;
    console.log("Tweeting " + tweet);
    twit.post("statuses/update", {
        status: tweet
    }, function (err, _data, _response) {
        if (err)
            console.error(err);
    });
}
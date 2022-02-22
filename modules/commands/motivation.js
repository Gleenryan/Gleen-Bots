const fetch = require("node-fetch")

module.exports = {
    name: 'motivation',
    aliases: ["motivate", "motivation", "motivasi"],
    execute(msg) {
        getQuote().then(quote => msg.reply(quote))

    }
}




function getQuote() {
    return fetch("https://zenquotes.io/api/random")
        .then(res => {
            return res.json()
        })
        .then(data => {
            return data[0]["q"] + " -" + data[0]["a"]
        })
}




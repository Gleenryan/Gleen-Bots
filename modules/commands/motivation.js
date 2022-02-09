const fetch = require("node-fetch")

module.exports = {
    name: 'motivation',
    execute(msg, args) {
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




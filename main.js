const request = require('request')
const express = require('express')
const app = express()
const args = process.argv.slice(2)
const replaced_host = args[0] || 'fonts.gstatic.com'
const port = args[1] || 3000

app.get('/css', function (req, res) {
    const url = "https://fonts.googleapis.com" + req.originalUrl

    request.get({
        url: url,
        headers: {
            'User-Agent': req.headers['user-agent'],
        }
    },
    function (error, response, body) {
        if (error) {
            return res.status(400).send('Bad Request');
        }

        res.set({
            'content-type': 'text/css; charset=utf-8'
        })
        res.send(response.body.replace(new RegExp('fonts.gstatic.com', 'g'), replaced_host))
    });
})

app.disable('x-powered-by');
app.listen(port, function () {
  console.log('Google Fonts Resolver is listening on port ' + port + ' !')
})
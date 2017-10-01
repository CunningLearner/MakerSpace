'use strict';

const express = require('express');
const bodyParser = require('body-parser');


var mqtt = require('mqtt')
var fs = require('fs');

var client = mqtt.connect('mqtt://www.mosquitto.org', {username:'himanshu', password:'starks123'});


client.subscribe('apiai/Smartbin/status')
// client.subscribe('apiai/Smartbin/open')

client.on('message', function (topic, message) {
  // message is Buffer 
  if (topic == 'apiai/Smartbin/status') {
  var status_read = message.toString()
  console.log(message.toString())
  fs.writeFile("status", status_read, function(err) {
    if(err) {
        return console.log(err);
    }
//console.log("The file was saved!");
});
}

})

const restService = express();
restService.use(bodyParser.json());

restService.post('/hookbin', function (req, res) {

    console.log('hook request');

    try {
        var speech = 'empty speech';

        if (req.body) {
            var requestBody = req.body;

            if (requestBody.result) {
                speech = '';

                if (requestBody.result.fulfillment) {
                    speech += requestBody.result.fulfillment.speech;
                    speech += ' ';
                }

                if (requestBody.result.action) {
                    speech += 'action: ' + requestBody.result.action;
                }
            }
        }

        console.log('result: ', speech);
		client.publish('apiai/Smartbin/ireading', speech)
		//console.log("rest in peace")
		fs.readFile('status','utf8', function(err, contents) {
					console.log("The content of the file"+contents);
//});
		var sread = contents
        return res.json({
            speech: speech,
            displayText:sread,
            source: 'apiai-webhook-IOTecosystem'
        });
        });
    } catch (err) {
        console.error("Can't process request", err);

        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});

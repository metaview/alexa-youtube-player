'use strict';

const http = require('http');
const https = require('https');
var Alexa = require('alexa-sdk');

// App-ID. TODO: set to your own Skill App ID from the developer portal.
const appId = '';

//  DynamoDB Table name
const dynamoDBTableName = 'LongFormAudioSample';

var audioData = [];

const query_url_start = 'https://www.youtube.com/results?search_query=';
const mp3_url_start = 'https://www.youtubeinmp3.com/fetch/?format=JSON&video=https://www.youtube.com';

const languageStrings = {
    'en-GB': {
        translation: {
            SKILL_NAME: "Henk's youtube player",
            WELCOME_MESSAGE: "Ready",
            HELP_MESSAGE: "Welcome to Henk's Youtube Player. I try to play the sound of each youtube video which you request. Just say START and the name of the video.",
            UNHANDLED_MESSAGE: "Sorry, I couldn't understand you. Just say START and the name of the video.",
            ERROR_MESSAGE: 'No data received. Please try later again.',
            ERROR_MESSAGE_2: 'There is a problem with you question. Try another video.',
            STOP_MESSAGE: 'Goodbye!',
        },
    },
    'en-US': {
        translation: {
            SKILL_NAME: "Henk's youtube player",
            WELCOME_MESSAGE: "Ready",
            HELP_MESSAGE: "Welcome to Henk's Youtube Player. I try to play the sound of each youtube video which you request. Just say START and the name of the video.",
            UNHANDLED_MESSAGE: "Sorry, I couldn't understand you. Just say START and the name of the video.",
            ERROR_MESSAGE: 'No data received. Please try later again.',
            ERROR_MESSAGE_2: 'There is a problem with you question. Try another video.',
            STOP_MESSAGE: 'Goodbye!',
        },
    },
    'de-DE': {
        translation: {
            SKILL_NAME: "Henk's YouTube Player",
            WELCOME_MESSAGE: "Bereit",
            HELP_MESSAGE: "Willkommen zu Henk's Youtube Player. Ich versuche den Ton jedes YouTube Videos abzuspielen, das Du mir nennst. Sage einfach STARTE und dann den Namen des Videos.",
            UNHANDLED_MESSAGE: "Entschuldigung, ich konnte Dich nicht verstehen. Sage einfach STARTE und dann den Namen des Videos.",
            ERROR_MESSAGE: 'Ich konnte keine Daten ermitteln. Bitte versuche es später noch einmal.',
            ERROR_MESSAGE_2: 'Es gab ein Problem mit der Anfrage. Probiere ein anderes Video.',
            STOP_MESSAGE: 'Auf Wiedersehen!',
        },
    },
};


const handlers = {
    'LaunchRequest' : function () {
        console.log('LaunchRequest');
        var message = this.t('WELCOME_MESSAGE');
        this.response.speak(message).listen(message);
        this.emit(':responseReady');
    },
    'PlayAudio' : function () {
        console.log('PlayAudio');
		const itemSlot = this.event.request.intent.slots.Name;
		if (itemSlot && itemSlot.value) {
		    console.log("Lied: " + itemSlot.value);
			var that = this;
			var query_url = query_url_start + encodeURI(itemSlot.value).replace(/\s/g, "+");
			console.log(query_url);
			https.get(query_url, (res) => {
				console.log('statusCode:', res.statusCode);
				console.log('headers:', res.headers);

				res.setEncoding('utf8');
				let rawData = '';
				res.on('data', (d) => {
					rawData += d;
				});
				res.on('end', () => {
					var d = rawData.toString();
					//process.stdout.write(d);
					var r = d.match(/href\s*=\s*\"\/watch\?v=\S+\"/);
					if (r && (r.length > 0)) {
						var s = r[0];
						console.log(s);
						var start = s.indexOf('"');
						s = s.substr(start+1);
						var end = s.indexOf('"');
						s = s.substr(0, end);
						console.log(s);
						var mp3_url = mp3_url_start + s;
						getmp3(that, itemSlot.value, mp3_url);
					}
				});

			}).on('error', (e) => {
				console.error(e);
                var message = that.t('ERROR_MESSAGE');
                that.response.speak(message).listen(message);
                that.emit(':responseReady');
			});
		} else {
            var message = this.t('UNHANDLED_MESSAGE');
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
		}
    },
    'AMAZON.NextIntent' : function () { controller.playNext.call(this) },
    'AMAZON.PreviousIntent' : function () { controller.playPrevious.call(this) },
    'AMAZON.PauseIntent' : function () { controller.stop.call(this) },
    'AMAZON.ResumeIntent' : function () { controller.play.call(this) },
    'AMAZON.LoopOnIntent' : function () { controller.loopOn.call(this) },
    'AMAZON.LoopOffIntent' : function () { controller.loopOff.call(this) },
    'AMAZON.ShuffleOnIntent' : function () { controller.shuffleOn.call(this) },
    'AMAZON.ShuffleOffIntent' : function () { controller.shuffleOff.call(this) },
    'AMAZON.StartOverIntent' : function () { controller.startOver.call(this) },
    'AMAZON.HelpIntent' : function () {
        var message = this.t('HELP_MESSAGE');
        this.response.speak(message).listen(message);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent' : function () {
        var message = this.t('STOP_MESSAGE');
        this.response.speak(message);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent' : function () {
        var message = this.t('STOP_MESSAGE');
        this.response.speak(message);
        this.emit(':responseReady');
    },
    'SessionEndedRequest' : function () {
        // No session ended logic
    },
    'Unhandled' : function () {
        var message = this.t('UNHANDLED_MESSAGE');
        this.response.speak(message).listen(message);
        this.emit(':responseReady');
        console.log(this.event);
    },
    'LaunchRequest_PLAY_MODE' : function () {
        console.log('LaunchRequest_PLAY_MODE');
        var message = this.t('WELCOME_MESSAGE');
        this.response.speak(message).listen(message);
        this.emit(':responseReady');
    },
    'PlayAudio_PLAY_MODE' : function () {
        console.log('PlayAudio_PLAY_MODE');
		const itemSlot = this.event.request.intent.slots.Name;
		if (itemSlot && itemSlot.value) {
		    console.log("Lied: " + itemSlot.value);
			var that = this;
			var query_url = query_url_start + encodeURI(itemSlot.value).replace(/\s/g, "+");
			console.log(query_url);
			https.get(query_url, (res) => {
				console.log('statusCode:', res.statusCode);
				console.log('headers:', res.headers);

				res.setEncoding('utf8');
				let rawData = '';
				res.on('data', (d) => {
					rawData += d;
				});
				res.on('end', () => {
					var d = rawData.toString();
					//process.stdout.write(d);
					var r = d.match(/href\s*=\s*\"\/watch\?v=\S+\"/);
					if (r && (r.length > 0)) {
						var s = r[0];
						console.log(s);
						var start = s.indexOf('"');
						s = s.substr(start+1);
						var end = s.indexOf('"');
						s = s.substr(0, end);
						console.log(s);
						var mp3_url = mp3_url_start + s;
						getmp3(that, itemSlot.value, mp3_url);
					}
				});

			}).on('error', (e) => {
				console.error(e);
                var message = that.t('ERROR_MESSAGE');
                that.response.speak(message).listen(message);
                that.emit(':responseReady');
			});
		} else {
            var message = this.t('UNHANDLED_MESSAGE');
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
		}
    },
    'AMAZON.NextIntent_PLAY_MODE' : function () { controller.playNext.call(this) },
    'AMAZON.PreviousIntent_PLAY_MODE' : function () { controller.playPrevious.call(this) },
    'AMAZON.PauseIntent_PLAY_MODE' : function () { controller.stop.call(this) },
    'AMAZON.ResumeIntent_PLAY_MODE' : function () { controller.play.call(this) },
    'AMAZON.LoopOnIntent_PLAY_MODE' : function () { controller.loopOn.call(this) },
    'AMAZON.LoopOffIntent_PLAY_MODE' : function () { controller.loopOff.call(this) },
    'AMAZON.ShuffleOnIntent_PLAY_MODE' : function () { controller.shuffleOn.call(this) },
    'AMAZON.ShuffleOffIntent_PLAY_MODE' : function () { controller.shuffleOff.call(this) },
    'AMAZON.StartOverIntent_PLAY_MODE' : function () { controller.startOver.call(this) },
    'AMAZON.HelpIntent_PLAY_MODE' : function () {
        var message = this.t('HELP_MESSAGE');
        this.response.speak(message).listen(message);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent_PLAY_MODE' : function () {
        var message = this.t('STOP_MESSAGE');
        this.response.speak(message);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent_PLAY_MODE' : function () {
        var message = this.t('STOP_MESSAGE');
        this.response.speak(message);
        this.emit(':responseReady');
    },
    'Unhandled_PLAY_MODE' : function () {
        var message = this.t('UNHANDLED_MESSAGE');
        this.response.speak(message).listen(message);
        this.emit(':responseReady');
        console.log(this.event);
    },
    /*
     *  All Requests are received using a Remote Control. Calling corresponding handlers for each of them.
     */
    'PlayCommandIssued' : function () { controller.play.call(this) },
    'PauseCommandIssued' : function () { controller.stop.call(this) },
    'NextCommandIssued' : function () { controller.playNext.call(this) },
    'PreviousCommandIssued' : function () { controller.playPrevious.call(this) },
    /*
     *  AudioPlayer events.
     */
    'PlaybackStarted' : function () {
        /*
         * AudioPlayer.PlaybackStarted Directive received.
         * Confirming that requested audio file began playing.
         * Storing details in dynamoDB using attributes.
         */
        this.attributes['token'] = getToken.call(this);
        this.attributes['index'] = getIndex.call(this);
        this.attributes['playbackFinished'] = false;
        this.emit(':saveState', true);
    },
    'PlaybackFinished' : function () {
        /*
         * AudioPlayer.PlaybackFinished Directive received.
         * Confirming that audio file completed playing.
         * Storing details in dynamoDB using attributes.
         */
        this.attributes['playbackFinished'] = true;
        this.attributes['enqueuedToken'] = false;
        this.emit(':saveState', true);
    },
    'PlaybackStopped' : function () {
        /*
         * AudioPlayer.PlaybackStopped Directive received.
         * Confirming that audio file stopped playing.
         * Storing details in dynamoDB using attributes.
         */
        this.attributes['token'] = getToken.call(this);
        this.attributes['index'] = getIndex.call(this);
        this.attributes['offsetInMilliseconds'] = getOffsetInMilliseconds.call(this);
        this.emit(':saveState', true);
    },
    'PlaybackNearlyFinished' : function () {
        /*
         * AudioPlayer.PlaybackNearlyFinished Directive received.
         * Using this opportunity to enqueue the next audio
         * Storing details in dynamoDB using attributes.
         * Enqueuing the next audio file.
         */
        if (this.attributes['enqueuedToken']) {
            /*
             * Since AudioPlayer.PlaybackNearlyFinished Directive are prone to be delivered multiple times during the
             * same audio being played.
             * If an audio file is already enqueued, exit without enqueuing again.
             */
            return this.context.succeed(true);
        }
        
        var enqueueIndex = this.attributes['index'];
        enqueueIndex +=1;
        // Checking if  there are any items to be enqueued.
        if (enqueueIndex === audioData.length) {
            if (this.attributes['loop']) {
                // Enqueueing the first item since looping is enabled.
                enqueueIndex = 0;
            } else {
                // Nothing to enqueue since reached end of the list and looping is disabled.
                return this.context.succeed(true);
            }
        }
        // Setting attributes to indicate item is enqueued.
        this.attributes['enqueuedToken'] = String(this.attributes['playOrder'][enqueueIndex]);

        var enqueueToken = this.attributes['enqueuedToken'];
        var playBehavior = 'ENQUEUE';
        var podcast = audioData[this.attributes['playOrder'][enqueueIndex]];
        var expectedPreviousToken = this.attributes['token'];
        var offsetInMilliseconds = 0;
        
        this.response.audioPlayerPlay(playBehavior, podcast.url, enqueueToken, expectedPreviousToken, offsetInMilliseconds);
        this.emit(':responseReady');
    },
    'PlaybackFailed' : function () {
        //  AudioPlayer.PlaybackNearlyFinished Directive received. Logging the error.
        console.log("Playback Failed : %j", this.event.request.error);
        this.context.succeed(true);
    }
};

var controller = function () {
    return {
        play: function () {
            if (audioData && (audioData.length > 0)) {
                /*
                 *  Using the function to begin playing audio when:
                 *      Play Audio intent invoked.
                 *      Resuming audio when stopped/paused.
                 *      Next/Previous commands issued.
                 */
                if (this.attributes['playbackFinished']) {
                    // Reset to top of the playlist when reached end.
                    this.attributes['index'] = 0;
                    this.attributes['offsetInMilliseconds'] = 0;
                    this.attributes['playbackIndexChanged'] = true;
                    this.attributes['playbackFinished'] = false;
                }
    
                var token = String(this.attributes['playOrder'][this.attributes['index']]);
                var playBehavior = 'REPLACE_ALL';
                var podcast = audioData[this.attributes['playOrder'][this.attributes['index']]];
                var offsetInMilliseconds = this.attributes['offsetInMilliseconds'];
                // Since play behavior is REPLACE_ALL, enqueuedToken attribute need to be set to null.
                this.attributes['enqueuedToken'] = null;
    
                if (canThrowCard.call(this)) {
                    var cardTitle = 'Playing ' + podcast.title;
                    var cardContent = 'Playing ' + podcast.title;
                    this.response.cardRenderer(cardTitle, cardContent, null);
                }
    
                this.response.audioPlayerPlay(playBehavior, podcast.url, token, null, offsetInMilliseconds);
                this.emit(':responseReady');
            }
        },
        stop: function () {
            /*
             *  Issuing AudioPlayer.Stop directive to stop the audio.
             *  Attributes already stored when AudioPlayer.Stopped request received.
             */
            this.response.audioPlayerStop();
            this.emit(':responseReady');
        },
        playNext: function () {
            /*
             *  Called when AMAZON.NextIntent or PlaybackController.NextCommandIssued is invoked.
             *  Index is computed using token stored when AudioPlayer.PlaybackStopped command is received.
             *  If reached at the end of the playlist, choose behavior based on "loop" flag.
             */
            var index = this.attributes['index'];
            index += 1;
            // Check for last audio file.
            if (index === audioData.length) {
                if (this.attributes['loop']) {
                    index = 0;
                } else {
                    // Reached at the end. Thus reset state to start mode and stop playing.
                    var message = 'You have reached at the end of the playlist.';
                    this.response.speak(message).audioPlayerStop();
                    return this.emit(':responseReady');
                }
            }
            // Set values to attributes.
            this.attributes['index'] = index;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['playbackIndexChanged'] = true;

            controller.play.call(this);
        },
        playPrevious: function () {
            /*
             *  Called when AMAZON.PreviousIntent or PlaybackController.PreviousCommandIssued is invoked.
             *  Index is computed using token stored when AudioPlayer.PlaybackStopped command is received.
             *  If reached at the end of the playlist, choose behavior based on "loop" flag.
             */
            var index = this.attributes['index'];
            index -= 1;
            // Check for last audio file.
            if (index === -1) {
                if (this.attributes['loop']) {
                    index = audioData.length - 1;
                } else {
                    // Reached at the end. Thus reset state to start mode and stop playing.
                    var message = 'You have reached at the start of the playlist.';
                    this.response.speak(message).audioPlayerStop();
                    return this.emit(':responseReady');
                }
            }
            // Set values to attributes.
            this.attributes['index'] = index;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['playbackIndexChanged'] = true;

            controller.play.call(this);
        },
        loopOn: function () {
            // Turn on loop play.
            this.attributes['loop'] = true;
            var message = 'Loop turned on.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        loopOff: function () {
            // Turn off looping
            this.attributes['loop'] = false;
            var message = 'Loop turned off.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        shuffleOn: function () {
            // Turn on shuffle play.
            this.attributes['shuffle'] = true;
            shuffleOrder((newOrder) => {
                // Play order have been shuffled. Re-initializing indices and playing first song in shuffled order.
                this.attributes['playOrder'] = newOrder;
                this.attributes['index'] = 0;
                this.attributes['offsetInMilliseconds'] = 0;
                this.attributes['playbackIndexChanged'] = true;
                controller.play.call(this);
            });
        },
        shuffleOff: function () {
            // Turn off shuffle play. 
            if (this.attributes['shuffle']) {
                this.attributes['shuffle'] = false;
                // Although changing index, no change in audio file being played as the change is to account for reordering playOrder
                this.attributes['index'] = this.attributes['playOrder'][this.attributes['index']];
                this.attributes['playOrder'] = Array.apply(null, {length: audioData.length}).map(Number.call, Number);
            }
            controller.play.call(this);
        },
        startOver: function () {
            // Start over the current audio file.
            this.attributes['offsetInMilliseconds'] = 0;
            controller.play.call(this);
        },
        reset: function () {
            // Reset to top of the playlist.
            this.attributes['index'] = 0;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['playbackIndexChanged'] = true;
            controller.play.call(this);
        }
    }
}();

function canThrowCard() {
    /*
     * To determine when can a card should be inserted in the response.
     * In response to a PlaybackController Request (remote control events) we cannot issue a card,
     * Thus adding restriction of request type being "IntentRequest".
     */
    if (this.event.request.type === 'IntentRequest' && this.attributes['playbackIndexChanged']) {
        this.attributes['playbackIndexChanged'] = false;
        return true;
    } else {
        return false;
    }
}

function shuffleOrder(callback) {
    // Algorithm : Fisher-Yates shuffle
    var array = Array.apply(null, {length: audioData.length}).map(Number.call, Number);
    var currentIndex = array.length;
    var temp, randomIndex;

    while (currentIndex >= 1) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
    }
    callback(array);
}

function getmp3(that, title, mp3_url) {
    console.log(mp3_url);
	https.get(mp3_url, (res) => {
		console.log('statusCode:', res.statusCode);
		console.log('headers:', res.headers);
		if (res.statusCode == 200) {
			res.setEncoding('utf8');
			let rawData = '';
			res.on('data', (d) => {
				rawData += d;
			});
			res.on('end', () => {
			    var html = rawData.toString();
			    if (html.indexOf('{"title"') === 0) {
    			    var obj = JSON.parse(html);
    			    title = obj.title;
    			    mp3_url = obj.link;

/*
        			mp3_url = res.headers['location'];
        			if (mp3_url.substr(0, 1) == "/") {
        				mp3_url = "https:" + mp3_url;
        			}
*/
                    console.log(mp3_url);
        			https.get(mp3_url, (res) => {
        				console.log('> statusCode:', res.statusCode);
        				console.log('> headers:', res.headers);
        				if (res.statusCode == 302) {
        
        					mp3_url = res.headers['location'];
        					if (mp3_url.substr(0, 1) == "/") {
        						mp3_url = "https:" + mp3_url;
        					}
        
                            console.log(mp3_url);
        					https.get(mp3_url, (res) => {
        						console.log('>> statusCode:', res.statusCode);
        						console.log('>> headers:', res.headers);
        						if (res.headers['content-type'] == 'audio/mpeg') {
        							console.log('mp3 found');
                        			playmp3(that, title, mp3_url);
                				} else {
                                    var message = that.t('ERROR_MESSAGE_2');
                                    that.response.speak(message).listen(message);
                                    that.emit(':responseReady');
                				}
        					}).on('error', (e) => {
        						console.error(e);
        					});
                		} else if (res.headers['content-type'] == 'audio/mpeg') {
                			console.log('mp3 found');
                			playmp3(that, title, mp3_url);
                		} else {
                            var message = that.t('ERROR_MESSAGE_2');
                            that.response.speak(message).listen(message);
                            that.emit(':responseReady');
                		}
        			}).on('error', (e) => {
        				console.error(e);
        			});
			    } else {
                    var message = that.t('ERROR_MESSAGE_2');
                    that.response.speak(message).listen(message);
                    that.emit(':responseReady');
			    }
			});
		} else if (res.headers['content-type'] == 'audio/mpeg') {
			console.log('mp3 found');
			playmp3(that, title, mp3_url);
		} else {
            var message = that.t('ERROR_MESSAGE_2');
            that.response.speak(message).listen(message);
            that.emit(':responseReady');
		}
	}).on('error', (e) => {
		console.error(e);
	});
}

function playmp3(that, title, mp3_url) {
    that.response.speak(title);
    //that.emit(':responseReady');
	audioData = [{'title' : title, 'url' : mp3_url}];
	// Initialize Attributes
	that.attributes['playOrder'] = Array.apply(null, {length: audioData.length}).map(Number.call, Number);
	that.attributes['index'] = 0;
	that.attributes['offsetInMilliseconds'] = 0;
	that.attributes['loop'] = true;
	that.attributes['shuffle'] = false;
	that.attributes['playbackIndexChanged'] = true;

    controller.play.call(that);
}

function getToken() {
    // Extracting token received in the request.
    return this.event.request.token;
}

function getIndex() {
    // Extracting index from the token received in the request.
    var tokenValue = parseInt(this.event.request.token);
    return this.attributes['playOrder'].indexOf(tokenValue);
}

function getOffsetInMilliseconds() {
    // Extracting offsetInMilliseconds received in the request.
    return this.event.request.offsetInMilliseconds;
}

exports.handler = function(event, context, callback) {
    console.log("huhu");
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    alexa.dynamoDBTableName = dynamoDBTableName;
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

Mockingjay
===========

Built off of <a href="https://github.com/abelsonlive/regextweet" target="_blank">RegEx Tweet</a>, a Twitter API 1.1 script to make a Twitter bot that retweets tweets that contain words in a RegEx. 

# Installation

````
npm install mockingjay
````

# Usage

````
var mockingjay = require('mockingjay');

var opts = {
	credentials: 'path/to/twitter_credentials.json',
	list_owner: "cspan",
	list_name: "members-of-congress",
	count: 200,
	regex: "(Obamacare|Obama)"
}
````


Your `credentials.json` should look like this dummy object:

````
{
  "consumer_key":         "sWev6Ji3ow9cas0e7gru0UtgeZ9Bi7wrOp4n",
  "consumer_secret":      "ceJ8yef4phOm1haPp5Ik5onAc2wy8Heew8cAk0zaJ0F",
  "access_token":         "nap8lue7hOv7Gick3yEeg5Veg6oi3tWowd1eb0cuEf7We",
  "access_token_secret":  "Uv5cuv0Maj5MikNeaf0arSh3Ef2Hyel9ij5runch5An"
}
````

#### TODO

  1. Change it so it doesn't filter tweets date, but rather takes advantage of the ``since_id`` param under ``lists/statuses`` in the <a href="https://dev.twitter.com/docs/api/1.1/get/lists/statuses" target="_blank">Twitter documentation</a>.

  2. Allow for retweeting of tweets that are retweets.
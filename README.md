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
	list_owner: "cspan",
	list_name: "members-of-congress",
	count: 200,
	regex: "(Obamacare|Obama)",
  credentials = {
    consumer_key:         ...,
    consumer_secret:      ...,
    access_token:         ...,
    access_token_secret:  ...
  }
}

mockingjay.retweet(opts)
````


#### TODO

  1. Change it so it doesn't filter tweets date, but rather takes advantage of the ``since_id`` param under ``lists/statuses`` in the <a href="https://dev.twitter.com/docs/api/1.1/get/lists/statuses" target="_blank">Twitter documentation</a>.

  2. Allow for retweeting of tweets that are retweets.

  3. Add callback
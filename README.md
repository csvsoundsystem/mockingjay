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

mockingjay.retweet(opts, function(err, result){
  if (!err){
    console.log(result)
    /*{
      "status": true,
      "new_since": 20,
      "matching_since": 5
    }*/
  }else{
    console.log(err)
  }
})
````

`result` returns an object. If `status` is true, it found new matching tweets and reteweeted them without error. `new_since` are the number of new tweets in that list since last it checked. `matching_since` is the number of new and matching tweets since last it checked.


#### TODO

  1. Change it so it doesn't filter tweets date, but rather takes advantage of the ``since_id`` param under ``lists/statuses`` in the <a href="https://dev.twitter.com/docs/api/1.1/get/lists/statuses" target="_blank">Twitter documentation</a>.

  2. Allow for retweeting of tweets that are retweets.

  3. Add callback
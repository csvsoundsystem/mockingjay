# RegEx Tweet for Node

Built off of <a href="https://github.com/abelsonlive/regextweet" target="_blank">RegEx Tweet</a>, a Twitter API 1.1 script to make a Twitter bot that retweets tweets that contain words in a RegEx. 

This currently runs off of <a href="https://github.com/mhkeller/twit" target="_blank">a fork of the Twit for Node library</a> that is not currently on npm. The original Twit library does not support retweets. <a href="https://github.com/ttezel/twit/pull/47" target="_blank">A pull request</a> is pending.

#### TODO
	1. Change it so it doesn't filter tweets date, but rather takes advantage of the ``since_id`` param under ``lists/statuses`` in the <a href="https://dev.twitter.com/docs/api/1.1/get/lists/statuses" target="_blank">Twitter documentation</a>.



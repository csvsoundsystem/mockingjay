Mockingjay
===========

A Twitter API 1.1 script to make a Twitter bot that retweets tweets that contain words in a RegEx. First iteration: <a href="https://github.com/abelsonlive/regextweet" target="_blank">RegEx Tweet</a>.

It currently powers [@YourRepsOnGuns](http://twitter.com/yourrepsonguns), retweeting members of congress when they tweet about firearms and related words. Check out [that implementation](https://github.com/csvsoundsystem/yourrepsonguns/blob/master/yourrepsonguns.js) for a more advanced example.

We originally made this project when we were working at The Daily Beast and compiling every member of congress's stance on gun control for [This Is Your Rep On Guns](http://thedailybeast.thisisyourreponguns.com). Read more about that project and the origins of this bot [here](http://newsbeastlabs.tumblr.com/post/41373060897/update-feb-10-repsguntweets-has-been-changed-to).

# Installation

If you already have [NodeJS](http://nodejs.org/) installed run the following in a new project folder:
````
npm install mockingjay
````

You can install Node with [Homebrew](brew.sh) if you're on a mac or [their website](http://nodejs.org/) has double-click installers.

# Usage

This example includes the optional inclusion of a `bot_name` see below for when you want to include that. Otherwise, you can leave it blank or omit it entirely.

Make a file like the one below called `index.js` and place it in the new project folder where you ran `npm intall mockingjay`. To run this file once, do `node index.js` from within that project folder. This is good for testing to make sure it's working.

````js
var mockingjay = require('mockingjay');

var opts = {
  list_owner: "cspan",
  list_name: "members-of-congress",
  count: 200,
  regex: "(Obamacare|Obama)",
  credentials: {
    consumer_key:         ...,
    consumer_secret:      ...,
    access_token:         ...,
    access_token_secret:  ...
  },
  bot_name: "obamacare-bot"
};

mockingjay.retweet(opts, function(err, result){
  if (!err){
    console.log(result)
    /*{
      "retweeted_matches": true,
      "since_last": 20,
      "matching": 5
    }*/
  }else{
    console.log(err)
  }
});
````

### Options

If you have multiple instances of Mockingjay running on the same machine, you'll want to include a `bot_name` in the config file. Mockingjay only checks new tweets since the last time it ran. It does this by saving the id of the most latest tweet in a file at `src/last-ids/<bot-name>-last-id.json`. Specifying a name will make sure that your script will only check for the last time it ran as opposed to the last time some other script ran.

### Crontab

This package is meant to be run on a cron. Here's an example setup that runs every ten minutes on the 1s. To add this to your contrab, run `crontab -e`. It will most likely default to a vim editor so hit <kbd>i</kbd> to turn on insert mode and start typing. When done, press <kbd>esc</kbd> then type `:x` and hit <kbd>return</kbd>. It should say that your new crontab has been saved.

````
1,11,21,31,41,51 * * * * /usr/bin/node /home/ubuntu/tasks/botname/index.js
````

This command is the same as what we ran above as `node index.js` except we're giving full paths to our node executable and to our file. To find out where your node is installed, type `which node`. To get the full path to your index.js file, in your project folder type `pwd` to get teh full path to the working directory.

### Tweets that are retweets

If someone in your list *retweeted* a tweet that matches your criteria, e.g. you're following senators using the word "gun" and a senator retweets an NRA tweet about "guns", then Mockingjay will send out a tweet that looks like this:

````
.@<person-on-your-tracking-list> retweeted @<person-they-retweeted>: <url-of-original-tweet>
````

If a Mockingjay bot were retweeting @csvsoundsystem whenever they mentioned "big data", which someone should make by the way, it would look like this:

````
@csvsoundsystem retweeted @lifewinning: https://twitter.com/lifewinning/status/445688842721705985 
````

### Callback

`result` returns an object. If `retweeted_matches` is true, it found new matching tweets and retweeted them without error. If everything went well but it didn't find any matches, `status` is `false`. `since_last` are the number of new tweets in that list since last it checked. `matching` is the number of new and matching tweets since last it checked.

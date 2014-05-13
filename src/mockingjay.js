var fs             = require('fs'),
    Tw             = require('twit'),
		_              = require('underscore'),
		__             = require('../libs/underscore.ratelimit.js'),
		verbose        = true;

var T,
		regex,
		last_id_file_name,
		last_id_str,
		status = {};

function reportStatus(msg){
	if (verbose){
		console.log(msg)
	}
}

function isRetweet(tweet_id, tweet_dict){
	var tweet = tweet_dict[tweet_id];
	// if it has data for the `retweeted_status` key, then it's a retweet
	if (tweet['retweeted_status']) return true;
	return false;
}

function constructOldStyleRetweet(tweet_data){
	// If the tweet is a retweet, we want to give it an old style retweet
	// So we have to grab the retweeted tweet's txt and prepend it with `<username-of-person-who-retweeted> RT: <text-of-original-tweet>`
	// Unfortunatly tweets that are longer than 140 characters will have to be truncated. That is the boundary and the price of immortality.
	var retweeter_username = tweet_data.user.screen_name,
			retweeted_text     = tweet_data.text,
			combination_retweeted_tweet_text = '.@' + retweeter_username  + ' ' + retweeted_text;
	
	if (combination_retweeted_tweet_text.length > 140) return combination_retweeted_tweet_text.substring(0,137) + '...';
	return combination_retweeted_tweet_text
}

function retweetID(tweet_id, tweet_dict, cb){
	var is_retweet = isRetweet(tweet_id, tweet_dict),
			tweet_type,
			tweet_info,
			status;

	if (!is_retweet){
		tweet_type = 'statuses/retweet/:id';
		tweet_info = {id: tweet_id, trim_user: true};
	}else{
		// Retweet tweets that are retweets as old style retweets, obvs.
		status = constructOldStyleRetweet(tweet_dict[tweet_id]);
		tweet_type = 'statuses/update';
		tweet_info = {status: status};
	}

	T.post(tweet_type, tweet_info, function(err, replies) {
  	var this_moment = new Date();
	  if(err){
	    reportStatus('Retweet status:', this_moment, err);
	    cb(err, status)
	  }else{
	  	reportStatus('Successful retweet', this_moment, tweet_id)
	  	cb(null, status)
	  };
	});
}

function retweetIDs(arr, tweet_dict, cb){
	var retweetID_rateLimited = _.rateLimit(retweetID, 500); // Limit the speed of retweets to one every 500ms
	if (arr.length){
		status.retweeted_matches = true;
		arr.forEach(function(tweet_id){
			retweetID_rateLimited(tweet_id, tweet_dict, cb);
		});
	}else{
		status.retweeted_matches = false;
		cb(null, status);
	}
};

function recordId(arr, file_name){
	// If there any new tweets
	if (arr.length){
		var most_recent_tweet  = arr[0], // It looks like the first tweet is always the most recent, unclear how this handles retweets.
				last_id_json       = { last_id: most_recent_tweet.id, last_id_str: most_recent_tweet.id_str }; // Grab both the id and the id as a string. We only use `id_str` but the id is useful for sanity check purposes since you can use that in the URL bar.

		fs.writeFile(file_name, JSON.stringify( last_id_json ), function(err) {
		    if(err) {
		        cb(err)
		    } else {
		        reportStatus("Id saved!");
		    };
		}); 
	}
};

function filterListByRegexIntoDict(arr, regx, key){
	var filtered_dict = {};
	arr.forEach(function(row){
		var tweet_text = row.text.toLowerCase()
		var matches_regex = regx.test(tweet_text);
		if(matches_regex){
			filtered_dict[row[key]] = row;
		};
	});
	reportMatches(arr, filtered_dict);
	return filtered_dict;
};

function reportMatches(since, matches){
	status.since_last = since.length;
	status.matching   = _.size(matches);
	reportStatus('Since last: ' + status.since_last);
	reportStatus('Matching regex: ' + status.matching);
}

function matchAndRetweet(arr, cb){
	// Grab the tweets that match our regex and turn them into a dictionary with the `id_str` as the key and the full tweet data as the value.
	// This will let us pass around ids but then still have access to the full data if desired.
	var tweets_matching_regex = filterListByRegexIntoDict(arr, regex, 'id_str');
	var tweet_ids_to_retweet  = _.keys(tweets_matching_regex);
	retweetIDs(tweet_ids_to_retweet, tweets_matching_regex, cb);
}

function retrieveListStatuses(list_name, list_owner, last_id, count, cb){
	var tweet_opts = { slug: list_name, 
		owner_screen_name: list_owner, 
		count: count 
	}
	if (last_id) tweet_opts.since_id = last_id;

	T.get('lists/statuses', tweet_opts, function(err, replies) {
	  if(err){
	    cb(err, '');
	  }else{
	    matchAndRetweet(replies, cb);
			recordId(replies, last_id_file_name);
	  };
	});
};

function retrieveListAndRetweet(opts, cb){
	var credentials = opts.credentials,
	    bot_name = (opts.bot_name) ? opts.bot_name + '-' : '';

	T     = new Tw( credentials );
	regex = new RegExp(opts.regex, 'i');

	last_id_file_name = __dirname + '/last-ids/'+bot_name+'last-id.json',
	last_id_str       = fs.existsSync(last_id_file_name) ? JSON.parse( fs.readFileSync(last_id_file_name) ).last_id_str : null,

	retrieveListStatuses(opts.list_name, opts.list_owner, last_id_str, opts.count, cb);
}

module.exports = {
	retweet: retrieveListAndRetweet
}
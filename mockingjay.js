var fs             = require('fs'),
    Tw             = require('twit'),
		_              = require('underscore'),
		__             = require('./libs/underscore.ratelimit.js'),
		verbose        = true;

var T,
		regex,
		last_id_file_name = __dirname + '/last_id.json',
		last_id_str       = fs.existsSync(last_id_file_name) ? JSON.parse( fs.readFileSync(last_id_file_name) ).last_id_str : null,
		status = {};

function reportStatus(msg){
	if (verbose){
		console.log(msg)
	}
}

function retweetID(tweet_id, cb){
	T.post('statuses/retweet/:id', {id: tweet_id, trim_user: true}, function(err, replies) {
  	var this_moment = new Date();
	  if(err){
	    console.log('Retweet status:',this_moment, err);
	    cb(err, status)
	  }else{
	  	console.log('Successful retweet', this_moment, tweet_id)
	  	cb(null, status)
	  };
	});
}

function retweetIDs(arr, cb){
	var retweetID_rateLimited = _.rateLimit(retweetID, 500); // Limit the speed of retweets to one every 500ms
	if (arr.length){
		status.retweeted_matches = true
		_.each(arr, function(tweet_id){
			retweetID_rateLimited(tweet_id, cb);
		});
	}else{
		status.retweeted_matches = false;
		cb(null, status)
	}
};

function extractValuesFromJSON(arr, key){
	var key_list = [];
	_.each(arr, function(row){
		key_list.push(row[key]);
	});
	return key_list
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
		        console.log("Id saved!");
		    };
		}); 
	}
};

function filterListByRegex(arr, regx){
	var filtered_list = [];
	_.each(arr, function(row){
		var tweet_text = row.text.toLowerCase()
		var matches_regex = regx.test(tweet_text);
		if(matches_regex){
			filtered_list.push(row)
		};
	});
	reportMatches(arr, filtered_list)
	return filtered_list
};

function reportMatches(since, matches){
	status.since_last = since.length;
	status.matching   = matches.length;
	reportStatus('Since last: ' + status.since_last);
	reportStatus('Matching regex: ' + status.matching);
}

function matchAndRetweet(arr, cb){
	var tweets_matching_regex = filterListByRegex(arr, regex);
	var tweet_ids_to_retweet  = extractValuesFromJSON(tweets_matching_regex, 'id_str');
	retweetIDs(tweet_ids_to_retweet, cb);
}

function retrieveListStatuses(list_name, list_owner, last_id, count, cb){
	var tweet_opts = { slug: list_name, 
		owner_screen_name: list_owner, 
		count: count 
	}
	if (last_id) tweet_opts.since_id = last_id;

	T.get('lists/statuses', tweet_opts, function(err, replies) {
	  if(err){
	    cb(err, '')
	  }else{
	    matchAndRetweet(replies, cb);
			recordId(replies, last_id_file_name);
	  };
	});
};

function retrieveListAndRetweet(opts, cb){
	var credentials = opts.credentials;
	T     = new Tw( credentials );
	regex = new RegExp(opts.regex);

	retrieveListStatuses(opts.list_name, opts.list_owner, last_id_str, opts.count, cb);
}

module.exports = {
	retweet: retrieveListAndRetweet
}
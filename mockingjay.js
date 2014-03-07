var fs             = require('fs'),
    Tw             = require('twit'),
		_              = require('underscore'),
		__             = require('./libs/underscore.ratelimit.js'),
		verbose        = true;

var T,
		regex,
		last_time_file_name = 'last_successful_time_searched.txt',
		last_time           = fs.existsSync('./' + last_time_file_name) ? fs.readFileSync('./'+ last_time_file_name).toString() : "Sat Jan 01 2000 00:00:00 GMT-0500 (EDT)",
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
		status.status = true
		_.each(arr, function(tweet_id){
			retweetID_rateLimited(tweet_id, cb);
		});
	}else{
		status.status = false;
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

function recordDate(file_name){
	var now = new Date();
	fs.writeFile(file_name, now, function(err) {
	    if(err) {
	        console.log(err);
	        cb(err)
	    } else {
	        console.log("Date saved!");
	    };
	}); 
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
	return filtered_list
};

function filterListByDate(arr, date){
	var filtered_list = [];
	var last_time_unix = new Date(last_time).getTime();
	_.each(arr, function(row){
		tweet_time_unix = new Date(row.created_at).getTime();
		// If the tweet is more recent than the last time the tweet bot ran 
		if (tweet_time_unix > last_time_unix){
			filtered_list.push(row)
		}
	});
	return filtered_list
};

function filterByDateAndRegex(arr){
	var tweets_since_last_time = filterListByDate(arr, last_time);
	var tweets_matching_regex_and_time  = filterListByRegex(arr, regex);

	status.new_since      = tweets_since_last_time.length;
	status.matching_since = tweets_matching_regex_and_time.length;

	reportStatus('Matching time: '         + status.new_since)
	reportStatus('Matching time + regex: ' + status.matching_since);
	return tweets_matching_regex_and_time
};


function matchAndRetweet(arr, cb){
	var tweets_matching_regex_and_time = filterByDateAndRegex(arr);
	var tweet_ids_to_retweet = extractValuesFromJSON(tweets_matching_regex_and_time, 'id_str');
	retweetIDs(tweet_ids_to_retweet, cb);
}

function retrieveListStatuses(list_name, list_owner, count, cb){
	T.get('lists/statuses', { slug: list_name, owner_screen_name: list_owner, count: count }, function(err, replies) {
	  if(err){
	    console.log(err);
	    cb(err)
	  }else{
	    matchAndRetweet(replies, cb);
			recordDate(last_time_file_name);
	  };
	});
};

function retrieveListAndRetweet(opts, cb){
	var credentials = opts.credentials;
	T     = new Tw( credentials );
	regex = new RegExp(opts.regex);

	retrieveListStatuses(opts.list_name, opts.list_owner, opts.count, cb);
}

module.exports = {
	retweet: retrieveListAndRetweet
}
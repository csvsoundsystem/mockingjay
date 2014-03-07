var fs             = require('fs'),
    Tw             = require('twit'),
		_              = require('underscore'),
		__             = require('./libs/underscore.ratelimit.js'),
		verbose        = true;

var T,
		regex,
		last_time_file_name = 'last_successful_time_searched.txt',
		last_time           = fs.existsSync('./' + last_time_file_name) ? fs.readFileSync('./'+ last_time_file_name).toString() : "Sat Jan 01 2000 00:00:00 GMT-0500 (EDT)";

function reportStatus(msg){
	if (verbose){
		console.log(msg)
	}
}
function retweetID(tweet_id){
	T.post('statuses/retweet/:id', {id: tweet_id, trim_user: true}, function(err, replies) {
  	var this_moment = new Date();
	  if(err){
	    console.log('Retweet status:',this_moment, err);
	  }else{
	  	console.log('Successful retweet', this_moment, tweet_id)
	  };
	});
}

function retweetIDs(arr){
	var retweetID_rateLimited = _.rateLimit(retweetID, 500); // Limit the speed of retweets to one every 500ms
	_.each(arr, function(tweet_id){
		retweetID_rateLimited(tweet_id);
	});
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
	reportStatus('Matching time: ' + tweets_since_last_time.length)
	var tweets_matching_regex_and_time  = filterListByRegex(arr, regex);
	reportStatus('Matching time + regex: ' + tweets_matching_regex_and_time.length)
	return tweets_matching_regex_and_time
};


function matchAndRetweet(arr){
	var tweets_matching_regex_and_time = filterByDateAndRegex(arr);
	var tweet_ids_to_retweet = extractValuesFromJSON(tweets_matching_regex_and_time, 'id_str');
	retweetIDs(tweet_ids_to_retweet);
}

function retrieveListStatuses(list_name, list_owner, count){
	T.get('lists/statuses', { slug: list_name, owner_screen_name: list_owner, count: count }, function(err, replies) {
	  if(err){
	    console.log(err);
	  }else{
	    matchAndRetweet(replies);
			// recordDate(last_time_file_name);
	  };
	});
};

function retrieveListAndRetweet(opts){
	var credentials = JSON.parse( fs.readFileSync(opts.credentials) )
	T     = new Tw( credentials );
	regex = new RegExp(opts.regex);

	retrieveListStatuses(opts.list_name, opts.list_owner, opts.count);
}

module.exports = {
	retweet: retrieveListAndRetweet
}
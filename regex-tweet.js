var Tw             = require('twit'),
		fs             = require('fs'),
		_              = require('underscore'),
		__             = require('./libs/underscore.ratelimit.js'),
		Tw_credentials = require('/path/to/twitter/credentials.json'),
		T;

var T                   = new Tw(Tw_credentials),
		last_time_file_name = 'last_successful_time_searched.txt',
		last_time           = fs.readFileSync('last_successful_time_searched.txt').toString(),
		list_owner          = 'cspan',
		list_name           = 'members-of-congress',
		pages               = 200,
		gun_regex           = /(chocolate)/g

function retweetID(tweet_id){
	T.post('statuses/retweet', {id: tweet_id, trim_user: true}, function(err, replies) {
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
		var matches_regex = regx.test(row.text);
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
	var tweets_matching_regex_and_time  = filterListByRegex(arr, gun_regex);
	return tweets_matching_regex_and_time
};


function startTheShow(arr){
	var tweets_matching_regex_and_time = filterByDateAndRegex(arr);
	var tweet_ids_to_retweet = extractValuesFromJSON(tweets_matching_regex_and_time, 'id_str');
	retweetIDs(tweet_ids_to_retweet);
}

function testRetweet(tweet_id){
	T.post('statuses/retweet/'+tweet_id, tweet_id, function(err, replies) {
	  if(err){
	    console.log('Retweet error status:', err);
	  }else{
	  	console.log('Successful retweet', tweet_id)
	  };
	});
}

function retrieveListStatuses(list_name, list_owner, pages){
	T.get('lists/statuses', { slug: list_name, owner_screen_name: list_owner, count: pages }, function(err, replies) {
	  if(err){
	    console.log(err);
	  }else{
	    startTheShow(replies);
			recordDate(last_time_file_name);
	  };
	});
};

retrieveListStatuses(list_name, list_owner, pages);

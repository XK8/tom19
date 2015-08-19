/*
var mongoose    = require('mongoose');

var db           = mongoose.createConnection('mongodb://dbuser:Xd5MA89z@ds035333.mongolab.com:35333/tom19');
var PollsSchema = require('../models/Polls.js').PollsSchema;
var Polls        = db.model('polls', PollsSchema);

*/

exports.index = function(req, res) {
    var mongoose = require('mongoose');
    mongoose.connect('mongodb://dbuser:Xd5MA89z@ds035333.mongolab.com:35333/tom19');

    var Cat = mongoose.model('Cat', { name: String });

    var kitty = new Cat({ name: 'Zildjian' });
    kitty.save(function (err) {
        if (err) console.log('meow1');
    });
};

exports.index2 = function(req, res) {
	res.render('index');
};

exports.list = function(req, res) {
	Polls.find({}, 'question', function(error, polls) {
		res.json(polls);
	});
};

exports.polls = function(req, res) {
	var pollId = req.params.id;

	Polls.findById(pollId, '', { lean: true }, function(err, poll) {
		if(poll) {
			var userVoted = false,
					userChoice,
					totalVotes = 0;

			for(c in Polls.choices) {
				var choice = Polls.choices[c];

				for(v in choice.votes) {
					var vote = choice.votes[v];
					totalVotes++;

					if(vote.ip === (req.header('x-forwarded-for') || req.ip)) {
						userVoted = true;
						userChoice = { _id: choice._id, text: choice.text };
					}
				}
			}

			Polls.userVoted = userVoted;
			Polls.userChoice = userChoice;

			Polls.totalVotes = totalVotes;

			res.json(poll);
		} else {
			res.json({error:true});
		}
	});
};

exports.create = function(req, res) {
	var reqBody = req.body,
			choices = reqBody.choices.filter(function(v) { return v.text != ''; }),
			pollObj = {question: reqBody.question, choices: choices};

	var poll = new Polls(pollObj);

	poll.save(function(err, doc) {
		if(err || !doc) {
			throw 'Error';
		} else {
			res.json(doc);
		}
	});
};

exports.vote = function(socket) {
	socket.on('send:vote', function(data) {
		var ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address;

		Polls.findById(data.poll_id, function(err, poll) {
			var choice = poll.choices.id(data.choice);
			choice.votes.push({ ip: ip });

			poll.save(function(err, doc) {
				var theDoc = {
					question: doc.question, _id: doc._id, choices: doc.choices,
					userVoted: false, totalVotes: 0
				};

				for(var i = 0, ln = doc.choices.length; i < ln; i++) {
					var choice = doc.choices[i];

					for(var j = 0, jLn = choice.votes.length; j < jLn; j++) {
						var vote = choice.votes[j];
						theDoc.totalVotes++;
						theDoc.ip = ip;

						if(vote.ip === ip) {
							theDoc.userVoted = true;
							theDoc.userChoice = { _id: choice._id, text: choice.text };
						}
					}
				}

				socket.emit('myvote', theDoc);
				socket.broadcast.emit('vote', theDoc);
			});
		});
	});
};
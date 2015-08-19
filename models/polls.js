var mongoose        = require('mongoose');
var votesSchema     = new mongoose.Schema({ ip: 'String' });
var choicesSchema   = new mongoose.Schema({text: String, votes: [votesSchema]});
exports.PollsSchema = new mongoose.Schema({	question: { type: String, required: true },	choices: [choicesSchema]});
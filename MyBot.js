const Game = require('./hlt/Game');
const Log = require('./hlt/Log');

const {basic} = require('./strategies/strategies');

// start a game with a bot named 'baubot'
// and a strategy defaultStrategy defined in strategies.js
// it is defined a separate file so you can unit test it in strategies.test.js
Game.start({
    botName: 'newbot',
    preProcessing: map => {
        Log.log('no data pre-processing performed. number of ships: ' + map.myShips.length)
    },
    strategy: basic
});

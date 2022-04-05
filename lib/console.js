"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commandLineArgs = require("command-line-args");
var ql_api_1 = require("ql-api");
var readline = require("readline");
var commandLineOptions = [
    { name: 'address', type: String, defaultOption: true },
    { name: 'rcon-port', type: Number },
    { name: 'rcon-password', type: String },
    { name: 'stats-port', type: Number },
    { name: 'stats-password', type: String },
    { name: 'full-stats', type: Boolean, default: false },
    { name: 'raw-stats', type: Boolean, default: false }
];
var options;
try {
    options = commandLineArgs(commandLineOptions, { partial: true });
}
catch (e) {
    console.error(e.message);
    process.exit(1);
}
var address = options['address'];
var rconPort = options['rcon-port'];
var rconPassword = options['rcon-password'];
var statsPort = options['stats-port'];
var statsPassword = options['stats-password'];
var fullStats = options['full-stats'];
var rawStats = options['raw-stats'];
if (!address) {
    console.error('No Quake Live server address specified!');
    process.exit(1);
}
if (fullStats) {
    console.log('Diplaying full stats...');
}
if (rawStats) {
    console.log('Diplaying raw stats...');
}
if (rconPort) {
    var cli_1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "" + resolveColor('bright') + address + ":" + rconPort + resolveColor('reset') + " ",
        removeHistoryDuplicates: true
    });
    cli_1.on('line', function (line) {
        if (line.length == 0) {
            return;
        }
        if (line == 'exit') {
            log_1('Good Game');
            process.exit();
        }
        rcon_1.send(line);
    });
    cli_1.on('close', function () {
        log_1('\nGood Game');
        process.exit(0);
    });
    // Adjust console.log to properly handle interplay with the prompt
    var log_1 = console.log;
    console.log = function () {
        ;
        cli_1.output.write('\x1b[2K\r');
        log_1.apply(console, Array.prototype.slice.call(arguments));
        cli_1._refreshLine();
    };
    var rcon_1 = new ql_api_1.Rcon(address + ':' + rconPort, 'admin', rconPassword, {
        reconnect_ivl: 10000
    });
    rcon_1.onConnected(function (eventValue, address, error) {
        if (!error) {
            console.log('Rcon connected');
            rcon_1.send('gl&hf');
            cli_1.prompt();
        }
        else {
            console.log('There was an error connecting to rcon API ', error);
        }
    });
    rcon_1.onConnectRetried(function () { return console.log(resolveColor('bright') + "Connecting to rcon failed..." + resolveColor('reset')); });
    rcon_1.onMessage(function (message) {
        if (message.length > 0) {
            var str = message.toString();
            // Clean up messages like: broadcast: print "Vote passed.\n"
            if (str.startsWith('broadcast: print "')) {
                str = str.substring(18, str.length - 4);
            }
            // Resolve colors
            str = resolveQuakeLiveColors(str);
            console.log("[" + now() + "] (rcon) " + str);
        }
        cli_1.prompt();
    });
    if (rconPassword) {
        console.log("Connecting to rcon " + address + ":" + rconPort + " using password " + rconPassword + "...");
    }
    else {
        console.log("Connecting to rcon " + address + ":" + rconPort + "...");
    }
    rcon_1.connect();
}
if (statsPort) {
    var stats = new ql_api_1.Stats(address + ':' + statsPort, statsPassword, {
        reconnect_ivl: 10000
    });
    stats.onConnected(function (eventValue, address, error) {
        if (!error) {
            console.log('Stats connected');
        }
        else {
            console.error('There was an error connecting to stats API', error);
        }
    });
    stats.onConnectRetried(function () { return console.log(resolveColor('bright') + "Connecting to stats failed..." + resolveColor('reset')); });
    stats.onMatchReport(function (event) {
        if (event.aborted) {
            console.log("[" + now() + "] (stats) Game of type " + event.factory + " was aborted after " + minutesSeconds(event.gameLength));
        }
        else {
            console.log("[" + now() + "] (stats) Game of type " + event.gameType + "/" + event.factory + " has finished.");
        }
        if (fullStats) {
            console.log("[" + now() + "] (stats)", event);
        }
    });
    stats.onMatchStarted(function (event) {
        console.log("[" + now() + "] (stats) Match in game type " + event.gameType + "/" + event.factory + " on map " + event.map + " has started");
        if (fullStats) {
            console.log("[" + now() + "] (stats)", event);
        }
    });
    stats.onPlayerConnect(function (event) {
        console.log("[" + now() + "] (stats) Player " + resolveQuakeLiveColors(event.name) + " connected");
        if (fullStats) {
            console.log("[" + now() + "] (stats)", event);
        }
    });
    stats.onPlayerDeath(function (event) {
        if (event.killer) {
            console.log("[" + now() + "] (stats) " + resolveQuakeLiveColors(event.killer.name) + " fragged " + resolveQuakeLiveColors(event.victim.name) + " with " + event.killer.weapon);
        }
        else {
            console.log("[" + now() + "] (stats) " + event.mod + " fragged " + resolveQuakeLiveColors(event.victim.name));
        }
        if (fullStats) {
            console.log("[" + now() + "] (stats)", event);
        }
    });
    stats.onPlayerDisconnect(function (event) {
        console.log("[" + now() + "] (stats) Player " + resolveQuakeLiveColors(event.name) + " disconnected");
        if (fullStats) {
            console.log("[" + now() + "] (stats)", event);
        }
    });
    stats.onPlayerKill(function (event) {
        if (event.killer) {
            console.log("[" + now() + "] (stats) " + resolveQuakeLiveColors(event.killer.name) + " fragged " + resolveQuakeLiveColors(event.victim.name) + " with " + event.killer.weapon);
        }
        else {
            console.log("[" + now() + "] (stats) " + event.mod + " fragged " + resolveQuakeLiveColors(event.victim.name));
        }
        if (fullStats) {
            console.log("[" + now() + "] (stats)", event);
        }
    });
    stats.onPlayerMedal(function (event) {
        console.log("[" + now() + "] (stats) Player " + resolveQuakeLiveColors(event.name) + " earned medal " + event.medal);
        if (fullStats) {
            console.log("[" + now() + "] (stats)", event);
        }
    });
    stats.onPlayerStats(function (event) {
        console.log("[" + now() + "] (stats) Player " + resolveQuakeLiveColors(event.name) + " made " + event.kills + " frags and died " + event.deaths + " times which earned her/him rank " + event.rank);
        if (fullStats) {
            console.log("[" + now() + "] (stats)", event);
        }
    });
    stats.onPlayerSwitchTeam(function (event) {
        console.log("[" + now() + "] (stats) Player " + resolveQuakeLiveColors(event.name) + " switched to team " + event.newTeam);
        if (fullStats) {
            console.log("[" + now() + "] (stats)", event);
        }
    });
    stats.onRoundOver(function (event) {
        console.log("[" + now() + "] (stats) Team " + event.teamWon + " won round " + event.round);
        if (fullStats) {
            console.log("[" + now() + "] (stats)", event);
        }
    });
    stats.onRawQlEvent(function (event) {
        if (rawStats) {
            console.log("[" + now() + "] (stats)", event);
        }
    });
    if (statsPassword) {
        console.log("Connecting to stats " + address + ":" + statsPort + " using password " + statsPassword + "...");
    }
    else {
        console.log("Connecting to stats " + address + ":" + statsPort + "...");
    }
    stats.connect();
}
function now() {
    var date = new Date;
    var minutes = date.getMinutes().toString().padStart(2, '0');
    var seconds = date.getSeconds().toString().padStart(2, '0');
    return date.getHours() + ":" + minutes + ":" + seconds;
}
function minutesSeconds(seconds) {
    return (seconds - (seconds %= 60)) / 60 + (9 < seconds ? ':' : ':0') + seconds;
}
function resolveQuakeLiveColors(str) {
    str += resolveColor('white');
    str = str.replace(new RegExp('\\^0', 'g'), resolveColor('black'));
    str = str.replace(new RegExp('\\^1', 'g'), resolveColor('red'));
    str = str.replace(new RegExp('\\^2', 'g'), resolveColor('gree'));
    str = str.replace(new RegExp('\\^3', 'g'), resolveColor('yellow'));
    str = str.replace(new RegExp('\\^4', 'g'), resolveColor('blue'));
    str = str.replace(new RegExp('\\^5', 'g'), resolveColor('magenta'));
    str = str.replace(new RegExp('\\^6', 'g'), resolveColor('cyan'));
    str = str.replace(new RegExp('\\^7', 'g'), resolveColor('white'));
    str += resolveColor('reset');
    return str;
}
function resolveColor(colorName) {
    switch (colorName) {
        case 'reset': return '\x1b[0m';
        case 'bright': return '\x1b[1m';
        case 'dim': return '\x1b[2m';
        case 'underscore': return '\x1b[4m';
        case 'blink': return '\x1b[5m';
        case 'reverse': return '\x1b[7m';
        case 'hidden': return '\x1b[8m';
        case 'black': return '\x1b[30m';
        case 'red': return '\x1b[31m';
        case 'green': return '\x1b[32m';
        case 'yellow': return '\x1b[33m';
        case 'blue': return '\x1b[34m';
        case 'magenta': return '\x1b[35m';
        case 'cyan': return '\x1b[36m';
        case 'white': return '\x1b[37m';
        case 'bgBlack': return '\x1b[40m';
        case 'bgRed': return '\x1b[41m';
        case 'bgGreen': return '\x1b[42m';
        case 'bgYellow': return '\x1b[43m';
        case 'bgBlue': return '\x1b[44m';
        case 'bgMagenta': return '\x1b[45m';
        case 'bgCyan': return '\x1b[46m';
        case 'bgWhite': return '\x1b[47m';
        default: return '';
    }
}
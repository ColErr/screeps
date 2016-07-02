var RoomController = require('RoomController');
var Harvester = require('Harvester');
var Builder = require('Builder');
var Maintainer = require('Maintainer');
var Repairer = require('Repairer');

module.exports.loop = function() {
    //Game Initialization
    if(Memory.init === undefined){
        initialize();
    }
    
    //Initialize rooms
    var roomstats = {};
    for(var name in Game.rooms){
        roomstats[name] = {};
        
        roomstats[name].Ha = 0;
        roomstats[name].Bl = 0;
        roomstats[name].Mn = 0;
        roomstats[name].Rp = 0;
    }
    
    //Creep Loop
    for(var name in Game.creeps){
        switch(Game.creeps[name].memory.role){
            case RoomController.ROLE_HARVESTER:
                Harvester.run(Game.creeps[name]);
                ++roomstats[Game.creeps[name].room.name].Ha;
                break;
            case RoomController.ROLE_BUILDER:
                Builder.run(Game.creeps[name]);
                ++roomstats[Game.creeps[name].room.name].Bl;
                break;
            case RoomController.ROLE_MAINTAINER:
                Maintainer.run(Game.creeps[name]);
                ++roomstats[Game.creeps[name].room.name].Mn;
                break;
            case RoomController.ROLE_REPAIRER:
                Repairer.run(Game.creeps[name]);
                ++roomstats[Game.creeps[name].room.name].Rp;
                break;
        }
        
        RoomController.checkPulse(Game.creeps[name]);
    }
    
    for(var rooms in roomstats){
        RoomController.moreCreeps(rooms, roomstats[rooms]);
    }
    
    //Extra timing tasks
    if((Game.time%1000) === 0 && Game.cpu.getUsed() < (Game.cpu.limit - 5)){
        garbageCollect();
    }
}

function garbageCollect(){
    for(var creepmem in Memory.creeps){
        if(Game.creeps[creepmem] === undefined){
            delete Memory.creeps[creepmem];
        }
    }
}

function initialize() {
    if(_.isEmpty(Game.spawns)){
        return;
    }
    
    Memory.init = true;
}
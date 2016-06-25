var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleMaintainer = require('role.maintain');
var roleFighter = require('role.fighter');

module.exports.loop = function () {
    var container = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}});
    var workers = 0;
    var builders = 0;
    var maintain = 0;
    var fighters = 0;
    
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        
        //Garbage collect. Kill them at 1TTL to make life easier
        if(creep.ticksToLive == 1){
            creep.suicide;
            delete Memory.creeps[name];
        }
        else if(creep.memory.role == "Harvest"){
            roleHarvester.run(creep, container);
            workers++;
        }
        else if (creep.memory.role == "Maintain"){
            roleMaintainer.run(creep, container);
            maintain++;
        }
        else if(creep.memory.role == "Build"){
            roleBuilder.run(creep, container);
            builders++;
        }
        else if(creep.memory.role == "Fighter"){
            roleFighter.run(creep);
            fighters++;
        }
    }
    
    if(workers < 2 && !Game.spawns.Spawn1.canCreateCreep([WORK, WORK, CARRY, MOVE]) ){
        roleHarvester.buildHarvester();
    }
    /* Commetted out for now, since I don't need them. They just die.
    else if(fighters < 1 && !Game.spawns.Spawn1.canCreateCreep([TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE])){
        Game.spawns.Spawn1.createCreep([TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE], "CloseAtt"+Game.time, {role:"Fighter"})
    }
    */
    else if(maintain < 2 && !Game.spawns.Spawn1.canCreateCreep([WORK, WORK, CARRY, MOVE]) && container!=0){
        roleMaintainer.buildMaintainer();
    }
    else if(builders < 3 && !Game.spawns.Spawn1.canCreateCreep([WORK, WORK, CARRY, MOVE]) ){
        roleBuilder.buildBuilder();
    }
    else if(workers < 4 && !Game.spawns.Spawn1.canCreateCreep([WORK, WORK, CARRY, MOVE]) && container!=0){
        roleHarvester.buildHarvester();
    }
}
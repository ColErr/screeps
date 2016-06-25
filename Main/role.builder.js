var roleBuilder = {
    
    /** @param {Creep} creep **/
    run: function(creep, container) {
        var targets;
        if(creep.carry.energy == 0){
            creep.memory.state = 0;
        }
        else if(creep.carry.energy == creep.carryCapacity && creep.memory.state == 0){
            targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length){
                creep.memory.state = 1;
            }
            else{
                targets = creep.room.find(FIND_STRUCTURES, {filter: object => object.hits < object.hitsMax});
                if(targets.length){
                    creep.memory.state = 2;
                }
                else{
                    creep.memory.state = 3;
                }
            }
        }
        
        switch(creep.memory.state){
            case 0:
                getEnergy(creep, container);
                break;
            case 1:
                targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE){
                    creep.moveTo(targets[0]);
                }
                break;
            case 2:
                targets = creep.room.find(FIND_STRUCTURES, {filter: object => object.hits < object.hitsMax});
                targets.sort((a,b) => a.hits - b.hits);
                if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE){
                    creep.moveTo(targets[0]);
                }
                break;
            case 3:
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
                break;
        }
    },
    
    buildBuilder: function(){
        if(Game.spawns.Spawn1.room.energyCapacityAvailable > 400){
            Game.spawns.Spawn1.createCreep([WORK, WORK, CARRY, MOVE, MOVE, MOVE], "Build"+Game.time, {role:"Build"});
        }
        else {
            Game.spawns.Spawn1.createCreep([WORK, WORK, CARRY, MOVE], "Build"+Game.time, {role:"Build"});
        }
    }
}

module.exports = roleBuilder;

/*
Builder Creep States

0 = Get More Energy
1 = Build Structure
2 = Repair Structure
3 = Upgrade room
*/

function getEnergy(creep, container){
    if(container == 0){
        var sources = creep.room.find(FIND_SOURCES);
            
        if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0]);
        }
    }
    else {
        if(container[0].transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
            creep.moveTo(container[0])
        }
    }
}
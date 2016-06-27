var roleMaintainer = {
    
    /** @param {Creep} creep **/
    run: function(creep, container) {
        if(creep.carry.energy == 0){
            creep.memory.state = 0;
        }
        else if(Game.spawns.Spawn1.energy < Game.spawns.Spawn1.energyCapacity&& creep.carry.energy == creep.carryCapacity && creep.memory.state == 0){
            creep.memory.state = 1;
        }
        else if(Game.spawns.Spawn1.room.energyAvailable < Game.spawns.Spawn1.room.energyCapacityAvailable && creep.carry.energy == creep.carryCapacity && creep.memory.state == 0){
            creep.memory.state = 2;
        }
        else if(creep.carry.energy == creep.carryCapacity && creep.memory.state == 0){
            creep.memory.state = 3;
        }
        
        var result;
        switch(creep.memory.state){
            case 0:
                for(var index in container){
                    if(container[index].store.energy > creep.carryCapacity){
                        if(container[index].transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                            creep.moveTo(container[index]);
                            break;
                        }
                    }
                }
                break;
            case 1:
                result = creep.transfer(Game.spawns.Spawn1, RESOURCE_ENERGY);
                if(result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns.Spawn1);
                }
                else if(result == ERR_FULL){
                    creep.memory.state = 0;
                }
                break;
            case 2:
                var ext = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_EXTENSION}})
                for(var index in ext){
                    
                    if(ext[index].energy < ext[index].energyCapacity){
                        if(creep.transfer(ext[index], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(ext[index]);
                        }
                        return;
                    }
                }
                creep.memory.state = 0;
                break;
            case 3:
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
                break;
        }
    },
    
    buildMaintainer: function(){
        if(Game.spawns.Spawn1.room.energyCapacityAvailable >= 550){
            Game.spawns.Spawn1.createCreep([WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], "Maintain"+Game.time, {role:"Maintain"});
        }
        else if(Game.spawns.Spawn1.room.energyCapacityAvailable >= 400){
            Game.spawns.Spawn1.createCreep([WORK, WORK, WORK, CARRY, MOVE], "Maintain"+Game.time, {role:"Maintain"});
        }
        else {
            Game.spawns.Spawn1.createCreep([WORK, WORK, CARRY, MOVE], "Maintain"+Game.time, {role:"Maintain"});
        }
    }
}

/*
Maintainence Creep States

0 = Get Energy
1 = Bring Energy to Spawn
2 = Bring Energy to Extentions
3 = Upgrade Controller
*/

module.exports = roleMaintainer;
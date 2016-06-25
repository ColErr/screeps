var roleMaintainer = {
    
    /** @param {Creep} creep **/
    run: function(creep, container) {
        var upgrading = creep.upgradeController(creep.room.controller);
        if(upgrading == ERR_NOT_IN_RANGE || upgrading == ERR_NOT_ENOUGH_RESOURCES){
        
            if(creep.carry.energy < creep.carryCapacity) {
                if(container[0].transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(container[0])
                }
            } else if(Game.spawns.Spawn1.energy < Game.spawns.Spawn1.energyCapacity) {
                if(creep.transfer(Game.spawns.Spawn1, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns.Spawn1);
                }
            } else if(Game.spawns.Spawn1.room.energyAvailable < Game.spawns.Spawn1.room.energyCapacityAvailable){
                var ext = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_EXTENSION}})
                for(var index in ext){
                    
                    if(ext[index].energy < ext[index].energyCapacity){
                        if(creep.transfer(ext[index], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(ext[index]);
                        }
                        break;
                    }
                }
            }
            else {
                creep.moveTo(creep.room.controller);
            }
        }
    },
    
    buildMaintainer: function(){
        if(Game.spawns.Spawn1.room.energyCapacityAvailable > 400){
            Game.spawns.Spawn1.createCreep([WORK, WORK, WORK, CARRY, MOVE], "Maintain"+Game.time, {role:"Maintain"});
        }
        else {
            Game.spawns.Spawn1.createCreep([WORK, WORK, CARRY, MOVE], "Maintain"+Game.time, {role:"Maintain"});
        }
    }
}

module.exports = roleMaintainer;
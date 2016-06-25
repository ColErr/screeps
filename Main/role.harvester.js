var roleHarvester = {
    
    /** @param {Creep} creep **/
    run: function(creep, container) {
        if(container == 0) {
            var upgrading = creep.upgradeController(creep.room.controller);
            if(upgrading == ERR_NOT_IN_RANGE || upgrading == ERR_NOT_ENOUGH_RESOURCES){
            
                if(creep.carry.energy < creep.carryCapacity) {
                    var sources = creep.room.find(FIND_SOURCES);
                    
                    if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources[0]);
                    }
                } else if(Game.spawns.Spawn1.energy < Game.spawns.Spawn1.energyCapacity) {
                    if(creep.transfer(Game.spawns.Spawn1, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.spawns.Spawn1);
                    }
                }
                else {
                    creep.moveTo(creep.room.controller);
                }
            }
        } else {
            if(creep.carry.energy < creep.carryCapacity) {
                var sources = creep.room.find(FIND_SOURCES);
                
                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                }
            } else if(_.sum(container[0].store) < container[0].storeCapacity) {
                if(creep.transfer(container[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container[0]);
                }
            }
        }
    },
    
    buildHarvester: function(){
        if(Game.spawns.Spawn1.room.energyCapacityAvailable > 400){
            Game.spawns.Spawn1.createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], "Harvest"+Game.time, {role:"Harvest"});
        }
        else{
            Game.spawns.Spawn1.createCreep([WORK, WORK, CARRY, MOVE], "Harvest"+Game.time, {role:"Harvest"});
        }
    }
}

module.exports = roleHarvester;
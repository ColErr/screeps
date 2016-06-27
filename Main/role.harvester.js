var roleHarvester = {
    
    /** @param {Creep} creep **/
    run: function(creep, container) {
        if(creep.carry.energy == 0){
            creep.memory.state = 0;
        }
        else if(creep.carry.energy == creep.carryCapacity && creep.memory.state == 0){
            if(container != 0){
                creep.memory.state = 1;
            }
            else{
                if(Game.spawns.Spawn1.energy < Game.spawns.Spawn1.energyCapacity){
                    creep.memory.state = 2;
                }
                else{
                    creep.memory.state = 3;
                }
            }
        }
        
        var result;
        
        switch(creep.memory.state){
            case 0:
                var sources = creep.room.find(FIND_SOURCES);
                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                }
                break;
            case 1:
                for(var index in container){
                    if(container[index].store.energy < container[index].storeCapacity) {
                        if(creep.transfer(container[index], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(container[index]);
                            break;
                        }
                    }
                }
                break;
            case 2:
                result = creep.transfer(Game.spawns.Spawn1, RESOURCE_ENERGY);
                if(result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns.Spawn1);
                }
                else if(result == ERR_FULL){
                    creep.memory.state = 0;
                }
                break;
            case 3:
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
                break;
        }
    },
    
    buildHarvester: function(){
        if(Game.spawns.Spawn1.room.energyCapacityAvailable >= 400){
            Game.spawns.Spawn1.createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], "Harvest"+Game.time, {role:"Harvest"});
        }
        else{
            Game.spawns.Spawn1.createCreep([WORK, WORK, CARRY, MOVE], "Harvest"+Game.time, {role:"Harvest"});
        }
    }
}
/*
Harvester Creep States

0 = Harvest Energy
1 = Move Energy to Empty Container
2 = Move Energy to Spawn
3 = Upgrade Controller
*/

module.exports = roleHarvester;
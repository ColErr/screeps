var roleBuilder = {
    
    /** @param {Creep} creep **/
    run: function(creep, container) {
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if(container != 0 && (container[0].hits < container[0].hitsMax)){
            repairStruct(creep, container, container[0]);
        }
        else if(targets.length){
            var building = creep.build(targets[0]);
            
            if(building == ERR_NOT_ENOUGH_RESOURCES || building == ERR_NOT_IN_RANGE){
                if(creep.carry.energy < creep.carryCapacity){
                    getEnergy(creep, container);
                }
                else {
                    creep.moveTo(targets[0]);
                }
            }
        } else {
            targets = creep.room.find(FIND_STRUCTURES, {filter: object => object.hits < object.hitsMax});
            if(!targets.length){
                var upgrading = creep.upgradeController(creep.room.controller);
                console.log(upgrading);
                if(upgrading == ERR_NOT_IN_RANGE || upgrading == ERR_NOT_ENOUGH_RESOURCES){
                    if(creep.carry.energy < creep.carryCapacity) {
                        getEnergy();
                    }
                    else {
                        creep.moveTo(creep.room.controller);
                    }
                }
                return;
            }
            targets.sort((a,b) => a.hits - b.hits);
            repairStruct(creep, container, targets[0]);
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
function repairStruct(creep, container, target){
    var repairIt = creep.repair(target);
    if(repairIt == ERR_NOT_ENOUGH_RESOURCES || repairIt == ERR_NOT_IN_RANGE){
        if(creep.carry.energy < creep.carryCapacity){
            getEnergy(creep, container);
        }
        else {
            creep.moveTo(target);
        }
    }
}
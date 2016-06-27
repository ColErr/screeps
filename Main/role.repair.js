var roleRepair = {
    
    /** @param {Creep} creep **/
    run: function(creep, container) {
        var targets;
        if(creep.carry.energy == 0){
            creep.memory.state = 0;
        }
        else if(creep.carry.energy == creep.carryCapacity && creep.memory.state == 0){
            targets = creep.room.find(FIND_STRUCTURES, {filter: object => object.hits < object.hitsMax});
            if(targets.length){
                creep.memory.state = 1;
            }
            else{
                creep.memory.state = 3;
            }
        }
            
        switch(creep.memory.state){
            case 0:
                for(var index in container){
                    if(container[index].store.energy > (creep.carryCapacity-creep.carry.energy)){
                        if(container[index].transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                            creep.moveTo(container[index]);
                            break;
                        }
                    }
                }
                break;
            case 1:
                for(var index in container){
                    if(container[index].hits < container[index].hitsMax){
                        if(creep.repair(container[index]) == ERR_NOT_IN_RANGE){
                            creep.moveTo(container[index]);
                            return;
                        }
                        return;
                    }
                }
                targets = creep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_RAMPART}});
                for(var index in targets){
                    if(targets[index].hits < targets[index].hitsMax){
                        if(creep.repair(targets[index]) == ERR_NOT_IN_RANGE){
                            creep.moveTo(targets[index]);
                            return;
                        }
                        return;
                    }
                }
            case 2:
                creep.memory.state = 2;
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
    
    buildRepair: function(){
        if(Game.spawns.Spawn1.room.energyCapacityAvailable >= 400){
            Game.spawns.Spawn1.createCreep([WORK, WORK, CARRY, MOVE, MOVE, MOVE], "Repair"+Game.time, {role:"Repair"});
        }
        else {
            Game.spawns.Spawn1.createCreep([WORK, WORK, CARRY, MOVE], "Repair"+Game.time, {role:"Repair"});
        }
    }
}

module.exports = roleRepair;

/*
Builder Creep States

0 = Get More Energy
1 = Repair Priority Structure
2 = Repair Other Structure
3 = Upgrade room
*/
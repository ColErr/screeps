var RoomController = require('RoomController');

var Maintainer = {
    run: function(mycreep){
        if(mycreep.spawning){
            return;
        }
        
        switch(mycreep.memory.state){
            case 0:
                //Fill up Energy
                getEnergy(mycreep);
                break;
            case 1:
                //Bring Energy to Spawn
                giveSpawnEnergy(mycreep);
                break;
            case 2:
                //Bring Energy to Extensions
                giveExtensionEnergy(mycreep);
                break;
            case 3:
                //Reload Towers
                reloadTower(mycreep);
                break;
            case 4:
                //Pick up trash
                distributeEnergy(mycreep);
                break;
        }
        
        checkState(mycreep);
    }
}

function getEnergy(mycreep){
    if(mycreep.memory.source === null){
        var containers = mycreep.room.find(FIND_STRUCTURES, 
            {filter: 
                function(object){
                    if(object.structureType === STRUCTURE_CONTAINER || object.structureType === STRUCTURE_STORAGE){
                        return object.store[RESOURCE_ENERGY] >= mycreep.carryCapacity;
                    }
                }
            }
        );
        if(containers.length){
            var location = containers.indexOf( mycreep.room.controller.pos.findClosestByRange(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}}) );
            if(location !== -1 && containers.length > 1){
                containers.splice(location, 1);
            }
            if(containers.length){
                containers.sort((a,b) => (b.store[RESOURCE_ENERGY]/b.storeCapacity) - (a.store[RESOURCE_ENERGY])/a.storeCapacity);
                mycreep.memory.source = containers[0].id;
            }
        }
    }
    
    if(mycreep.memory.source === null){
        return;
    }
    
    var source = mycreep.withdraw(Game.getObjectById(mycreep.memory.source), RESOURCE_ENERGY);
    if(source === ERR_NOT_IN_RANGE){
        mycreep.moveTo(Game.getObjectById(mycreep.memory.source));
    }
    else if(source === OK){
        return;
    }
    else{
        mycreep.memory.source = null;
    }
}

function giveSpawnEnergy(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_SPAWN);
    }
    
    if(mycreep.memory.target === null){
        mycreep.memory.state = 2;
        return;
    }
    
    var result = mycreep.transfer(Game.spawns[mycreep.memory.target], RESOURCE_ENERGY);
    if(result === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.spawns[mycreep.memory.target]);
    }
    if(Game.spawns[mycreep.memory.target].energy === Game.spawns[mycreep.memory.target].energyCapacity){
        mycreep.memory.target = null;
    }
}

function giveExtensionEnergy(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_EXTENSION);
    }
    
    if(mycreep.memory.target === null){
        return;
    }
    
    var result = mycreep.transfer(Game.getObjectById(mycreep.memory.target), RESOURCE_ENERGY)
    if(result === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.getObjectById(mycreep.memory.target));
    }
    if(Game.getObjectById(mycreep.memory.target).energy === Game.getObjectById(mycreep.memory.target).energyCapacity){
        mycreep.memory.target = null;
    }
}

function reloadTower(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_TOWER);
    }
    
    var result = mycreep.transfer(Game.getObjectById(mycreep.memory.target), RESOURCE_ENERGY)
    if(result === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.getObjectById(mycreep.memory.target));
    }
    else if(result === ERR_FULL){
        mycreep.memory.target = null;
    }
}

function distributeEnergy(mycreep){
    if(mycreep.memory.target === null){
        var containers = mycreep.room.find(FIND_STRUCTURES, 
            {filter: 
                function(object){
                    if(object.structureType === STRUCTURE_CONTAINER || object.structureType === STRUCTURE_STORAGE){
                        return (object.storeCapacity - object.store[RESOURCE_ENERGY]) >= mycreep.carry.energy;
                    }
                }
            }
        );
        if(containers.length){
            containers.sort((a,b) => (a.store[RESOURCE_ENERGY]/a.storeCapacity) - (b.store[RESOURCE_ENERGY]/b.storeCapacity));
            mycreep.memory.target = containers[0].id;
        }
    }
    
    var result = mycreep.transfer(Game.getObjectById(mycreep.memory.target), RESOURCE_ENERGY);
    if(result === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.getObjectById(mycreep.memory.target));
    }
    else if(result === ERR_FULL){
        mycreep.memory.target = null;
    }
}

function checkState(mycreep){
    if(mycreep.carry.energy === 0){
        mycreep.memory.state = 0;
        mycreep.memory.target = null;
    }
    else if(mycreep.carry.energy === mycreep.carryCapacity && mycreep.memory.target === null){
        mycreep.memory.source = null;
        if(mycreep.room.energyAvailable < mycreep.room.energyCapacityAvailable){
            var myspawns = mycreep.room.find(FIND_MY_SPAWNS);
            for(var name in myspawns){
                if(Game.spawns[myspawns[name].name].energy < Game.spawns[myspawns[name].name].energyCapacity){
                    mycreep.memory.state = 1;
                    return;
                }
            }
            mycreep.memory.state = 2;
            return;
        }
        var towers = mycreep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        if(towers.length){
            for(var index in towers){
                if(towers[index].energy < towers[index].energyCapacity){
                    mycreep.memory.state = 3;
                    return;
                }
            }
        }
        mycreep.memory.state = 4;
    }
}

module.exports = Maintainer;
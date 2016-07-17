var RoomController = require('RoomController');

var Harvester = {
    run: function(mycreep){
        if(mycreep.spawning){
            return;
        }
        
        switch(mycreep.memory.state){
            case 0:
                //Harvest Energy
                getEnergy(mycreep);
                break;
            case 1:
                //Drop Energy in Container
                deliverEnergy(mycreep);
                break;
            case 2:
                //Load spawn with Energy
                giveSpawnEnergy(mycreep);
                break;
            case 3:
                //Upgrade the Controller
                upgradeLocalController(mycreep);
                break;
        }
        
        checkState(mycreep);
    }
}

function getEnergy(mycreep){
    if(mycreep.memory.source === null){
        RoomController.getSource(mycreep, RoomController.SOURCE_ENERGY);
    }
    
    if(mycreep.harvest(Game.getObjectById(mycreep.memory.source)) === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.getObjectById(mycreep.memory.source));
    }
}

function deliverEnergy(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_CONTAINER);
    }
    
    var result = mycreep.transfer(Game.getObjectById(mycreep.memory.target), RESOURCE_ENERGY);
    if(result === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.getObjectById(mycreep.memory.target));
    }
    else if(result === ERR_FULL){
        mycreep.memory.target = null;
    }
}

function giveSpawnEnergy(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_SPAWN);
    }
    
    var result = mycreep.transfer(Game.spawns[mycreep.memory.target], RESOURCE_ENERGY);
    if(result === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.spawns[mycreep.memory.target]);
    }
    else if(result === ERR_FULL){
        mycreep.memory.target = null;
        mycreep.memory.state = 0;
    }
}

function upgradeLocalController(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_CONTROLLER);
    }
    
    if(mycreep.upgradeController(Game.spawns[mycreep.memory.target].room.controller) === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.spawns[mycreep.memory.target].room.controller);
    }
}

function checkState(mycreep){
    if(mycreep.carry.energy === 0){
        mycreep.memory.state = 0;
        mycreep.memory.target = null;
    }
    else if(mycreep.carry.energy === mycreep.carryCapacity && mycreep.memory.target === null){
        if(mycreep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}}).length === 0){
            if(mycreep.room.energyAvailable < mycreep.room.energyCapacityAvailable){
                mycreep.memory.state = 2;
            }
            else{
                mycreep.memory.state = 3;
            }
        }
        else{
            mycreep.memory.state = 1;
        }
    }
}

module.exports = Harvester;
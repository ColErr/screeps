var RoomController = require('RoomController');

var Repairer = {
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
                //Repair Structures
                repairStructures(mycreep);
                break;
            case 2:
                //Upgrade the Controller
                upgradeLocalController(mycreep);
                break;
        }
        
        checkState(mycreep);
    }
}

function getEnergy(mycreep){
    if(mycreep.memory.source === null){
        RoomController.getSource(mycreep, RoomController.SOURCE_CONTAINER);
    }
    
    var source = Game.getObjectById(mycreep.memory.source).transfer(mycreep, RESOURCE_ENERGY);
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

function repairStructures(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_REPAIR);
    }
    
    if(Game.getObjectById(mycreep.memory.target).hits === Game.getObjectById(mycreep.memory.target).hitsMax){
        mycreep.memory.target = null;
        return;
    }
    
    var target = mycreep.repair(Game.getObjectById(mycreep.memory.target));
    if(target === ERR_NOT_IN_RANGE){
        mycreep.moveTo(Game.getObjectById(mycreep.memory.target));
    }
    else if(target === OK){
        return;
    }
    else {
        mycreep.memory.target = null;
    }
}

function upgradeLocalController(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_CONTROLLER);
    }
    
    if(mycreep.upgradeController(Game.spawns[mycreep.memory.target].room.controller) == ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.spawns[mycreep.memory.target].room.controller);
    }
}

function checkState(mycreep){
    if(mycreep.carry.energy === 0){
        mycreep.memory.state = 0;
        mycreep.memory.target = null;
    }
    else if(mycreep.carry.energy === mycreep.carryCapacity && mycreep.memory.target === null){
        mycreep.memory.source = null;
        if(mycreep.room.find(FIND_STRUCTURES, {filter: object => object.hits < object.hitsMax}).length){
            mycreep.memory.state = 1;
        }
        else{
            mycreep.memory.state = 2;
        }
    }
}

module.exports = Repairer;
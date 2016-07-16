var RoomController = require('RoomController');

var Builder = {
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
                //Build Structures
                buildStructures(mycreep);
                break;
            case 2:
                //Repair Structures
                repairStructures(mycreep);
                break;
            case 3:
                //Upgrade the Controller
                upgradeLocalController(mycreep);
                break;
            case 4:
                mycreep.moveTo(Game.flags.Build);
                break;
        }
        
        checkState(mycreep);
    }
}

function getEnergy(mycreep){
    if(mycreep.memory.source === null){
        var type = RoomController.SOURCE_ENERGY;
    
        if(mycreep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}}).length > 0){
            type = RoomController.SOURCE_CONTAINER;
        }
        RoomController.getSource(mycreep, type);
    }
    
    if(mycreep.memory.source === null){
        return;
    }
    
    if(Game.getObjectById(mycreep.memory.source) instanceof Structure){
        //Getting energy from a container
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
    else{
        //Getting energy from a source
        if(mycreep.harvest(Game.getObjectById(mycreep.memory.source)) === ERR_NOT_IN_RANGE) {
            mycreep.moveTo(Game.getObjectById(mycreep.memory.source));
        }
    }
}

function buildStructures(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_BUILD);
    }
    
    var target = mycreep.build(Game.getObjectById(mycreep.memory.target));
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
    if(Game.flags.Build){
        if(Game.flags.Build.room !== mycreep.room){
            mycreep.memory.state = 4;
            return;
        }
    }
    if(mycreep.carry.energy === 0){
        mycreep.memory.state = 0;
        mycreep.memory.target = null;
    }
    else if(mycreep.carry.energy === mycreep.carryCapacity && mycreep.memory.target === null){
        mycreep.memory.source = null;
        if(mycreep.room.find(FIND_CONSTRUCTION_SITES).length){
            mycreep.memory.state = 1;
        }
        else{
            if(mycreep.room.find(FIND_STRUCTURES, {filter: object => object.hits < object.hitsMax}).length){
                mycreep.memory.state = 2;
            }
            else{
                mycreep.memory.state = 3;
            }
        }
    }
}

module.exports = Builder;
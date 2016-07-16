var RoomController = require('RoomController');

var Upgrader = {
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
                //Upgrade the Controller
                upgradeLocalController(mycreep);
                break;
        }
        
        checkState(mycreep);
    }
}

function getEnergy(mycreep){
    if(mycreep.memory.source === null){
        var source = mycreep.room.controller.pos.findClosestByRange(FIND_STRUCTURES, 
            {filter: 
                function(object){
                    return object.structureType === STRUCTURE_CONTAINER/* || object.structureType === STRUCTURE_STORAGE*/
                }
            }
        );
        mycreep.memory.source = source.id;
    }
    
    if(mycreep.memory.source === null){
        return;
    }
    
    //var source = Game.getObjectById(mycreep.memory.source).transfer(mycreep, RESOURCE_ENERGY);
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
    else if(mycreep.carry.energy > 0 && mycreep.memory.target === null){
        mycreep.memory.state = 1;
    }
}

module.exports = Upgrader;
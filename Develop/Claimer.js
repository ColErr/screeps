var RoomController = require('RoomController');

var Claimer = {
    run: function(mycreep){
        if(mycreep.spawning){
            return;
        }
        
        switch(mycreep.memory.state){
            case 0:
                //Wait at Stage
                waitAtStage(mycreep);
                break;
            case 1:
                //Deposit da loot
                claimRoom(mycreep);
                break;
            case 2:
                //Git da loot
                reserveRoom(mycreep);
                break;
        }
        
        checkState(mycreep);
    }
}

function waitAtStage(mycreep){
    if(mycreep.carry.energy !== mycreep.carryCapacity){
        if(mycreep.memory.source === null){
            RoomController.getSource(mycreep, RoomController.SOURCE_CONTAINER);
        }
        
        var source = Game.getObjectById(mycreep.memory.source).transfer(mycreep, RESOURCE_ENERGY);
        if(source === ERR_NOT_IN_RANGE){
            mycreep.moveTo(Game.getObjectById(mycreep.memory.source));
            return;
        }
        else if(source === OK){
            mycreep.memory.source = null;
            return;
        }
    }
    
    if(mycreep.pos.getRangeTo(Game.flags.Stage) <= 1){
        return;
    }
    mycreep.moveTo(Game.flags.Stage);
}

function claimRoom(mycreep){
    if(mycreep.room !== Game.flags.Claim.room){
        mycreep.moveTo(Game.flags.Claim);
        return;
    }
    
    if(mycreep.room.controller.level === 0){
        if(mycreep.claimController(mycreep.room.controller) == ERR_NOT_IN_RANGE) {
            mycreep.moveTo(mycreep.room.controller);
        }
    }
    else if(mycreep.room.controller.level === 1){
        mycreep.upgradeController(mycreep.room.controller);
    }
    else{
        mycreep.suicide;
        delete mycreep.memory;
    }
}

function reserveRoom(mycreep){
    
}

function checkState(mycreep){
    if(Game.flags.Claim){
        mycreep.memory.state = 1;
    }
    else if(Game.flags.Reserve){
        mycreep.memory.state = 2;
    }
    else{
        mycreep.memory.state = 0;
    }
}

module.exports = Claimer;
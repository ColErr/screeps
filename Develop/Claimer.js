//Game.spawns.E4S33A.createCreep([CLAIM,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY], "Cl0000", {room: "E4S33", role: "Cl", state: 0, source: null, target: null});

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
                //Claim room
                claimRoom(mycreep);
                break;
            case 2:
                //Reserve room
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
        
        var source = mycreep.withdraw(Game.getObjectById(mycreep.memory.source), RESOURCE_ENERGY);
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
    else if(mycreep.room.controller.level === 2){
        mycreep.memory.role = RoomController.ROLE_BUILDER;
        mycreep.memory.state = 0;
    }
}

function reserveRoom(mycreep){
    if(mycreep.room !== Game.rooms[mycreep.memory.room]){
        mycreep.moveTo(new RoomPosition(25, 25, mycreep.memory.room));
        return;
    }
    
    if(mycreep.reserveController(mycreep.room.controller) == ERR_NOT_IN_RANGE) {
        mycreep.moveTo(mycreep.room.controller);    
    }
}

function checkState(mycreep){
    if(mycreep.getActiveBodyparts(CARRY) === 0){
        mycreep.memory.state = 2;
    }
    else if(Game.flags.Claim){
        mycreep.memory.state = 1;
    }
    else{
        mycreep.memory.state = 0;
    }
}

module.exports = Claimer;
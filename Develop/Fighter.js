var RoomController = require('RoomController');

var Fighter = {
    run: function(mycreep){
        if(mycreep.spawning){
            return;
        }
        
        checkState(mycreep);

        switch(mycreep.memory.state){
            case 0:
                //Wait for orders
                break;
            case 1:
                //Move to Staging
                mycreep.moveTo(Game.flags.Stage);
                break;
            case 2:
                //Move to Rally
                mycreep.moveTo(Game.flags.Rally);
                break;
            case 3:
                //MURDER!!!
                attackEnemy(mycreep);
                break;
        }
    }
}

function attackEnemy(mycreep){
    if(mycreep.room !== Game.flags.Rally.room){
        mycreep.moveTo(Game.flags.Rally);
        return;
    }
    
    var targets = [];
    switch(Game.flags.Rally.secondaryColor){
        case COLOR_GREY:
            targets = Game.flags.Rally.pos.findInRange(FIND_STRUCTURES, 0);
            if(targets.length){
                break;
            }
        case COLOR_RED:
            targets = Game.flags.Rally.room.find(FIND_HOSTILE_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
            if(targets.length){
                break;
            }
        case COLOR_ORANGE:
            targets = Game.flags.Rally.room.find(FIND_HOSTILE_CREEPS, 
                {filter: 
                    function(object){
                        if(Memory.friends.includes(object.owner.username)){
                            return false;
                        }
                        return (object.getActiveBodyparts(ATTACK)>0 || object.getActiveBodyparts(RANGED_ATTACK)>0);
                    }
                }
            );
            if(targets.length){
                break;
            }
        case COLOR_YELLOW:
            targets = Game.flags.Rally.room.find(FIND_HOSTILE_CREEPS,
                {filter: 
                    function(object){
                        if(Memory.friends.includes(object.owner.username)){
                            return false;
                        }
                        return true;
                    }
                }
            );
            if(targets.length){
                break;
            }
        case COLOR_GREEN:
            targets = Game.flags.Rally.room.find(FIND_HOSTILE_SPAWNS);
            break;
    }
    
    var target = mycreep.pos.findClosestByRange(targets);
    
    var success = mycreep.rangedAttack(target);
    if(success === ERR_NO_BODYPART){
        if((mycreep.attack(target) === ERR_NOT_IN_RANGE) || (mycreep.dismantle(target) === ERR_NOT_IN_RANGE)){
            mycreep.moveTo(target);
        }
        return;
    }
    else if(success === ERR_NOT_IN_RANGE){
        mycreep.moveTo(target);
        return;
    }
    mycreep.attack(target);
}

function checkState(mycreep){
    if(Memory.war.warweredeclared){
        switch(Game.flags.Rally.color){
            case COLOR_GREEN:
                mycreep.memory.state = 0;
                break;
            case COLOR_YELLOW:
                mycreep.memory.state = 2;
                break;
            case COLOR_RED:
                mycreep.memory.state = 3;
                break;
        }
    }
    else if(mycreep.pos.getRangeTo(Game.flags.Stage) <= 1){
        mycreep.memory.state = 0;
    }
    else {
        mycreep.memory.state = 1;
    }
}


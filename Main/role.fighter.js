var roleFighter = {
    
    run: function(creep){
        var staging = Game.spawns.Spawn1.room.find(FIND_FLAGS);
        var targets = creep.room.find(FIND_HOSTILE_CREEPS);
        if(targets.length == 0){
            if(creep.pos.getRangeTo(staging[0]) < 2){
                creep.memory.state = 0;
            }
            else {
                creep.memory.state = 1;
            }
        }
        else {
            creep.memory.state = 2;
        }
        
        switch(creep.memory.state){
            case 0:
                break;
            case 1:
                creep.moveTo(staging[0]);
                break;
            case 2:
                var success = creep.rangedAttack(targets[0]);
                if(success == ERR_NO_BODYPART){
                    if(creep.attack(targets[0]) == ERR_NOT_IN_RANGE){
                        creep.moveTo(targets[0]);
                    }
                    return;
                }
                else if(success == ERR_NOT_IN_RANGE){
                    creep.moveTo(targets[0]);
                    return;
                }
                creep.attack(targets[0]);
                break;
        }
    },
    
    buildFighter: function(num){
        //Fix spawning logic
        if((num+1)%3 !== 0){
            if(Game.spawns.Spawn1.room.energyCapacityAvailable >= 550){
                Game.spawns.Spawn1.createCreep([TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, ATTACK, MOVE], "CloseAtt"+Game.time, {role:"Fighter"});
            }
            else {
                Game.spawns.Spawn1.createCreep([TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE], "CloseAtt"+Game.time, {role:"Fighter"});
            }
        }
        else{
            if(Game.spawns.Spawn1.room.energyCapacityAvailable >= 550){
                Game.spawns.Spawn1.createCreep([TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, ATTACK, MOVE], "RangeAtt"+Game.time, {role:"Fighter"});
            }
            else {
                Game.spawns.Spawn1.createCreep([TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE], "RangeAtt"+Game.time, {role:"Fighter"});
            }
        }
    }
}
/*
Fighter states

0 = Wait
1 = Move to Staging Area
2 = Attack Invader
*/
module.exports = roleFighter;
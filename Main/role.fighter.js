var roleFighter = {
    
    run: function(creep){
        var targets = creep.room.find(FIND_HOSTILE_CREEPS);
        if(targets.length != 0){
            if(creep.attack(targets[0]) == ERR_NOT_IN_RANGE){
                creep.moveTo(targets[0]);
            }
        }
        else {
            var staging = Game.spawns.Spawn1.room.find(FIND_FLAGS);
            creep.moveTo(staging[0]);
        }
    },
    
    buildFighter: function(num){
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

module.exports = roleFighter;
var roleFighter = {
    
    run: function(creep){
        var targets = creep.room.find(FIND_HOSTILE_CREEPS);
        if(creep.attack(targets[0]) == ERR_NOT_IN_RANGE){
            creep.moveTo(targets[0]);
        }
    },
    
    buildFighter(){
        Game.spawns.Spawn1.createCreep([TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE], "CloseAtt"+Game.time, {role:"Fighter"})
    }
}

module.exports = roleFighter;
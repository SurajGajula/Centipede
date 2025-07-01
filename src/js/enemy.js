class Enemy {
    constructor(name, attack, health, skillname, skillstatus, skillcount, skillhits) {
        this.name = name;
        this.attack = attack;
        this.health = health;
        this.skillname = skillname;
        this.skillstatus = skillstatus;
        this.skillcount = skillcount;
        this.skillhits = skillhits;
        this.statuses = {};
    }
    clearStatuses(){
        this.statuses = {};
    }
    addStatus(status, count){
        count = Number(count);
        if (this.statuses[status]) {
            this.statuses[status] = Number(this.statuses[status]) + count;
        } else {
            this.statuses[status] = count;
        }
    }
    removeStatus(status){
        delete this.statuses[status];
    }
}
export default Enemy;
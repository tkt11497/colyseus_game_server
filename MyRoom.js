const colyseus = require('colyseus');
const schema = require("@colyseus/schema");
const Schema = schema.Schema;
const ArraySchema = schema.ArraySchema;
const MapSchema = schema.MapSchema;

class Player extends Schema {
  constructor(name,money) {
    super()
    this.name = name;
    this.money=money
  }
}
schema.defineTypes(Player, {
  name: "string",
  money: "number"
});


class State extends Schema {
  constructor () {
      super();
      this.totalplayer=0;
      this.players=new MapSchema();
      this.gameCountDown=10;
  }
}
schema.defineTypes(State, {
  totalplayer: "number",
  players: { map: Player },
  gameCountDown:'number'
});

exports.MyRoom = class extends colyseus.Room {
  playedPlayers={}
  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  } 
  onCreate (options) {
    this.setState(new State());
    console.log('created room')
    this.clock.start();
    this.clock.setInterval(() => {
      console.log('started')
       this.state.gameCountDown=10
      let countdown=setInterval(()=> {
        --this.state.gameCountDown;
        console.log(this.state.gameCountDown)
        if (this.state.gameCountDown <= 0) {
          console.log('server boardcast here and calculate')
          //calculating result

          let result=[]
          for(let i=0;i<3;i++){
            result.push(this.getRandomInt(6))
          }
        //loop over played players
        if(Object.keys(this.playedPlayers).length!=0)
        {
        for( let i in this.playedPlayers){
          console.log( this.playedPlayers[i].client.send,'sdsd')
          let bonus=null;
          if(Array.isArray(this.playedPlayers[i].data.animal)){
            //if both number in animal array includes in result array user win bounus is 5
            if(result.includes(this.playedPlayers[i].data.animal[0])&&
              result.includes(this.playedPlayers[i].data.animal[1]))
            {
              bonus=5
            }else{
              bonus=0
            }
            
          }else{
            bonus=result.filter(int=>int==this.playedPlayers[i].data.animal).length
          }  
          
          let message=''
          if(bonus==0){
            this.state.players[this.playedPlayers[i].client.sessionId].money-=this.playedPlayers[i].data.amount
            //player lose minus money
            console.log(this.state.players[this.playedPlayers[i].client.sessionId].money)
            message='you lose'
          }
          if(bonus==1){
            this.state.players[this.playedPlayers[i].client.sessionId].money+=this.playedPlayers[i].data.amount
            //player win , plus amount
            console.log(this.state.players[this.playedPlayers[i].client.sessionId].money)
            message='you win'
          }
          if(bonus==2){
            //*2 plus amount
            this.state.players[this.playedPlayers[i].client.sessionId].money+=this.playedPlayers[i].data.amount*2
            console.log(this.state.players[this.playedPlayers[i].client.sessionId].money)
            message='you win'
          }
          if(bonus==3){
            this.state.players[this.playedPlayers[i].client.sessionId].money+=this.playedPlayers[i].data.amount*3
            //*3 plus amount
            console.log(this.state.players[this.playedPlayers[i].client.sessionId].money)
            message='you win'
          }
          if(bonus==5){
            this.state.players[this.playedPlayers[i].client.sessionId].money+=this.playedPlayers[i].data.amount*5
            //*5 plus amount
            console.log(this.state.players[this.playedPlayers[i].client.sessionId].money)
            message='you win'
          }
          this.playedPlayers[i].client.send('played',
          {
            amount:this.state.players[this.playedPlayers[i].client.sessionId].money,
            message:message
          })
        }
      }
      this.broadcast('result',{result:result})
        this.playedPlayers={} //reset played players
          // this.state.gameCountDown=10
          clearInterval(countdown)
        };
        }, 1000);
      }, 15000);
      
    this.onMessage("play", (client, data) => {
      console.log(data)
      console.log(client)
      if(this.state.gameCountDown==0){  // dont let him play if game count down is 0
        //to DO: response something
        client.send('timeout','sry bet next round')
        return
      }
      this.playedPlayers[client.sessionId]={client,data}
      // console.log(this.playedPlayers[0].client)
      // console.log(this.playedPlayers[0].data)

      
    });

  }

  onJoin (client, options) {
    console.log('client joined',client.sessionId)
    console.log(options)
    this.state.totalplayer++
    this.state.players[client.sessionId] = new Player(options.userName,options.currentMoney);
    console.log(this.state.totalplayer,'total joined player')
    console.log(this.state.players)
    console.log(this.state.players[client.sessionId].name)
    console.log(Object.keys(this.state.players).length,'total joined player')
  }

  onLeave (client, consented) {
    delete this.state.players[client.sessionId]
    console.log('client left',client.sessionId)
  }

  onDispose() {
    console.log('room disposed')
  }

}

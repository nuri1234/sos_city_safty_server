const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
var http = require("http");
const { fileURLToPath } = require("url");
const app = express();
const port = process.env.PORT || 5000;
var server = http.createServer(app);
var io = require("socket.io")(server);

//middlewre
app.use(express.json());
var clients={}
var centers={}


io.on("connection", (socket) => {
  console.log("connetetd");
  console.log(socket.id, "has joind");


  socket.on("clientSignin",(id)=>{
    console.log("client signin: ",id);
    clients[id]=socket;

  });

  socket.on("centerSignin",(id)=>{
    console.log("center Signin: ",id);
    centers[id]=socket; 
    
  


  });


   socket.on("SOS",(call)=>{
    console.log("SOS CALL");
    console.log(call);
    console.log("from soket",socket.id);
    if(clients[socket.id])clients[socket.id].emit("sos_send",call);

    for (const key of Object.keys(centers)) {  
      console.log("centers to send");
      console.log(key + ":" + centers[key])  
      centers[key].emit("SOS",({'call':call,'socket':socket.id}));     
    }
   });

   socket.on("receive",(socketId)=>{
    console.log("receive to", socketId);

    if(clients[socketId])clients[socketId].emit("receive_send");

    for (const key of Object.keys(centers)) {  
      console.log("centers to send recive");
      console.log(key + ":" + centers[key])  
      centers[key].emit("call_recived",socketId);     
    }
   });

   
   socket.on("message",(data)=>{
    console.log("msg: ",data['msg']);

    if(clients[socket.id])clients[socket.id].emit("message_send",data);
    if(centers[data['targitId']])centers[data['targitId']].emit("get_message",data);

 
   });


   socket.on("chatReqest",(msg)=>{
    console.log(msg);
    if(clients[socket.id])clients[socket.id].emit("message_send",data);

    for (const key of Object.keys(centers)) {  
      console.log("chatReqest to");
      console.log(key + ":" + centers[key])  
      centers[key].emit("chatReqest",{'msg':msg,'socketId':socket.id});     
    }

 
   });

   socket.on("chatReqestRespons",(socketId)=>{
    if( clients[socketId]) clients[socketId].emit("chatReqestRespons",(socket.id));
    for (const key of Object.keys(centers)) {  
      console.log("chatReqest to");
      console.log(key + ":" + centers[key])  
      centers[key].emit("chatReqestCoplited",socketId);     
    }

 
   });

   




   socket.on("cancel",()=>{
    console.log("cancel call");
   

    for (const key of Object.keys(centers)) {  
      console.log("centers to send cancel");
      console.log(key + ":" + centers[key])  
      centers[key].emit("cancel",socket.id);     
    }
});


   socket.on("disconnect",()=>{
    console.log(socket.id, "disconected");
    clients.hasOwnProperty(socket.id) // true
      delete clients[socket.id]
      centers.hasOwnProperty(socket.id) // true
      delete centers[socket.id] 

    
   });
  
   
});
app.route("/chek").get((req,res)=>{
  return res.json("your App is working fine");
});
  

/////consol command("ipconfig") IPV4 addres;
server.listen(port, "0.0.0.0", () => {
  console.log("server started");
});
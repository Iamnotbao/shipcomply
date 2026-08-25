const clients = new Map();

 const addClient = (clientId,res) =>{
    clients.set(clientId, res);
}

 const removeClient = (clientId) =>{
    clients.delete(clientId);
}

 const broadcast =(data)=>{
    clients.forEach((res)=>{
        res.write(`data:${JSON.stringify(data)}\n\n`);  
    })
}
module.exports = { addClient, removeClient, broadcast };
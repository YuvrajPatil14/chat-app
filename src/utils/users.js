const users = []


//addUser, removeUser , getUser,getUsersInRoom

const addUser = ({id, username,room})=>{
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if(!username || !room)
    {
        return {
            error: 'Username and room are required !'
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //validare usernname
    if(existingUser){
        return {
            error:'Username already taken !'
        }
    }

    //store user 
    const user = {
        id, username,room
    }
    users.push(user)
    return {user}
}


const removeUser = (id)=>{
    const index = users.findIndex(user=>id === user.id)
    if(index !== -1) {
        return users.splice(index,1)
    }
}

const getUser = (id)=>{
    const user = users.find(user=>user.id === id)
    if(!user){
        return {
            error:'User not found!'
        }
    }
    return {user}
}

const getUsersInRoom = (room)=>{
    const user = users.filter(user=>user.room === room)
    if(user.length === 0)
    {
        return {
            error:'no such room'
        }
    }
    return {user}
}


module.exports = {
    addUser,
    removeUser,
    getUsersInRoom,getUser
}
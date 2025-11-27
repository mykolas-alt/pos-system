const SESSION_KEY="dev_session_started"

const DEFAULT_DB={
    businesses:[
        {id:1,ownerId:1,type:"catering",name:"Test Catering",address:"123 Test St, Test City, TC 12345",contactInfo:"testcatering@gmail.com"},
        {id:2,ownerId:2,type:"beauty",name:"Test Beauty",address:"456 Test St, Test City, TC 12346",contactInfo:"testbeauty@gmail.com"},
        {id:3,ownerId:2,type:"beauty",name:"Test Beauty1",address:"456 Test St, Test City, TC 12346",contactInfo:"testbeauty@gmail.com"},
        {id:4,ownerId:2,type:"beauty",name:"Test Beauty2",address:"456 Test St, Test City, TC 12346",contactInfo:"testbeauty@gmail.com"},
        {id:5,ownerId:2,type:"beauty",name:"Test Beauty3",address:"456 Test St, Test City, TC 12346",contactInfo:"testbeauty@gmail.com"},
        {id:6,ownerId:2,type:"beauty",name:"Test Beauty4",address:"456 Test St, Test City, TC 12346",contactInfo:"testbeauty@gmail.com"}
    ],
    users:[
        {id:1,email:"jonhdoe@gmail.com",username:"JonhDoe",password:"TestUser123"},
        {id:2,email:"jonhsmith@gmail.com",username:"JonhSmith",password:"TestUser123"},
        {id:3,email:"joshbrown@gmail.com",username:"JoshBrown",password:"TestUser123"}
    ],
    employees:[
        {id:1,userId:1,businessId:1,name:"Jonh Doe",role:"Owner"},
        {id:2,userId:3,businessId:2,name:"Josh Brown",role:"Owner"},
        {id:3,userId:3,businessId:3,name:"Josh Brown",role:"Owner"},
        {id:4,userId:3,businessId:4,name:"Josh Brown",role:"Owner"},
        {id:5,userId:3,businessId:5,name:"Josh Brown",role:"Owner"},
        {id:6,userId:3,businessId:6,name:"Josh Brown",role:"Owner"},
        {id:7,userId:3,businessId:1,name:"Josh Brown",role:"Employee"}
    ]
}

const existingSession=sessionStorage.getItem(SESSION_KEY)

if(!existingSession){
    console.log("New dev session -> Restarting DB")
    sessionStorage.setItem(SESSION_KEY,"true")
    localStorage.setItem("temp_db",JSON.stringify(DEFAULT_DB))
}

export function getDb(){
    return JSON.parse(localStorage.getItem("temp_db"))
}

export function saveDb(db){
    localStorage.setItem("temp_db",JSON.stringify(db))
}
const SESSION_KEY="dev_session_started"

const DEFAULT_DB={
    businesses:[
        {id:1,ownerId:1,name:"Test Catering",address:"123 Test St, Test City, TC 12345",contactInfo:"testcatering@gmail.com"},
        {id:2,ownerId:2,name:"Test Beauty",address:"456 Test St, Test City, TC 12346",contactInfo:"testbeauty@gmail.com"}
    ],
    users:[
        {id:1,email:"jonhdoe@gmail.com",username:"JonhDoe",password:"TestUser123"},
        {id:2,email:"jonhsmith@gmail.com",username:"JonhSmith",password:"TestUser123"},
        {id:3,email:"joshbrown@gmail.com",username:"JoshBrown",password:"TestUser123"}
    ],
    employees:[
        {id:1,userId:1,businessId:1,name:"Jonh Doe"},
        {id:2,userId:3,businessId:2,name:"Josh Brown"}
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
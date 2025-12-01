const SESSION_KEY="dev_session_started"

const DEFAULT_DB={
    businesses:[
        {id:1,ownerId:1,type:"catering",name:"Test Catering",address:"123 Test St, Test City, TC 12345",contactInfo:"testcatering@gmail.com"},
        {id:2,ownerId:3,type:"beauty",name:"Test Beauty",address:"456 Test St, Test City, TC 12346",contactInfo:"testbeauty@gmail.com"}
    ],
    users:[
        {id:1,email:"jonhdoe@gmail.com",username:"JonhDoe",password:"TestUser123"},
        {id:2,email:"jonhsmith@gmail.com",username:"JonhSmith",password:"TestUser123"},
        {id:3,email:"joshbrown@gmail.com",username:"JoshBrown",password:"TestUser123"}
    ],
    employees:[
        {id:1,userId:1,businessId:1,name:"Jonh Doe",role:"Owner"},
        {id:2,userId:3,businessId:2,name:"Josh Brown",role:"Owner"}
    ],
    orders:[
        {id:1,businessId:1,status:"Paid",createdAt:new Date(2025,10,30,15,8,54),closedAt:new Date(2025,10,30,15,29,38),total:6.89},
        {id:2,businessId:1,status:"Closed",createdAt:new Date(2025,10,30,15,10,11),closedAt:new Date(2025,10,30,15,12,43),total:2.59},
        {id:3,businessId:1,status:"Paid",createdAt:new Date(2025,10,30,15,11,27),closedAt:new Date(2025,10,30,15,19,21),total:3.99},
        {id:4,businessId:1,status:"Open",createdAt:new Date(2025,10,30,15,14,20),closedAt:"",total:5.49}
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
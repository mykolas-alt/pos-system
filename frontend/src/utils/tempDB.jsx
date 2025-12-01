const SESSION_KEY="dev_session_started"

const DEFAULT_DB={
    businesses:[
        {id:1,ownerId:1,type:"catering",name:"Test Catering",address:"123 Test St, Test City, TC 12345",contactInfo:"testcatering@gmail.com"},
        {id:2,ownerId:3,type:"beauty",name:"Test Beauty",address:"456 Test St, Test City, TC 12346",contactInfo:"testbeauty@gmail.com"}
    ],
    users:[
        {id:1,email:"jonhdoe@gmail.com",username:"JonhDoe",password:"TestUser123"},
        {id:2,email:"jonhsmith@gmail.com",username:"JonhSmith",password:"TestUser123"},
        {id:3,email:"joshbrown@gmail.com",username:"JoshBrown",password:"TestUser123"},
        {id:4,email:"alexgreen@gmail.com",username:"AlexGreen",password:"TestUser123"}
    ],
    employees:[
        {id:1,userId:1,businessId:1,name:"Jonh Doe",role:"Owner"},
        {id:2,userId:3,businessId:2,name:"Josh Brown",role:"Owner"},
        {id:3,userId:5,businessId:2,name:"Alex Green",role:"Employee"}
    ],
    orders:[
        {id:1,businessId:1,status:"Paid",createdAt:new Date(2025,10,30,15,8,54),closedAt:new Date(2025,10,30,15,29,38)},
        {id:2,businessId:1,status:"Closed",createdAt:new Date(2025,10,30,15,10,11),closedAt:new Date(2025,10,30,15,12,43)},
        {id:3,businessId:1,status:"Paid",createdAt:new Date(2025,10,30,15,11,27),closedAt:new Date(2025,10,30,15,19,21)},
        {id:4,businessId:1,status:"Open",createdAt:new Date(2025,10,30,15,14,20),closedAt:""}
    ],
    OrderProduct:[
        {id:1,orderId:1,productId:1,quantity:2}
    ],
    Products:[
        {id:1,businessId:1,name:"Latte",price:3.99,categoryId:1}
    ],
    Categories:[
        {id:1,businessId:1,name:"Hot Drinks"}
    ],
    Reservations:[
        {id:1,businessId:2,serviceId:2,appointmentTime:new Date(2025,11,9,15,0,0),custumerName:"Anne Boonchuy",customerPhone:"+370 279 25415",status:"Open",createdAt:new Date(2025,11,2,17,42,51),closedAt:""}
    ],
    Services:[
        {id:1,businessId:2,specialistId:3,name:"Massage",duration:"30 min",opensAt:"10:00",closesAt:"18:00",price:19.99},
        {id:2,businessId:2,specialistId:3,name:"Haircut",duration:"60 min",opensAt:"11:00",closesAt:"18:00",price:15.99}
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
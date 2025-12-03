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
        {id:1,userId:1,businessId:1,name:"Jonh Doe",role:"Savininkas"},
        {id:2,userId:3,businessId:2,name:"Josh Brown",role:"Savininkas"},
        {id:3,userId:4,businessId:2,name:"Alex Green",role:"Darbuotojas"}
    ],
    orders:[
        {id:1,businessId:1,status:"Apmokėta",createdAt:new Date(2025,10,30,15,8,54),closedAt:new Date(2025,10,30,15,29,38),comment:""},
        {id:2,businessId:1,status:"Uždaryta",createdAt:new Date(2025,10,30,15,10,11),closedAt:new Date(2025,10,30,15,12,43),comment:""},
        {id:3,businessId:1,status:"Apmokėta",createdAt:new Date(2025,10,30,15,11,27),closedAt:new Date(2025,10,30,15,19,21),comment:""},
        {id:4,businessId:1,status:"Atvira",createdAt:new Date(2025,10,30,15,14,20),closedAt:"",comment:""}
    ],
    orderProducts:[
        {id:1,orderId:1,productId:1,quantity:2},
        {id:2,orderId:2,productId:3,quantity:1},
        {id:3,orderId:3,productId:4,quantity:2},
        {id:4,orderId:3,productId:2,quantity:1},
        {id:5,orderId:4,productId:3,quantity:1}
    ],
    products:[
        {id:1,businessId:1,name:"Latte",price:3.99,categoryId:1},
        {id:2,businessId:1,name:"Amerikano",price:3.59,categoryId:1},
        {id:3,businessId:1,name:"Šokoladinis Pyragas",price:4.99,categoryId:2},
        {id:4,businessId:1,name:"Čeburekas",price:2.99,categoryId:3}
    ],
    productOptionGroups:[
        {id:1,productId:1,name:"Saldumas",type:"slider",minSelect:0,maxSelect:5},
        {id:2,productId:1,name:"Pienas",type:"single",minSelect:1,maxSelect:1},
        {id:3,productId:1,name:"Papildai",type:"multi",minSelect:0,maxSelect:1}
    ],
    productOptionValues:[
        {id:1,productOptionGroupId:2,name:"Karvės Pienas",priceDelta:0},
        {id:2,productOptionGroupId:2,name:"Sojų Pienas",priceDelta:0.5},
        {id:3,productOptionGroupId:3,name:"Šokolado Gabaliukai",priceDelta:0.75},
        {id:4,productOptionGroupId:3,name:"Zefiras",priceDelta:0.6}
    ],
    orderProductSelectedOptions:[
        {id:1,orderProductId:1,productOptionGroupId:1,value:3},
        {id:2,orderProductId:1,productOptionGroupId:2,value:1}
        // If type is slider then value is number, if type is single or multi then value is productOptionValue id
    ],
    categories:[
        {id:1,businessId:1,name:"Karšti Gėrimai"},
        {id:2,businessId:1,name:"Desertai"},
        {id:3,businessId:1,name:"Greitas Maistas"}
    ],
    reservations:[
        {id:1,businessId:2,serviceId:2,appointmentTime:new Date(2025,11,9,15,0,0),customerName:"Anne Boonchuy",customerPhone:"+370 279 25415",status:"Atvira",createdAt:new Date(2025,11,2,17,42,51),closedAt:""}
    ],
    services:[
        {id:1,businessId:2,employeesId:3,name:"Masažas",duration:"30 min",opensAt:"10:00",closesAt:"18:00",price:19.99},
        {id:2,businessId:2,employeesId:3,name:"Plaukų Kirpimas",duration:"60 min",opensAt:"11:00",closesAt:"18:00",price:15.99}
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
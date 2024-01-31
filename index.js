var request = require('request');
const { environment } = require('./src/environments');
const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    user: 'postgres',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
});

var tokenManager = ''

function Authorization(){
    return new Promise((resolve, reject) => {
        request.post(
            environment.ApiManagerUrl+'/api/auth/',
            { json: { 
                "username": environment.UserNameManagerAPI,
                "password": environment.PassManagerAPI
              } },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body.auth_token)
                }
                else{
                    reject(body)
                }
            }
        )
    });
}

function getComprobantes(dateIni, dateFin){
    return new Promise((resolve, reject) => {
        request.get(
            environment.ApiManagerUrl+'/api/comprobantes/'+environment.RutEmpresa+'/?df='+dateIni+'&dt='+dateFin,
            {
                headers:{
                    "Authorization" : "Token "+tokenManager
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body).data)
                }
                else{
                    reject(body)
                }
            }
        )
    });
}

function getGuiasDespacho(dateIni, dateFin){
    return new Promise((resolve, reject) => { //
        request.get(
            environment.ApiManagerUrl+'/api/documents/'+environment.RutEmpresa+'/GDVE/V/?df='+dateIni+'&dt='+dateFin+'&details=1',
            {
                headers:{
                    "Authorization" : "Token "+tokenManager
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body).data)
                }
                else{
                    reject(body)
                }
            }
        )
    });
}

//obtener clientes
function getCliente(rutCliente){
    return new Promise((resolve, reject) => { //
        request.get(
            environment.ApiManagerUrl+'/api/clients/'+environment.RutEmpresa+'/'+rutCliente+'/?contacts=0&con_credito=0',
            {
                headers:{
                    "Authorization" : "Token "+tokenManager
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body).data[0])
                }
                else{
                    reject(body)
                }
            }
        )
    });
}

//obtener Comuna
function getComuna(idComuna){
    return new Promise((resolve, reject) => { //
        request.get(
            environment.ApiManagerUrl+'/api/comunas/',
            {
                headers:{
                    "Authorization" : "Token "+tokenManager
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body).data)
                }
                else{
                    reject(body)
                }
            }
        )
    });
}

//obtener Ciudad
function getCiudad(idCiudad){
    return new Promise((resolve, reject) => { //
        request.get(
            environment.ApiManagerUrl+'/api/ciudades/',
            {
                headers:{
                    "Authorization" : "Token "+tokenManager
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body).data)
                }
                else{
                    reject(body)
                }
            }
        )
    });
}

//https://external.driv.in/api/external/v2/schemas
function getEsquemas(){
    return new Promise((resolve, reject) => { //
        request.get(
            'https://external.driv.in/api/external/v2/schemas',
            {
                headers:{
                    'X-API-Key': environment.apiKeyDrivIn
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body))
                }
                else{
                    reject(body)
                }
            }
        )
    });
}

function postOrder(order){
    //'https://external.driv.in/api/external/v2/orders?schema_code='+'584412'
    return new Promise((resolve, reject) => { //
        request.post(
            'https://external.driv.in/api/external/v2/orders?schema_code=011',
            {
                headers:{
                    "X-API-Key" : environment.apiKeyDrivIn,
                    'Content-Type': 'application/json'
                },
                body: order
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body)
                }
                else{
                    reject(body)
                }
            }
        )
    }); 
}

function getComunaManager(idComuna, comunas){
    return new Promise((resolve, reject) => {
        var comuna_to_return = ''
        
        for (i = 0; i < comunas.length; i++) {
            if(comunas[i].code == idComuna){
                comuna_to_return = comunas[i].name
            }
        }
  
        if (comuna_to_return != '') {
            resolve(comuna_to_return);} 
        else {
            reject(Error("It broke"));}
    });
  };

function parseOrder(cliente, guiaDespacho, comunaRealCliente){
    return new Promise((resolve, reject) => {
        var items_guia = []

        for (i = 0; i < guiaDespacho.detalles.length; i++) {
            var new_item = 
            {
                "code": guiaDespacho.detalles[i].docdetnum,
                "description": guiaDespacho.detalles[i].descripcion,
                "units": guiaDespacho.detalles[i].cant,
                "units_1": guiaDespacho.detalles[i].cant,
                "units_2": null,
                "units_3": null
            }
            items_guia.push(new_item)
        }

        var orderToReturn = JSON.stringify({
            "clients": [
                {
                "code": cliente.num_cliente,
                "address": guiaDespacho.dire_cliente, //descrip_direcc_cliente
                "reference": "",
                "city": comunaRealCliente,
                "country": "Chile",
                "lat": null,
                "lng": null,
                "name": cliente.razon_social,
                "client_name": cliente.razon_social,
                "client_code": null,
                "address_type": "",
                "contact_name": cliente.nombre_fantasia,
                "contact_phone": cliente.telefono_contacto,
                "contact_email": cliente.mail_contacto,
                "additional_contact_name":"",
                "additional_contact_phone":"",
                "additional_contact_email": "",
                "start_contact_name":"",
                "start_contact_phone":"",
                "start_contact_email": "",
                "near_contact_name":"",
                "near_contact_phone":"",
                "near_contact_email": "",
                "delivered_contact_name": cliente.nombre_fantasia,
                "delivered_contact_phone": cliente.telefono_contacto,
                "delivered_contact_email": cliente.mail_contacto,
                "service_time": 15,
                "sales_zone_code":"?",
                "time_windows": [
                    {
                    "start": '07:00:',//guiaDespacho.glosa_enc.split("\r\n")[0].split("/")[0]+':', //07:00: formato
                    "end": '18:00:'//guiaDespacho.glosa_enc.split("\r\n")[0].split("/")[1]+':'
                    }
                ],
                "tags": null,
                "orders": [
                    {
                    "code": guiaDespacho.folio,
                    "alt_code": "996",
                    "description": "",
                    "category": "Delivery",
                    "units_1": null,
                    "units_2": null,
                    "units_3": null,
                    "position": 1,
                    "delivery_date": guiaDespacho.fecha_ven,
                    "priority": 0,
                    "custom_1": null,
                    "custom_2": null,
                    "custom_3": null,
                    "custom_4": null,
                    "custom_5": null,
                    "supplier_code": "Mauco",
                    "supplier_name": "Mauco",
                    "deploy_date": guiaDespacho.fecha_ven,
                    "items": items_guia,
                    "pickups":[]
                    }
                ]
                }
            ]
        })

        if (orderToReturn != null) {
            resolve(orderToReturn);} 
        else {
            reject(Error("It broke"));}
    });
        
}

function getToday(){
    const date = new Date();

    var day = date.getDate();
    var month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (day <= 10){
        day = '0'+day.toString();
    }

    if (month <= 10){
        month = '0'+month.toString();
    }

    var currentDate = year.toString()+month.toString()+day.toString();

    return currentDate
}

async function installApp(){
    console.log('Autorización Manager')
    const token = await Authorization() //Autenticación API Manager+
    tokenManager = token

    var currentDate = getToday() //obtenemos fecha de hoy
    console.log(currentDate)

    const documentos = await getGuiasDespacho(currentDate, currentDate) //obtenemos ordenes de despacho con la fecha de hoy
    console.log('conexión Manager OK')

    const comunas = await getComuna() //obtenemos información sobre las comunas
    console.log('comunas obtenidas')

    documentos.forEach(async (obj,index) =>{
        console.log('Obteniendo Cliente: '+obj.rut_cliente)
        var cliente = await getCliente(obj.rut_cliente)
        var comunaCliente = await getComunaManager(cliente.comuna,comunas)

        console.log('Parseando orden: '+ obj.folio)
        var order = await parseOrder(cliente,obj,comunaCliente)

        postOrderPrueba = await postOrder(order)
        console.log('orden: '+ obj.folio+' ingresada')
    })

}

installApp()


//delete orders

// function deleteOrder(num_order){
//     return new Promise((resolve, reject) => { //
//         request.delete(
//             'https://external.driv.in/api/external/v2/orders/'+num_order,
//             {
//                 headers:{
//                     "X-API-Key" : environment.apiKeyDrivIn,
//                     'Content-Type': 'application/json'
//                 }
//             },
//             function (error, response, body) {
//                 if (!error && response.statusCode == 200) {
//                     resolve(body)
//                 }
//                 else{
//                     reject(body)
//                 }
//             }
//         )
//     }); 
// }

// async function delete_orders(){
//     var delete_order = await deleteOrder('86262')//,,,,,,,
//     console.log(delete_order)
// }

// delete_orders()




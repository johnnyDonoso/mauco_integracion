var request = require('request');
const { environment } = require('./src/environments');
const { Client } = require('pg');

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
function getBodegas(){
    return new Promise((resolve, reject) => { //
        request.get(
            environment.ApiManagerUrl+'/api/offices/'+environment.RutEmpresa+'/',
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
                    reject(null)
                }
            }
        )
    });
}

//obtener items
function getItems(){
    return new Promise((resolve, reject) => { //
        request.get(
            environment.ApiManagerUrl+'/api/products-by-units/'+environment.RutEmpresa+'?buscar=',
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
                    reject(null)
                }
            }
        )
    });
}

//obtener clientes
function getCliente(rutCliente){
    return new Promise((resolve, reject) => { //
        request.get(
            environment.ApiManagerUrl+'/api/clients/'+environment.RutEmpresa+'/'+rutCliente+'/?direcciones=1',
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
                    reject(null)
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

function parseOrder(cliente, guiaDespacho, bodegas, items){
    return new Promise((resolve, reject) => {
        var items_guia = []

        var custom_1 = '' //codigo + nombre de bodega

        var peso_item = 0.0

        for (i = 0; i < guiaDespacho.detalles.length; i++) {

            bodegas.forEach(async (bodega, index) => {
                if(bodega.codigo == guiaDespacho.detalles[i].bodega_item){
                    custom_1 = bodega.codigo + '-' + bodega.name
                }
            })

            items.forEach(async (item, index) => {
                if(item.codigo_prod == guiaDespacho.detalles[i].codigo){
                    peso_item = item.peso
                }
            })

            //console.log(guiaDespacho.detalles[i])

            var new_item = 
            {
                "code": guiaDespacho.detalles[i].docdetnum,
                "description": guiaDespacho.detalles[i].descripcion,
                "units": guiaDespacho.detalles[i].cant,
                "units_1": Math.round(guiaDespacho.detalles[i].cant * peso_item),
                "units_2": null,
                "units_3": null,
                "custom_1": null,
                "custom_2": custom_1, //nombre bodega,
                "custom_3": guiaDespacho.detalles[i].ubicacion_item //ubicacion bodega
            }
            items_guia.push(new_item)

            //console.log(new_item)
        }

        //ventana horaria
        var ventana_horario = []

        var nueva_ventana = 
            {
                "start": "07:00",
                "end": "17:00"
            }
            
        
        ventana_horario.push(nueva_ventana)

        // try{
        //     var nueva_ventana = {
        //             "start": guiaDespacho.glosa_enc.split("\r\n")[0].split("/")[0]+':',
        //             "end": guiaDespacho.glosa_enc.split("\r\n")[0].split("/")[1]+':'
        //     }
        //     ventana_horario.push(nueva_ventana)
        // }
        // catch(e){ }

        //console.log(guiaDespacho.folio + '-' + cliente.num_cliente.toString()+guiaDespacho.id_direccion.toString())

        var orderToReturn = JSON.stringify({
            "clients": [
                {
                "code": cliente.num_cliente.toString()+guiaDespacho.id_direccion.toString(),
                "address": guiaDespacho.dire_cliente_larga, //descrip_direcc_cliente
                "reference": guiaDespacho.dire_cliente,
                "city": guiaDespacho.comuna_cliente,
                "country": "Chile",
                "lat": null,
                "lng": null,
                "name": cliente.nombre_fantasia,
                "client_name": cliente.nombre_fantasia,
                "client_code": null,
                "address_type": "",
                "contact_name": cliente.nombre_contacto_direccion,
                "contact_phone": cliente.telefono_contacto_direccion,
                "contact_email": cliente.email_contacto_direccion,
                "additional_contact_name":"",
                "additional_contact_phone":"",
                "additional_contact_email": "",
                "start_contact_name": cliente.nombre_contacto_direccion,
                "start_contact_phone": cliente.telefono_contacto_direccion,
                "start_contact_email": cliente.email_contacto_direccion,
                "near_contact_name":"",
                "near_contact_phone":"",
                "near_contact_email": "",
                "delivered_contact_name": cliente.nombre_contacto_direccion,
                "delivered_contact_phone": cliente.telefono_contacto_direccion,
                "delivered_contact_email": cliente.email_contacto_direccion,
                "service_time": 15,
                "sales_zone_code":"?",
                "time_windows": ventana_horario,
                "tags": null,
                "orders": [
                    {
                    "code": guiaDespacho.folio,
                    "alt_code": "996",
                    "description": guiaDespacho.glosa_enc,
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

var contador_ordenes_ok = 0
var contador_ordenes_failed = 0

async function installApp(){
    
    //AGREGAR BODEGA DEL ITEM
    //console.log('Autorización Manager')
    const token = await Authorization() //Autenticación API Manager+
    tokenManager = token
    //console.log(tokenManager)

    var currentDate = getToday() //obtenemos fecha de hoy
    console.log('Obteniendo ÓRDENES del día: '+currentDate)
    console.log('---')

    const documentos = await getGuiasDespacho(currentDate, currentDate) //obtenemos ordenes de despacho con la fecha de hoy
    //console.log('conexión Manager OK')

    const bodegas = await getBodegas()
    //console.log('Bodegas obtenidas')

    const items = await getItems()

    var largo_array = documentos.length

    documentos.forEach(async (obj,index) =>{

        if(obj.rut_cliente == null){
            obj.rut_cliente = environment.RutEmpresa
        }

        //console.log('Obteniendo Cliente: '+obj.rut_cliente)
        var cliente = await getCliente(obj.rut_cliente)

        var direcciones = cliente.direcciones

        direcciones.forEach(async (direccion, index) =>{
            if(direccion.descripcion == obj.dire_cliente){
                //console.log(direccion)
                obj.dire_cliente_larga = direccion.direccion
                obj.comuna_cliente = direccion.comuna
                obj.region_cliente = direccion.region
                obj.id_direccion = index
                cliente.nombre_contacto_direccion = direccion.atencion
                cliente.email_contacto_direccion = direccion.emaildir
                cliente.telefono_contacto_direccion = direccion.telefono
            }
        })
        //console.log(obj.region_cliente +'-'+obj.comuna_cliente)

        if( (obj.region_cliente == "Metropolitana de Santiago" || obj.region_cliente == "O'Higgins") && obj.estado == 'C'){
            //console.log('Parseando orden: '+ obj.folio)
            //console.log(obj)
            var order = await parseOrder(cliente, obj, bodegas,items)
            //console.log(order)

            try{
                
                postOrderPrueba = await postOrder(order)
                //console.log('orden: '+ obj.folio+' ingresada')
                contador_ordenes_ok = contador_ordenes_ok + 1
            }
            catch(e){
                console.log(order)
                //dirección ya existe
                //console.log('orden: '+obj.folio+' ya ingresada')
                contador_ordenes_failed = contador_ordenes_failed + 1 

            }
        }
        
        if(index == largo_array - 1){
            console.log('ordenes_ok: '+ contador_ordenes_ok)
            console.log('ordenes_failed: '+ contador_ordenes_failed) 
        }
    })
}

async function runApp(){
    await installApp()
}

runApp()

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
//     var delete_order = await deleteOrder('87265')//,,,,,,,
//     console.log(delete_order)
// }

// delete_orders()




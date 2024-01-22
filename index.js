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
                    "Authorization" : "Token "+process.env.TOKEN
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
                    "Authorization" : "Token "+process.env.TOKEN
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
                    "Authorization" : "Token "+process.env.TOKEN
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

//obtener Comuna
function getComuna(idComuna){
    return new Promise((resolve, reject) => { //
        request.get(
            environment.ApiManagerUrl+'/api/comunas/',
            {
                headers:{
                    "Authorization" : "Token "+process.env.TOKEN
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
                    "Authorization" : "Token "+process.env.TOKEN
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

async function getComunaManager(idComuna){
    var comuna_to_return = ''
    comunas = await getComuna()
    for (i = 0; i < comunas.length; i++) {
        if(comunas[i].code == idComuna){
            comuna_to_return = comunas[i].name
        }
    }
    return comuna_to_return
}

async function parseOrder(cliente1, guiaDespacho){
    var cliente = cliente1[0]
    // console.log(cliente)
    // console.log(guiaDespacho)
    var comunaRealCliente = await getComunaManager(cliente.comuna)

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
            "code": "000",
            "address": guiaDespacho.dire_cliente,
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
                "start": guiaDespacho.glosa_enc.split("\r\n")[0].split("/")[0]+':', //07:00: formato
                "end": guiaDespacho.glosa_enc.split("\r\n")[0].split("/")[1]+':'
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

    return orderToReturn
        
}

async function installApp(){
    const token = await Authorization()
    process.env.TOKEN = token

    // postOrderPrueba = await postOrder()
    // console.log(postOrderPrueba)

    // respuesta = await getEsquemas()
    // console.log(respuesta)

    documentos = await getGuiasDespacho('20240119', '20240119')

    for (i = 0; i < documentos.length; i++) {
        if(documentos[i].folio === 86283){// || documentos[i].folio === 86284 || documentos[i].folio === 86285 ){
            console.log(i)
            cliente = await getCliente(documentos[i].rut_cliente)

            var order = await parseOrder(cliente, documentos[i])

            postOrderPrueba = await postOrder(order)

            console.log(postOrderPrueba)
            break
            //console.log(orderDrivIn)
            // console.log(orderDrivIn)
            // console.log(orderDrivIn)
        }
    } 

    // clientes = await getCliente('6432776-3')

    // for (i = 0; i < clientes.length; i++) {
    //     console.log(clientes[i])
    // }
    
    //console.log(token)
    //console.log(process.env.TOKEN)
    //const comprobantes = await getOrders2('20240101', '20240102')
    // client.connect();
    // for (i = 0; i < comprobantes.length; i++) {
    // await client.query("INSERT INTO mauco.comprobantes (conumreg, fecha_contable, unidad_negocio, tipo_de_comprobante, numero_de_comprobante, fecha_creacion, usuario_creacion_nombre , usuario_creacion_apellido, glosa_comprobante, detalles) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 )", 
    //                 [comprobantes[i].conumreg, comprobantes[i].fecha_contable ,comprobantes[i].unidad_negocio, comprobantes[i].tipo_de_comprobante, comprobantes[i].numero_de_comprobante, comprobantes[i].fecha_creacion, comprobantes[i].usuario_creacion_nombre, comprobantes[i].usuario_creacion_apellido, comprobantes[i].glosa_comprobante, comprobantes[i].detalles]).catch(err => console.log(err))
    //   } 

}

installApp()

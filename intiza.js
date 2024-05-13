var request = require('request');
const { environment } = require('./src/environments');
const { Client } = require('pg');
const soap = require("soap");

var tokenManager = ''

const url = "https://service.intiza.com/soap/data.asmx?wsdl";
const url_escritura = "https://service.intiza.com/soap/integrate.asmx?wsdl";

function postClientToIntiza(array_cliente){
    return new Promise((resolve, reject) => {
        soap.createClient(url_escritura,
            function (err, client) {
                if (err) {
                    console.log('error creando cliente')
                    //console.error(err);
                } else {
                    // Make SOAP request using client object
                    const args = 
                    {   
                        Uid: environment.uid_intiza,
                        Pwd: environment.pass_intiza,
                        Clients:
                        {
                            Client: array_cliente
                        }
                    }
                    client.SetClients(args,
                        function (err, result) {
                            if (err) {
                                reject(null);
                            } else {
                                resolve(result);
                            }
                    });
                }
            });
    })
}

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

function getToday(){
    const date = new Date();

    var day = date.getDate();
    var month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (day < 10){
        day = '0'+day.toString();
    }

    if (month < 10){
        month = '0'+month.toString();
    }

    var currentDate = day.toString()+'-'+month.toString()+'-'+year.toString();

    return currentDate
}

function getDocumentos(dateIni, dateFin, tipoDocumento){
    return new Promise((resolve, reject) => { //
        request.get(
            environment.ApiManagerUrl+'/api/documents/'+environment.RutEmpresa+'/'+tipoDocumento+'/V/?df='+dateIni+'&dt='+dateFin+'&details=1&docnumreg='+folio,
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

//obtener todos los clientes
function getClientes(){
    return new Promise((resolve, reject) => { //
        request.get(
            environment.ApiManagerUrl+'/api/clients/'+environment.RutEmpresa+'/?direcciones=1&contacts=1',
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

function getTesoreriaReport(dateFin, TipoDocumento){
    return new Promise((resolve, reject) => { //
        request.get(
            environment.ApiManagerUrl+'/api/tesoreria/analitico/'+environment.RutEmpresa+'/01-01-2000/'+dateFin+'/',
            {
                json: true,
                headers:{
                    "Authorization" : "Token "+tokenManager
                },
                body:{
                    "analitico_tipo": "",
                    "fecha_filtro": "",
                    "documento_incluir": "S",
                    "monto": "",
                    "cta_ctble": "",
                    "rut": "",
                    "tipodocumento": TipoDocumento,
                    "vendedor": "",
                    "comisionista": "",
                    "cobrador": "",
                    "centro_costo": "",
                    "unidad_negocio": ""
                  }
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body.data)
                }
                else{
                    reject(null)
                }
            }
        )
    });
}

function parseClienteToIntiza(cliente){
    var nombre_completo = ''
    var email_cobranza = ''
    var telefono_cobranza = ''
    var direccion_facturacion = ''
    var plazo_pago_real = ''
    var direccion_real_cobranza = ''
    var region_cobranza = ''
    var comuna_cobranza = ''
    var nombre_completo2 = ''
    var email_cobranza2 = ''
    var telefono_cobranza2 = ''

    if(cliente.contactos.length > 0){
        cliente.contactos.forEach((contacto,index) =>{
            if(contacto.cargo.toUpperCase().includes('COBRANZA')){
                nombre_completo = contacto.nombres+' '+contacto.appaterno
                email_cobranza = contacto.email
                telefono_cobranza = contacto.telefono
                direccion_facturacion = contacto.direccion
            }
            if(contacto.cargo.toUpperCase().includes('COBRANZA-2')){
                nombre_completo2 = contacto.nombres+' '+contacto.appaterno
                email_cobranza2 = contacto.email
                telefono_cobranza2 = contacto.telefono
            }
        })
    }

    if(direccion_facturacion != ''){
        cliente.direcciones.forEach((direccion,index) =>{
            if(direccion.descripcion == direccion_facturacion){
                direccion_real_cobranza = direccion.direccion
                region_cobranza = direccion.region
                comuna_cobranza = direccion.comuna
            }
        })
    }

    if(cliente.plazo_pagos == '1'){
        plazo_pago_real = '7 días'
    }
    if(cliente.plazo_pagos == '2'){
        plazo_pago_real = '15 días'
    }
    if(cliente.plazo_pagos == '3'){
        plazo_pago_real = '30 días'
    }
    if(cliente.plazo_pagos == '4'){
        plazo_pago_real = '45 días'
    }
    if(cliente.plazo_pagos == '5'){
        plazo_pago_real = '60 días'
    }
    if(cliente.plazo_pagos == '6'){
        plazo_pago_real = '90 días'
    }

    const clienteToIntiza = {
        Company_ID: environment.company_id,
        Client_ID: cliente.num_cliente,
        Name: cliente.razon_social,
        Contact: nombre_completo,
        Email: email_cobranza,
        Phone: telefono_cobranza,
        Address: direccion_real_cobranza,
        Notes: "",
        Additionals: {
            Additional: [
                {
                    Name: "Excluir de envíos masivos",
                    Value: ""
                },
                {
                    Name: "Vendedor",
                    Value: cliente.cod_vendedor
                },
                {
                    Name: "Cobrador",
                    Value: cliente.cod_cobrador
                },
                {
                    Name: "Condición",
                    Value: "ACTIVO"
                },
                {
                    Name: "Ruta",
                    Value: cliente.texto2
                },
                {
                    Name: "Cond Pago",
                    Value: plazo_pago_real,
                },
                {
                    Name: "RUT",
                    Value: cliente.rut
                },
                {
                    Name: "Nombre de fantasía",
                    Value: cliente.nombre_fantasia
                },
                {
                    Name: "Comuna",
                    Value: comuna_cobranza
                },
                {
                    Name: "Región",
                    Value: region_cobranza
                }
                ,
                {
                    Name: "Contacto 2",
                    Value: nombre_completo2
                }
                ,
                {
                    Name: "Email 2",
                    Value: email_cobranza2
                }
                ,
                {
                    Name: "Teléfono 2",
                    Value: telefono_cobranza2
                }
            ]
        }  
    }

    return clienteToIntiza
}

var clientes_to_insert = []
var clientes_to_insert2 = []
var clientes_to_insert3 = []
var clientes_to_insert4 = []
var clientes_to_insert5 = []
var clientes_to_insert6 = []
var clientes_to_insert7 = []


async function installApp(){
    console.log('Autorización Manager')
    const token = await Authorization() //Autenticación API Manager+
    tokenManager = token

    var currentDate = getToday() //obtenemos fecha de hoy

    console.log('Obteniendo clientes Manager ...')
    const totalidadClientes = await getClientes();
    console.log('Clientes desde Manager: OK')

    //const facturas = await getDocumentos(currentDate, currentDate,'FAVE') //obtenemos ordenes de despacho con la fecha de hoy
    //const notas_credito = await getDocumentos(currentDate, currentDate,'NCVE') //obtenemos ordenes de despacho con la fecha de hoy
    //const notas_debito = await getDocumentos(currentDate, currentDate,'NDVE') //obtenemos ordenes de despacho con la fecha de hoy

    console.log("Buscando informe de tesorería día: "+currentDate)
    //const informe_tesoreria = await getTesoreriaReport(currentDate,'FAVE')
    console.log("Informe obtenido")

    console.log("Insertando clientes  ...")

    var cantidad_clientes = 0

    await totalidadClientes.forEach((cliente,index) =>{
        try{
            var cliente_to_post = parseClienteToIntiza(cliente)

            if(clientes_to_insert.length <= 999){
                clientes_to_insert.push(cliente_to_post)
            }
            if(clientes_to_insert.length == 1000 && clientes_to_insert2.length <= 999){
                clientes_to_insert2.push(cliente_to_post)
            }
            if(clientes_to_insert2.length == 1000 && clientes_to_insert3.length <= 999){
                clientes_to_insert3.push(cliente_to_post)
            }
            if(clientes_to_insert3.length == 1000 && clientes_to_insert4.length <= 999){
                clientes_to_insert4.push(cliente_to_post)
            }
            if(clientes_to_insert4.length == 1000 && clientes_to_insert5.length <= 999){
                clientes_to_insert5.push(cliente_to_post)
            }
            if(clientes_to_insert5.length == 1000 && clientes_to_insert6.length <= 999){
                clientes_to_insert6.push(cliente_to_post)
            }
            if(clientes_to_insert6.length == 1000 && clientes_to_insert7.length <= 999){
                clientes_to_insert7.push(cliente_to_post)
            }
        }
        catch{
            console.log(cliente.rut+": ERROR")
        }

        cantidad_clientes += 1
    })

    console.log('Cantidad clientes a insertar: '+cantidad_clientes)

    console.log('batch clientes 1: '+clientes_to_insert.length)
    console.log('batch clientes 2: '+clientes_to_insert2.length)
    console.log('batch clientes 3: '+clientes_to_insert3.length)
    console.log('batch clientes 4: '+clientes_to_insert4.length)
    console.log('batch clientes 5: '+clientes_to_insert5.length)
    console.log('batch clientes 6: '+clientes_to_insert6.length)
    console.log('batch clientes 7: '+clientes_to_insert7.length)

    resultPost = await postClientToIntiza(clientes_to_insert)
    resultPost2 = await postClientToIntiza(clientes_to_insert2)
    resultPost3 = await postClientToIntiza(clientes_to_insert3)
    resultPost4 = await postClientToIntiza(clientes_to_insert4)
    resultPost5 = await postClientToIntiza(clientes_to_insert5)
    resultPost6 = await postClientToIntiza(clientes_to_insert6)
    resultPost7 = await postClientToIntiza(clientes_to_insert7)

    console.log('Recibidos: ['+resultPost.SetClientsResult.Received+'] , Procesados: '+resultPost.SetClientsResult.Processed+'] , Estado: ['+resultPost.SetClientsResult.Description+']')
    console.log('Recibidos: ['+resultPost2.SetClientsResult.Received+'] , Procesados: '+resultPost2.SetClientsResult.Processed+'] , Estado: ['+resultPost2.SetClientsResult.Description+']')
    console.log('Recibidos: ['+resultPost3.SetClientsResult.Received+'] , Procesados: '+resultPost3.SetClientsResult.Processed+'] , Estado: ['+resultPost3.SetClientsResult.Description+']')
    console.log('Recibidos: ['+resultPost4.SetClientsResult.Received+'] , Procesados: '+resultPost4.SetClientsResult.Processed+'] , Estado: ['+resultPost4.SetClientsResult.Description+']')
    console.log('Recibidos: ['+resultPost5.SetClientsResult.Received+'] , Procesados: '+resultPost5.SetClientsResult.Processed+'] , Estado: ['+resultPost5.SetClientsResult.Description+']')
    console.log('Recibidos: ['+resultPost6.SetClientsResult.Received+'] , Procesados: '+resultPost6.SetClientsResult.Processed+'] , Estado: ['+resultPost6.SetClientsResult.Description+']')
    console.log('Recibidos: ['+resultPost7.SetClientsResult.Received+'] , Procesados: '+resultPost7.SetClientsResult.Processed+'] , Estado: ['+resultPost7.SetClientsResult.Description+']')
}

async function runApp(){
    await installApp()
}

runApp()
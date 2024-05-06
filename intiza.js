var request = require('request');
const { environment } = require('./src/environments');
const { Client } = require('pg');
const soap = require("soap");

var tokenManager = ''

const url = "https://service.intiza.com/soap/data.asmx?wsdl";
const url_escritura = "https://service.intiza.com/soap/integrate.asmx?wsdl";
 
function getClientsIntiza(page){
    return new Promise((resolve, reject) => {
        soap.createClient(url,
            function (err, client) {
                if (err) {
                    console.error(err);
                } else {
                    // Make SOAP request using client object
                    const args =
                    {
                        uid: environment.uid_intiza,
                        pwd: environment.pass_intiza,
                        company_id: environment.company_id,
                        dateFrom: "20200101",
                        page: page
                    };
                    client.GetClients(args,
                        function (err, result) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(result);
                            }
                    });
                }
            });
    })
}

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

    if (day <= 10){
        day = '0'+day.toString();
    }

    if (month <= 10){
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

//obtener clientes
function getCliente(rutCliente){
    return new Promise((resolve, reject) => { //
        request.get(
            environment.ApiManagerUrl+'/api/clients/'+environment.RutEmpresa+'/'+rutCliente+'/?direcciones=1&contacts=1',
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

function getUniqueValues(dataset){
    const dataArr = new Set(dataset);

    let result = [...dataArr];
  
    return(result);
}

function parseClienteToIntiza(cliente, factura){
    var nombre_completo = cliente.contactos[0].nombres+' '+cliente.contactos[0].appaterno
    var plazo_pago_real = ''
    var vendedor_real = (factura.Vendedor.split(' ')[0][0] + factura.Vendedor.split(' ')[1]).toLowerCase()

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
        Email: cliente.email_contacto,
        Phone: cliente.telefono_contacto,
        Address: cliente.direcciones[0].direccion,
        Notes: "",
        Additionals: {
            Additional: [
                {
                    Name: "Excluir de envíos masivos",
                    Value: ""
                },
                {
                    Name: "Vendedor",
                    Value: vendedor_real
                },
                {
                    Name: "Cobrador",
                    Value: factura.Cobrador
                },
                {
                    Name: "Condición",
                    Value: "ACTIVO"
                },
                {
                    Name: "Ruta",
                    Value: ""
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
                    Value: cliente.direcciones[0].comuna
                },
                {
                    Name: "Región",
                    Value: cliente.direcciones[0].region
                }
            ]
        }  
    }

    return clienteToIntiza
}

var clientes_to_insert = []
var clientes_to_insert2 = []
var clientes_to_insert3 = []

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
    const informe_tesoreria = await getTesoreriaReport(currentDate,'FAVE')
    console.log("Informe obtenido")

    console.log("Insertando clientes  ...")

    var cantidad_clientes = 0

    await informe_tesoreria.forEach((factura,index) =>{
        if(factura.Cobrador != 'Cobranza Oficina'){    
            try{
                var cliente_factura = null

                totalidadClientes.forEach(cliente_antiguo =>{
                    if(cliente_antiguo.rut == factura.RUT){
                        cliente_factura = cliente_antiguo
                    }
                })
                cliente_to_post = parseClienteToIntiza(cliente_factura,factura)

                if(clientes_to_insert.length <= 999){
                    clientes_to_insert.push(cliente_to_post)
                }
                if(clientes_to_insert.length == 1000 && clientes_to_insert2.length <= 999){
                    clientes_to_insert2.push(cliente_to_post)
                }
                if(clientes_to_insert2.length == 1000 && clientes_to_insert3.length <= 999){
                    clientes_to_insert3.push(cliente_to_post)
                }
                
            }
            catch{
                console.log(factura.RUT+": ERROR")
            }

            cantidad_clientes += 1
        }
    })

    console.log('Cantidad clientes a insertar: '+cantidad_clientes)

    console.log('batch clientes 1: '+clientes_to_insert.length)
    console.log('batch clientes 2: '+clientes_to_insert2.length)
    console.log('batch clientes 3: '+clientes_to_insert3.length)

    resultPost = await postClientToIntiza(clientes_to_insert)
    resultPost2 = await postClientToIntiza(clientes_to_insert2)
    resultPost3 = await postClientToIntiza(clientes_to_insert3)

    console.log('Recibidos: ['+resultPost.SetClientsResult.Received+'] , Procesados: '+resultPost.SetClientsResult.Processed+'] , Estado: ['+resultPost.SetClientsResult.Description+']')
    console.log('Recibidos: ['+resultPost2.SetClientsResult.Received+'] , Procesados: '+resultPost2.SetClientsResult.Processed+'] , Estado: ['+resultPost2.SetClientsResult.Description+']')
    console.log('Recibidos: ['+resultPost3.SetClientsResult.Received+'] , Procesados: '+resultPost3.SetClientsResult.Processed+'] , Estado: ['+resultPost3.SetClientsResult.Description+']')
}

async function runApp(){
    await installApp()
}

runApp()
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

function postClientToIntiza(cliente){
    return new Promise((resolve, reject) => {
        soap.createClient(url_escritura,
            function (err, client) {
                if (err) {
                    console.error(err);
                } else {
                    // Make SOAP request using client object
                    const args = cliente
                    client.SetClients(args,
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

function parseClienteToIntiza(cliente,factura){
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
    
    const clienteToIntiza = 
    {
        Uid: environment.uid_intiza,
        Pwd: environment.pass_intiza,
        Clients: 
        {
            Client: {
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
        }
    };

    return clienteToIntiza
}


// var contador_ordenes_ok = 0
// var contador_ordenes_failed = 0

async function installApp(){
    console.log('Autorización Manager')
    const token = await Authorization() //Autenticación API Manager+
    tokenManager = token

    var currentDate = getToday() //obtenemos fecha de hoy

    //const facturas = await getDocumentos(currentDate, currentDate,'FAVE') //obtenemos ordenes de despacho con la fecha de hoy
    //const notas_credito = await getDocumentos(currentDate, currentDate,'NCVE') //obtenemos ordenes de despacho con la fecha de hoy
    //const notas_debito = await getDocumentos(currentDate, currentDate,'NDVE') //obtenemos ordenes de despacho con la fecha de hoy

    console.log("Buscando informe de tesorería día: "+currentDate)
    const informe_tesoreria = await getTesoreriaReport(currentDate,'FAVE')
    console.log("Informe obtenido")

    console.log("Buscando clientes  ...")

    informe_tesoreria.forEach(async (factura,index) =>{
        if(index <= 3){
            if(factura.Cobrador != 'Cobranza Oficina'){    
                console.log('Obteniendo Cliente: '+factura.RUT)
                var cliente = await getCliente(factura.RUT)
                cliente_to_post = parseClienteToIntiza(cliente,factura)
                
                resultPost = await postClientToIntiza(cliente_to_post)
                console.log(factura.RUT+": "+resultPost.SetClientsResult.Description)
            }
        }
        
    })
}

async function runApp(){
    await installApp()
}

runApp()


// OBTENCIÓN DE CLIENTES DESDE INTIZA

// console.log('Obteniendo Clientes Intiza: '+currentDate)
// console.log('---')

// //get Clientes Intiza
// var clientesIntiza = []

// for (i = 1; i < 101; i++) {
//     const clientePage = await getClientsIntiza(i.toString())
//     if(clientePage.GetClientsResult != null){
//         clientePage.GetClientsResult.Client.forEach(element => {
//             clientesIntiza.push(element)
//         });
//         continue
//     }
//     else{
//         break
//     }
// } 

// var clientesActivosIntiza = []

// clientesIntiza.forEach(cliente => {
//     cliente.Additionals.Additional.forEach(additional => {
//         if(additional.Name == 'RUT'){
//             cliente.RUT = additional.Value
//         }
//         if(additional.Name == 'Condición'){
//             cliente.Condicion = additional.Value
//         }
//     });
//     clientesActivosIntiza.push(cliente)
// });

// console.log('Clientes from Intiza obtenidos')
// console.log('---')
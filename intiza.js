var request = require('request');
const { environment } = require('./src/environments');
const { Client } = require('pg');
const soap = require("soap");

var tokenManager = ''

const url = "https://service.intiza.com/soap/data.asmx?wsdl";
const url_escritura = "https://service.intiza.com/soap/integrate.asmx?wsdl";

var clientes_to_insert = []
var clientes_to_insert2 = []
var clientes_to_insert3 = []
var clientes_to_insert4 = []
var clientes_to_insert5 = []
var clientes_to_insert6 = []
var clientes_to_insert7 = []
var clientes_to_insert8 = []

var totalidadClientes = []

var invoice_to_insert = []
var invoice_to_insert1 = []
var invoice_to_insert2 = []

var credito_to_insert = []

var pago_to_insert = []
var pago_to_insert2 = []
var pago_to_insert3 = []
var pago_to_insert4 = []
var pago_to_insert5 = []
var pago_to_insert6 = []
var pago_to_insert7 = []
var pago_to_insert8 = []
var pago_to_insert9 = []

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

function postInvoiceToIntiza(array_invoice){
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
                        Invoices:
                        {
                            Invoice: array_invoice
                        }
                    }
                    client.SetInvoices(args,
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

function postPaymentsToIntiza(array_invoice){
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
                        Payments:
                        {
                            Payment: array_invoice
                        }
                    }
                    client.SetPayments(args,
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

    if (day < 10){
        day = '0'+day.toString();
    }

    if (month < 10){
        month = '0'+month.toString();
    }

    var currentDate = day.toString()+'-'+month.toString()+'-'+year.toString();

    return currentDate
}

function getTodayMinusWeek(){
    const date = new Date();

    var day = date.getDate();
    var month = date.getMonth() - 1;
    const year = date.getFullYear();

    if(day < 0){
        day = 1
    }

    if (day < 10){
        day = '0'+day.toString();
    }

    if (month < 10){
        month = '0'+month.toString();
    }

    var currentDate = day.toString()+'-'+month.toString()+'-'+year.toString();

    return currentDate
}

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
            //environment.ApiManagerUrl+'/api/tesoreria/analitico/'+environment.RutEmpresa+'/15-06-2024/'+dateFin+'/',
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

function getTesoreriaReportSemana(dateIni, dateFin, TipoDocumento){
    return new Promise((resolve, reject) => { //
        request.get(
            //environment.ApiManagerUrl+'/api/tesoreria/analitico/'+environment.RutEmpresa+'/'+dateIni+'/'+dateFin+'/',
            environment.ApiManagerUrl+'/api/tesoreria/analitico/'+environment.RutEmpresa+'/01-01-2024/'+dateFin+'/',
            {
                json: true,
                headers:{
                    "Authorization" : "Token "+tokenManager
                },
                body:{
                    "analitico_tipo": "",
                    "fecha_filtro": "C",
                    "documento_incluir": "C",
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

    if(cliente.vencimiento_pagos == '1'){
        plazo_pago_real = '7 días'
    }
    if(cliente.vencimiento_pagos == '2'){
        plazo_pago_real = '15 días'
    }
    if(cliente.vencimiento_pagos == '3'){
        plazo_pago_real = '30 días'
    }
    if(cliente.vencimiento_pagos == '4'){
        plazo_pago_real = '45 días'
    }
    if(cliente.vencimiento_pagos == '5'){
        plazo_pago_real = '60 días'
    }
    if(cliente.vencimiento_pagos == '6'){
        plazo_pago_real = '0 días'
    }
    if(cliente.vencimiento_pagos == '7'){
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
                ,
                {
                    Name: "Email 1",
                    Value: email_cobranza
                }
            ]
        }  
    }

    return clienteToIntiza
}

function parseFacturaToIntiza(factura,currentDate){
    var nuevaEmittedDate = factura["Fecha emisión"].split('/')[2]+'-'+factura["Fecha emisión"].split('/')[1]+'-'+factura["Fecha emisión"].split('/')[0]
    var nuevaDueDate = factura["Fecha vencimiento"].split('/')[2]+'-'+factura["Fecha vencimiento"].split('/')[1]+'-'+factura["Fecha vencimiento"].split('/')[0]

    const facturaToIntiza = {
        Company_ID: environment.company_id,
        Client_ID: factura.id_cliente,
        Invoice_ID: factura.folio,
        EmittedDate: nuevaEmittedDate,
        Amount: parseFloat(factura.Saldo.replaceAll('.','')),
        Currency_ID: "$",
        ReferenceNumber: factura.folio,
        DueDate: nuevaDueDate,
        Additionals: {
            Additional: [
                {
                    Name: "U. Negocio",
                    Value: factura["U. Negocio"]
                },
                {
                    Name: "Fecha Estado de Factura",
                    Value: ""
                },
                {
                    Name: "Clasificación",
                    Value: factura["Clasificación"]
                },
                {
                    Name: "Tipo de Disputa",
                    Value: ""
                }
            ]
        }  
    }

    return facturaToIntiza
}

function parseCreditoToIntiza(factura,currentDate){
    var nuevaEmittedDate = currentDate.split('-')[2]+'-'+currentDate.split('-')[1]+'-'+currentDate.split('-')[0]

    const creditoToIntiza = {
        Company_ID: environment.company_id,
        Invoice_ID: factura.Referencia.split(' - ')[1],
        Payment_ID: factura.folio,
        Amount: parseFloat(factura.Haber.replaceAll('.','')),
        Date: nuevaEmittedDate, //currentDate en formato nuevo
        Notes: "",
        Type: "",
        Additionals: {}  
    }

    return creditoToIntiza
}

function parseFactToToIntiza(factura,currentDate){
    var nuevaEmittedDate = currentDate.split('-')[2]+'-'+currentDate.split('-')[1]+'-'+currentDate.split('-')[0]

    const creditoToIntiza = {
        Company_ID: environment.company_id,
        Invoice_ID: factura.folio,
        Payment_ID: factura['Cuenta contable']+factura.folio,
        Amount: parseFloat(factura.Haber.replaceAll('.','')),
        Date: nuevaEmittedDate, //currentDate en formato nuevo
        Notes: "",
        Type: "",
        Additionals: {}  
    }

    return creditoToIntiza
}

async function updateClientes(){
    console.log('Autorización Manager')
    const token = await Authorization() //Autenticación API Manager+
    tokenManager = token

    console.log('Obteniendo clientes Manager ...')
    totalidadClientes = await getClientes();
    console.log('Clientes desde Manager: OK')

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
            if(clientes_to_insert7.length == 1000 && clientes_to_insert8.length <= 999){
                clientes_to_insert8.push(cliente_to_post)
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
    console.log('batch clientes 8: '+clientes_to_insert8.length)

    resultPost = await postClientToIntiza(clientes_to_insert)
    resultPost2 = await postClientToIntiza(clientes_to_insert2)
    resultPost3 = await postClientToIntiza(clientes_to_insert3)
    resultPost4 = await postClientToIntiza(clientes_to_insert4)
    resultPost5 = await postClientToIntiza(clientes_to_insert5)
    resultPost6 = await postClientToIntiza(clientes_to_insert6)
    resultPost7 = await postClientToIntiza(clientes_to_insert7)
    resultPost8 = await postClientToIntiza(clientes_to_insert8)

    console.log('Recibidos: ['+resultPost.SetClientsResult.Received+'] , Procesados: '+resultPost.SetClientsResult.Processed+'] , Estado: ['+resultPost.SetClientsResult.Description+']')
    console.log('Recibidos: ['+resultPost2.SetClientsResult.Received+'] , Procesados: '+resultPost2.SetClientsResult.Processed+'] , Estado: ['+resultPost2.SetClientsResult.Description+']')
    console.log('Recibidos: ['+resultPost3.SetClientsResult.Received+'] , Procesados: '+resultPost3.SetClientsResult.Processed+'] , Estado: ['+resultPost3.SetClientsResult.Description+']')
    console.log('Recibidos: ['+resultPost4.SetClientsResult.Received+'] , Procesados: '+resultPost4.SetClientsResult.Processed+'] , Estado: ['+resultPost4.SetClientsResult.Description+']')
    console.log('Recibidos: ['+resultPost5.SetClientsResult.Received+'] , Procesados: '+resultPost5.SetClientsResult.Processed+'] , Estado: ['+resultPost5.SetClientsResult.Description+']')
    console.log('Recibidos: ['+resultPost6.SetClientsResult.Received+'] , Procesados: '+resultPost6.SetClientsResult.Processed+'] , Estado: ['+resultPost6.SetClientsResult.Description+']')
    console.log('Recibidos: ['+resultPost7.SetClientsResult.Received+'] , Procesados: '+resultPost7.SetClientsResult.Processed+'] , Estado: ['+resultPost7.SetClientsResult.Description+']')
    console.log('Recibidos: ['+resultPost8.SetClientsResult.Received+'] , Procesados: '+resultPost8.SetClientsResult.Processed+'] , Estado: ['+resultPost8.SetClientsResult.Description+']')

}

async function updateFacturas(){
    console.log('Autorización Manager')
    const token = await Authorization() //Autenticación API Manager+
    tokenManager = token

    var currentDate = getToday() //obtenemos fecha de hoy

    console.log("Buscando informe de tesorería día: "+currentDate)
    const informe_tesoreria = await getTesoreriaReport(currentDate,'FAVE')
    console.log("Informe obtenido")

    var contador_facturas = 0

    await informe_tesoreria.forEach((factura,index) =>{
        if(factura.Cobrador != 'Cobranza Oficina'){
            totalidadClientes.forEach((cliente)=>{
                if(cliente.rut == factura.RUT){

                    factura.id_cliente = cliente.num_cliente
                    var invoice_to_post = parseFacturaToIntiza(factura,currentDate)

                    if(invoice_to_post.EmittedDate == '' || invoice_to_post.EmittedDate == null){
                        console.log(invoice_to_post)
                    }

                    if(invoice_to_insert.length <= 999){
                        invoice_to_insert.push(invoice_to_post)
                    }
                    if(invoice_to_insert.length == 1000 && invoice_to_insert1.length <= 999){
                        invoice_to_insert1.push(invoice_to_post)
                    }
                }
            })
            contador_facturas += 1
        }
    })

    console.log('Cantidad facturas a insertar: '+contador_facturas)

    console.log('batch clientes 1: '+invoice_to_insert.length)
    console.log('batch clientes 2: '+invoice_to_insert1.length)

    resultPost = await postInvoiceToIntiza(invoice_to_insert)
    resultPost2 = await postInvoiceToIntiza(invoice_to_insert1)

    console.log('Recibidos: ['+resultPost.SetInvoicesResult.Received+'] , Procesados: '+resultPost.SetInvoicesResult.Processed+'] , Estado: ['+resultPost.SetInvoicesResult.Description+']')
    console.log('Recibidos: ['+resultPost2.SetInvoicesResult.Received+'] , Procesados: '+resultPost2.SetInvoicesResult.Processed+'] , Estado: ['+resultPost2.SetInvoicesResult.Description+']')
}

async function updateCredito(){
    console.log('Autorización Manager')
    const token = await Authorization() //Autenticación API Manager+
    tokenManager = token

    var currentDate = getToday() //obtenemos fecha de hoy

    console.log("Buscando informe de tesorería día: "+currentDate)
    const informe_tesoreria = await getTesoreriaReport(currentDate,'NCVE') //notas de crédito
    //const informe_tesoreria2 = await getTesoreriaReport(currentDate,'NDVE') //notas de débido

    console.log("Informe obtenido")

    var contador_facturas = 0

    await informe_tesoreria.forEach((factura,index) =>{
        totalidadClientes.forEach((cliente)=>{
            if(cliente.rut == factura.RUT){

                factura.id_cliente = cliente.num_cliente
                var creditoToPost = parseCreditoToIntiza(factura,currentDate)

                if(credito_to_insert.length <= 999){
                    credito_to_insert.push(creditoToPost)
                }
            }
        })
        contador_facturas += 1   
    })

    console.log('Cantidad de pagos a insertar: '+contador_facturas)

    console.log('batch Pagos-1: '+credito_to_insert.length)

    resultPost = await postPaymentsToIntiza(credito_to_insert)

    console.log('Recibidos: ['+resultPost.SetPaymentsResult.Received+'] , Procesados: '+resultPost.SetPaymentsResult.Processed+']')// , Estado: ['+resultPost.SetPaymentsResult.Description+']')
}

async function updateFacturasPagadasManual(){
    console.log('Autorización Manager')
    const token = await Authorization() //Autenticación API Manager+
    tokenManager = token

    var weekDay = getTodayMinusWeek()
    var currentDate = getToday() //obtenemos fecha de hoy

    // console.log('Obteniendo clientes Manager ...')
    // totalidadClientes = await getClientes();
    // console.log('Clientes desde Manager: OK')

    console.log("Buscando informe de tesorería día: "+currentDate)
    const informe_tesoreria = await getTesoreriaReportSemana(weekDay, currentDate,'FAVE') //notas de crédito

    console.log("Informe obtenido")

    var contador_facturas = 0

    await informe_tesoreria.forEach((factura,index) =>{
        totalidadClientes.forEach((cliente)=>{
            if(cliente.rut == factura.RUT){

                factura.id_cliente = cliente.num_cliente
                var creditoToPost = parseFactToToIntiza(factura,currentDate)

                if(pago_to_insert.length <= 999){
                    pago_to_insert.push(creditoToPost)
                }
                if(pago_to_insert.length == 1000 && pago_to_insert2.length <= 999){
                    pago_to_insert2.push(creditoToPost)
                }
                if(pago_to_insert2.length == 1000 && pago_to_insert3.length <= 999){
                    pago_to_insert3.push(creditoToPost)
                }
                if(pago_to_insert3.length == 1000 && pago_to_insert4.length <= 999){
                    pago_to_insert4.push(creditoToPost)
                }
                if(pago_to_insert4.length == 1000 && pago_to_insert5.length <= 999){
                    pago_to_insert5.push(creditoToPost)
                }
                if(pago_to_insert5.length == 1000 && pago_to_insert6.length <= 999){
                    pago_to_insert6.push(creditoToPost)
                }
                if(pago_to_insert6.length == 1000 && pago_to_insert7.length <= 999){
                    pago_to_insert7.push(creditoToPost)
                }
                if(pago_to_insert7.length == 1000 && pago_to_insert8.length <= 999){
                    pago_to_insert8.push(creditoToPost)
                }
                if(pago_to_insert8.length == 1000 && pago_to_insert9.length <= 999){
                    pago_to_insert9.push(creditoToPost)
                }
            }
        })
        contador_facturas += 1   
    })

    console.log('Cantidad de pagos Manuales a insertar: '+contador_facturas)

    console.log('batch Pagos-1: '+pago_to_insert.length)
    console.log('batch Pagos-2: '+pago_to_insert2.length)
    console.log('batch Pagos-3: '+pago_to_insert3.length)
    console.log('batch Pagos-4: '+pago_to_insert4.length)
    console.log('batch Pagos-5: '+pago_to_insert5.length)
    console.log('batch Pagos-6: '+pago_to_insert6.length)
    console.log('batch Pagos-7: '+pago_to_insert7.length)
    console.log('batch Pagos-8: '+pago_to_insert8.length)
    console.log('batch Pagos-9: '+pago_to_insert9.length)

    resultPost = await postPaymentsToIntiza(pago_to_insert)
    resultPost2 = await postPaymentsToIntiza(pago_to_insert2)
    resultPost3 = await postPaymentsToIntiza(pago_to_insert3)
    resultPost4 = await postPaymentsToIntiza(pago_to_insert4)
    resultPost5 = await postPaymentsToIntiza(pago_to_insert5)
    resultPost6 = await postPaymentsToIntiza(pago_to_insert6)
    resultPost7 = await postPaymentsToIntiza(pago_to_insert7)
    resultPost8 = await postPaymentsToIntiza(pago_to_insert8)
    resultPost9 = await postPaymentsToIntiza(pago_to_insert9)

    console.log('1.- Recibidos: ['+resultPost.SetPaymentsResult.Received+'] , Procesados: '+resultPost.SetPaymentsResult.Processed+']')  // , Estado: ['+resultPost.SetPaymentsResult.Description+']')
    console.log('2.- Recibidos: ['+resultPost2.SetPaymentsResult.Received+'] , Procesados: '+resultPost2.SetPaymentsResult.Processed+']') //, Estado: ['+resultPost2.SetPaymentsResult.Description+']')
    console.log('3.- Recibidos: ['+resultPost3.SetPaymentsResult.Received+'] , Procesados: '+resultPost3.SetPaymentsResult.Processed+']') //, Estado: ['+resultPost3.SetPaymentsResult.Description+']')
    console.log('4.- Recibidos: ['+resultPost4.SetPaymentsResult.Received+'] , Procesados: '+resultPost4.SetPaymentsResult.Processed+']') //, Estado: ['+resultPost4.SetPaymentsResult.Description+']')
    console.log('5.- Recibidos: ['+resultPost5.SetPaymentsResult.Received+'] , Procesados: '+resultPost5.SetPaymentsResult.Processed+']') //, Estado: ['+resultPost5.SetPaymentsResult.Description+']')
    console.log('6.- Recibidos: ['+resultPost6.SetPaymentsResult.Received+'] , Procesados: '+resultPost6.SetPaymentsResult.Processed+']') //, Estado: ['+resultPost6.SetPaymentsResult.Description+']')
    console.log('7.- Recibidos: ['+resultPost7.SetPaymentsResult.Received+'] , Procesados: '+resultPost7.SetPaymentsResult.Processed+']') //, Estado: ['+resultPost7.SetPaymentsResult.Description+']')
    console.log('8.- Recibidos: ['+resultPost8.SetPaymentsResult.Received+'] , Procesados: '+resultPost8.SetPaymentsResult.Processed+']') //, Estado: ['+resultPost8.SetPaymentsResult.Description+']')
    console.log('9.- Recibidos: ['+resultPost9.SetPaymentsResult.Received+'] , Procesados: '+resultPost9.SetPaymentsResult.Processed+']') //, Estado: ['+resultPost9.SetPaymentsResult.Description+']')

}

async function runApp(){
    await updateClientes()
    await updateFacturas()
    await updateCredito()
    await updateFacturasPagadasManual()
}

runApp()
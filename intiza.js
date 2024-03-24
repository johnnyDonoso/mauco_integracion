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

function getClienteIntiza(){
    return new Promise((resolve, reject) => { //
        request.get(
            'https://service.intiza.com/soap/data.asmx',
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

// var contador_ordenes_ok = 0
// var contador_ordenes_failed = 0

async function installApp(){
    
    //AGREGAR BODEGA DEL ITEM
    console.log('Autorización Manager')
    const token = await Authorization() //Autenticación API Manager+
    tokenManager = token

    var currentDate = getToday() //obtenemos fecha de hoy
    console.log('Obteniendo ÓRDENES del día: '+currentDate)
    console.log('---')

    //const facturas = await getDocumentos(currentDate, currentDate,'FAVE') //obtenemos ordenes de despacho con la fecha de hoy
    //const notas_credito = await getDocumentos(currentDate, currentDate,'NCVE') //obtenemos ordenes de despacho con la fecha de hoy
    //const notas_debito = await getDocumentos(currentDate, currentDate,'NDVE') //obtenemos ordenes de despacho con la fecha de hoy

    const informe_tesoreria = await getTesoreriaReport(currentDate,'FAVE')
    //console.log(informe_tesoreria)

    var ruts_cliente = []

    informe_tesoreria.forEach(async (obj,index) =>{
        if(obj.Cobrador != 'Cobranza Oficina'){
            ruts_cliente.push(obj.RUT)

            //console.log('Obteniendo Cliente: '+obj.rut_cliente)
            var cliente = await getCliente(obj.RUT)

            // var direcciones = cliente.direcciones

            // direcciones.forEach(async (direccion, index) =>{
            //     if(direccion.descripcion == obj.dire_cliente){
            //         //console.log(direccion)
            //         cliente.direccion_larga = direccion.direccion
            //         cliente.comuna_cliente = direccion.comuna
            //         cliente.region_cliente = direccion.region
            //     }
            // })

            console.log(cliente)
        }
    })

    // var ruts_unicos_clientes = new Set(ruts_cliente)

    // console.log(ruts_unicos_clientes.size)

    

    // ruts_unicos_clientes.forEach(async (rut_cliente,index) =>{
    //     console.log(rut_cliente)

        
        
    // })
    

        // var contactos = cliente.contactos
        // contactos.forEach(async (contacto, index) =>{
        //     if(contacto.cargo.toUpperCase().includes("COBRANZA") || contacto.cargo.toUpperCase().includes("PAGO")){
        //         //console.log(obj)
        //         console.log(cliente)
        //         //console.log(contacto)
        //         // obj.dire_cliente_larga = direccion.direccion
        //         // obj.comuna_cliente = direccion.comuna
        //         // obj.region_cliente = direccion.region
        //         // obj.id_direccion = index
        //         // cliente.nombre_contacto_direccion = direccion.atencion
        //         // cliente.email_contacto_direccion = direccion.emaildir
        //         // cliente.telefono_contacto_direccion = direccion.telefono
        //     }
        // })
    //})

}

async function runApp(){
    await installApp()
}

runApp()
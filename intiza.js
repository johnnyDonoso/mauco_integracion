var request = require('request');
const { environment } = require('./src/environments');
const { Client } = require('pg');
const soap = require("soap");

var tokenManager = ''

const url = "https://service.intiza.com/soap/data.asmx?wsdl";
 
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


// var contador_ordenes_ok = 0
// var contador_ordenes_failed = 0

async function installApp(){
    
    //AGREGAR BODEGA DEL ITEM
    console.log('Autorización Manager')
    const token = await Authorization() //Autenticación API Manager+
    tokenManager = token

    var currentDate = getToday() //obtenemos fecha de hoy
    console.log('Obteniendo Clientes Intiza: '+currentDate)
    console.log('---')

    //get Clientes Intiza
    var clientesIntiza = []

    for (i = 1; i < 101; i++) {
        const clientePage = await getClientsIntiza(i.toString())
        if(clientePage.GetClientsResult != null){
            clientePage.GetClientsResult.Client.forEach(element => {
                clientesIntiza.push(element)
            });
            continue
        }
        else{
            break
        }
    } 

    console.log('Clientes from Intiza obtenidos')
    console.log('---')

    var clientesActivosIntiza = []

    clientesIntiza.forEach(cliente => {
        cliente.Additionals.Additional.forEach(additional => {
            if(additional.Name == 'RUT'){
                cliente.RUT = additional.Value
            }
            if(additional.Name == 'Condición'){
                cliente.Condicion = additional.Value
            }
        });

        if(cliente.Condicion == 'ACTIVO'){
            clientesActivosIntiza.push(cliente)
        }    
    });

    console.log(clientesActivosIntiza.length)

    //const facturas = await getDocumentos(currentDate, currentDate,'FAVE') //obtenemos ordenes de despacho con la fecha de hoy
    //const notas_credito = await getDocumentos(currentDate, currentDate,'NCVE') //obtenemos ordenes de despacho con la fecha de hoy
    //const notas_debito = await getDocumentos(currentDate, currentDate,'NDVE') //obtenemos ordenes de despacho con la fecha de hoy

    const informe_tesoreria = await getTesoreriaReport(currentDate,'FAVE')
    // //console.log(informe_tesoreria)


    informe_tesoreria.forEach(async (obj,index) =>{
        if(obj.Cobrador != 'Cobranza Oficina'){
            //console.log('Obteniendo Cliente: '+obj.rut_cliente)
            //var cliente = await getCliente(obj.RUT)
            // var direcciones = cliente.direcciones
            //console.log(cliente)
            var isClientAdded = false
            clientesActivosIntiza.forEach(act_cliente => {
                if(act_cliente.RUT == obj.RUT){
                    console.log('cliente ya está ingresado')
                    isClientAdded = true
                }
            });

            if(isClientAdded == false)
            {
                console.log(obj)
            }

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
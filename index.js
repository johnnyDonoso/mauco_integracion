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

async function installApp(){
    const token = await Authorization()
    process.env.TOKEN = token

    documentos = await getComprobantes('20240101', '20240105')
    //console.log(documentos.glosa_comprobante)
    for (i = 0; i < documentos.length; i++) {
        console.log(documentos[i])
    } 
    
    //console.log(token)
    //console.log(process.env.TOKEN)
    //const comprobantes = await getOrders2('20240101', '20240102')
    // client.connect();
    // for (i = 0; i < comprobantes.length; i++) {
    //     await client.query("INSERT INTO mauco.comprobantes (conumreg, fecha_contable, unidad_negocio, tipo_de_comprobante, numero_de_comprobante, fecha_creacion, usuario_creacion_nombre , usuario_creacion_apellido, glosa_comprobante, detalles) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 )", 
    //                     [comprobantes[i].conumreg, comprobantes[i].fecha_contable ,comprobantes[i].unidad_negocio, comprobantes[i].tipo_de_comprobante, comprobantes[i].numero_de_comprobante, comprobantes[i].fecha_creacion, comprobantes[i].usuario_creacion_nombre, comprobantes[i].usuario_creacion_apellido, comprobantes[i].glosa_comprobante, comprobantes[i].detalles]).catch(err => console.log(err))
    //   } 
    // client.end()
    
}

installApp()

const mail = require('./mail');
const http = require('http');
const url = require('url');
const fs = require('fs');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

http.createServer( (req,res) => {
        let { correos,asunto,contenido } = url.parse(req.url,true).query;
        if (req.url == '/') {
            res.setHeader('content-type','text/html');
            fs.readFile('index.html','utf8',(err,data) => {
                res.end(!err ? data : 'Ha ocurrido un error');
            })
        }

        if (req.url.startsWith('/mailing')) {
            let Dolar;
            let Euro;
            let UF;
            let UTM;
            async function dataApi() {
                let { data } = await axios.get('https://mindicador.cl/api');
                Dolar = data.dolar.valor;
                Euro = data.euro.valor;
                UF = data.uf.valor;
                UTM = data.utm.valor;
            }
            dataApi()
                .then( () => { 
                    contenido += `\nEl valor del dólar del día de hoy es: ${Dolar}
                    \nEl valor del euro del día de hoy es: ${Euro}
                    \nEl valor del uf del día de hoy es: ${UF}
                    \nEl valor del utm del día de hoy es: ${UTM}`;
                    return correos,asunto,contenido;
                })
                .then( () => { 
                    if ( (correos !== '') && (asunto !== '') && (contenido !== '') && (correos.includes(','))) {
                        mail(correos.split(','),asunto,contenido);
                        console.log(`Destinatarios: ${correos}`);
                        res.write('Envio Exitoso.');
                        res.end();
                        let idCorreo = uuidv4();
                        fs.writeFile(`Spam_Economy_${idCorreo}`,
                        `Correos:${correos}\n\nAsunto: ${asunto}\n\nContenido:\n${contenido}`,
                        'utf8', () => {
                                console.log(`Spam_Economy_${idCorreo} creado`);
                            })
                    }
                    else {
                        res.write('Error de campos, intenta nuevamente');
                        res.end();
                    }
                });
            
        }
    })
    .listen(3000,() => { console.log('Puerto 3000 Exitoso')})
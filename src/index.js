const express = require('express')
const app = express()
const morgan = require('morgan')
const port = 3000
const path = require('path')
const handlebars = require('express-handlebars')
const probe = require('probe-image-size');

app.use(morgan('combined'))
app.engine('handlebars', handlebars())
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'resources/views'))
app.use(express.static(path.join(__dirname, '/resources')));
var recogn = require('./recognize.js');
var result;
var ratio;
app.get('/', (req, res) => {
    res.render('home')
})
app.get('/library', (req, res) => {
    res.render('library')
})
app.get('/addPerson', (req, res) => {
    console.log(result)
    res.render('addPerson')
})
app.get('/search', (req, res) => {

    if (Object.keys(req.query).length > 0) {
        link = req.query.link
        width = req.query.width




        result = recogn.recognize(link)
        if (typeof (result) == "undefined") {
            res.render('search', {
                title: 'abc',
                link: 'https://picsum.photos/500/500',
                inform: 'khong tim thay khuon mat nao'
            })
        }
        else {
            async function changsize() {
                let originImg = await probe(link);
                ratio = originImg.width / width;
                console.log(ratio)

                result.forEach(function (item) {
                    item.face.top = item.face.top / ratio;
                    item.face.left = item.face.left / ratio;
                    item.face.width = item.face.width / ratio;
                    item.face.height = item.face.height / ratio;
                    console.log(item.face.top)
                    if (item.person.id == 0)
                        console.log('mot khuon mat khong nhan dien dc')

                });

            }
            result.forEach(function (item) {
                console.log(item.face.top)
            })
            changsize().then(() => {

                res.render('search', {
                    link: link,
                    result: result
                })
            })
        }

    }
    else {
        res.render('search', {
            title: 'abc',
            link: 'https://picsum.photos/500/500'
        })
    }

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

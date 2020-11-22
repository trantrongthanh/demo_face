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

//Nhut
const cloudinary = require('cloudinary').v2;
var resource = []

cloudinary.config({
    cloud_name: 'iuhcongnghemoi',
    api_key: '999481664635386',
    api_secret: 'GUfv84rFUSuz6RMM5Qj06VYBUN4'
});
//Nhut

var link;
var result;
var ratio;
app.get('/', (req, res) => {
    res.render('home')
})
app.get('/library', (req, res) => {
    cloudinary.api.sub_folders("image",
        function (error, subf) {

            for (let i = 0; i < subf.folders.length; i++) {
                console.log(subf.folders[i].path);

                cloudinary.api.resources({
                    type: 'upload',
                    prefix: subf.folders[i].path,
                    max_results: 100
                }, function (error, results) {
                    let obj = {
                        ress: results.resources,
                        lbl: subf.folders[i].name
                    }
                    resource[i] = obj
                });
            }
            setTimeout(() => {
                resource.forEach(function (each) {
                    console.log(each.ress);
                })

                res.render('library', {
                    result: resource
                })
            }, 1000);

        });
})
app.get('/addPerson', (req, res) => {

    var unknowList = [];
    result.forEach(function (item) {
        if (item.person.id == 0)
            unknowList.push(item)
    })
    if (unknowList.length > 0) {
        unknowList.forEach(function (item) {
            item.inputTop = item.face.top - 30;
            item.inputLeft = item.face.left;
            item.inputWidth = item.face.width;

        })
        if (Object.keys(req.query).length > 0) {
            var listName = req.query.name;
            index = 0;
            unknowList.forEach(function (item) {
                item.name = listName[index];
                index++

            })

            addPersons(link, unknowList)

        }

        res.render('addPerson',
            {
                link: link,
                unknowList: unknowList
            })
    }
    else
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
                link: link,
                inform: 'khong tim thay khuon mat nao'
            })
        }
        else {
            async function changsize() {
                let originImg = await probe(link);
                ratio = originImg.width / width;
                result.forEach(function (item) {
                    item.face.top = item.face.top / ratio;
                    item.face.left = item.face.left / ratio;
                    item.face.width = item.face.width / ratio;
                    item.face.height = item.face.height / ratio;
                    item.inputTop = item.face.top - 30;
                    item.inputLeft = item.face.left;
                    if (item.person.id == 0)
                        console.log('mot khuon mat khong nhan dien dc')
                });
            }
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

function addPersons(link, persons) {
    console.log(persons)
}
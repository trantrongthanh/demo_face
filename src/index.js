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

//Load các file js
var recogn = require('./recognize.js');
var submitFace = require('./submit.js');
var library = require('./library.js');
var upload = require('./upload.js');

//Load data cần thiết
var idolPerson = submitFace.getListPerson()

var link;
var ratio;
// variable for upload
var result
var unknowList
var knownList

app.get('/', (req, res) => {
    var resource = library.getAllImage()
    res.render('home', {
        results: resource
    })
})

app.get('/album', (req, res) => {
    lbl = req.query.l
    library.getOneAlbum(res, lbl)
})

app.get('/library', (req, res) => {
    var listAlbum = library.getListAlbum()
    res.render('library', { result: listAlbum })
})
app.get('/upload', (req, res) => {

    if (Object.keys(req.query).length > 0) {
        if (req.query.category == 'search') {
            result = []
            unknowList = []
            knownList = []
            link = req.query.link
            width = req.query.width
            result = recogn.recognize(link, idolPerson)
            // console.log(result)
            if (typeof (result) == "undefined") {
                res.render('upload', {
                    link: link
                })
            }
            else {
                changsize(result, link, width).then(() => {
                    result.forEach(function (item) {
                        if (item.person.name == '#unknown')
                            unknowList.push(item)
                        else
                            knownList.push(item)
                    })
                    res.render('upload', {
                        link: link,
                        unknowList: unknowList,
                        knownList: knownList,
                    })
                })
            }
        }
        if (req.query.category == 'upload') {
            async function task() {
                let uploadLink = {}
                uploadLink.link = link

                await library.uploadImage(uploadLink)
                if (knownList.length > 0) {
                    knownList.forEach(function (item) {
                        item.name = item.person.name;
                    })
                    console.log(knownList)
                    addPerson(uploadLink.link, knownList)
                }
                if (unknowList.length > 0) {
                    var listName = req.query.name;
                    index = 0;
                    unknowList.forEach(function (item) {
                        if (typeof listName == 'string')
                            item.name = listName;
                        else
                            item.name = listName[index];
                        index++
                    })
                    unknowList = unknowList.filter(function (item) {
                        return item.name != ''
                    })
                    if (unknowList.length > 0) {
                        addPerson(uploadLink.link, unknowList)
                    }
                }
                library.loadAllImage()
                submitFace.train()
            }
            task()
            res.render('upload', {
                link: link,
                inform: 'Upload thành công'
            })
        }
    }
    else
        res.render('upload', { link: 'https://res.cloudinary.com/iuhcongnghemoi/image/upload/v1606579573/All_image/0eaHxIb_akvcqz.jpg' })
})

app.get('/search', (req, res) => {
    var result = []
    if (Object.keys(req.query).length > 0) {
        link = req.query.link
        width = req.query.width

        result = recogn.recognize(link, idolPerson)
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
                    item.face.top_new = item.face.top / ratio;
                    item.face.left_new = item.face.left / ratio;
                    item.face.width_new = item.face.width / ratio;
                    item.face.height_new = item.face.height / ratio;
                    item.inputTop = item.face.top_new - 30;
                    item.inputLeft = item.face.left_new;
                    if (item.person.id == 0)
                        console.log('mot khuon mat khong nhan dien dc')
                });
            }
            changsize().then(() => {
                console.log(result)
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
            link: 'https://esben.qodeinteractive.com/wp-content/uploads/2017/07/home-03-img-3.jpg'
        })
    }

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

async function changsize(result, link, width) {
    let originImg = await probe(link);
    ratio = originImg.width / width;
    result.forEach(function (item) {
        item.face.top_new = item.face.top / ratio;
        item.face.left_new = item.face.left / ratio;
        item.face.width_new = item.face.width / ratio;
        item.face.height_new = item.face.height / ratio;
        item.inputTop = item.face.top_new - 30;
        item.inputLeft = item.face.left_new;
        item.inputWidth = item.face.width_new;
        if (item.person.id == 0)
            console.log('mot khuon mat khong nhan dien dc')
    });
}
function addPerson(link, persons) {
    let cropLink = {}
    cropLink.link = link

    //cắt khuôn mặt và thêm link khuôn mặt được cắt vào thuộc tính của person
    upload.addLinkCropFace(persons, link)
    persons.forEach(function (item) {
        person = idolPerson.filter(person => person.name == item.name)[0]
        if (typeof person == 'undefined')
            submitFace.submitOnePerson(item.name, item.face_link)
        else
            submitFace.submitIdolFace(person.personId, item.face_link)
        idolPerson = submitFace.getListPerson()
    })
}

// var names;
// async function getNames() {
//     cloudinary.api.sub_folders("image",
//         await function (error, subf) {
//             names = subf.folders
//         })
// }
// getNames()
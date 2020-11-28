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

//Load data cần thiết
var idolPerson = submitFace.getListPerson()

var link;
var result;
var ratio;

app.get('/', (req, res) => {
    var resource = library.getAllImage()
    res.render('home', {
        results: resource
    })
})

app.get('/album', (req, res) => {
    lbl = req.query.l
    library.getOneAlbum(res, lbl)
    
    // res.render('album', {
    //     results: results.resources,
    //     lbl: lbl
    // })

})

app.get('/library', (req, res) => {
    var listAlbum = library.getListAlbum()
    res.render('library', { result: listAlbum })
})
app.get('/addPerson', (req, res) => {
    var unknowList = []
    var knownList = []
    result.forEach(function (item) {
        if (item.person.name == '#unknown')
            unknowList.push(item)
        else
            knownList.push(item)
    })
    if (knownList.length > 0) {
        knownList.forEach(function (item) {
            item.name = item.person.name;
        })
        console.log(knownList)
        addPersons(link, knownList)
    }
    if (unknowList.length > 0) {
        // console.log(unknowList)
        unknowList.forEach(function (item) {
            item.inputTop = item.face.top_new - 30;
            item.inputLeft = item.face.left_new;
            item.inputWidth = item.face.width_new;
        })
        if (Object.keys(req.query).length > 0) {
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
                addPersons(link, unknowList)
            }
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

function addPersons(link, persons) {

    library.uploadImage().then(() => {
        persons.forEach(function (item) {
            n = item.face.width
            y = Math.round(item.face.top - 0.25 * n)
            x = Math.round(item.face.left - 0.25 * n)
            width = Math.round(item.face.width * 1.7)
            height = Math.round(item.face.height * 1.7)
            crop = 'c_crop,h_' + height + ',w_' + width + ',x_' + x + ',y_' + y + ''
            splitLink = link.split('/');
            face_link = ''
            for (i = 0; i < splitLink.length; i++) {
                if (i == 0)
                    face_link += splitLink[i]
                else if (splitLink[i] == 'upload')
                    face_link += '/' + splitLink[i] + '/' + crop
                else
                    face_link += '/' + splitLink[i]

            }
            item.face_link = face_link
            console.log('Link:')
            console.log(face_link)
        })
        persons.forEach(function (item) {
            person = idolPerson.filter(person => person.name == item.name)[0]
            console.log(person)
            if (typeof person == 'undefined')
                submitFace.submitOnePerson(item.name, item.face_link)
            else
                submitFace.submitIdolFace(person.personId, item.face_link)
            idolPerson = submitFace.getListPerson()
        })
        submitFace.train()
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
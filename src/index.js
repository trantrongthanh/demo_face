const express = require('express')
const app = express()
const morgan = require('morgan')
const port = 3000
const path = require('path')
const handlebars = require('express-handlebars')

app.use(morgan('combined'))
app.engine('handlebars', handlebars())
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'resources/views'))
app.use(express.static(path.join(__dirname, '/resources')));
var recogn = require('./test.js');

app.get('/', (req, res) => {

    if (Object.keys(req.query).length > 0) {
        link = req.query.link
        var result = recogn.recognize(link)
        
        res.render('home', {
            link: link,
            result: result
        })
    }
    else
        res.render('home', {
            title: 'abc',
            link: 'https://picsum.photos/500/500'
        })
    {

    }

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

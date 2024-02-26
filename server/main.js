const fs = require('fs')
const path = require('path')
const express = require('express')
const fileupload = require('express-fileupload')
const cors = require('cors')

// Boilerplate app statements

const app = express()

app.use(fileupload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}))
app.use(express.json())
app.use(cors({ origin: "*", }))

// helper functions

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

function formatDate(date) {
    return (
        [
            date.getFullYear(),
            padTo2Digits(date.getMonth() + 1),
            padTo2Digits(date.getDate()),
        ].join('-') +
        ' ' +
        [
            padTo2Digits(date.getHours()),
            padTo2Digits(date.getMinutes()),
            padTo2Digits(date.getSeconds()),
        ].join(':')
    );
}

// Routes
// Sends the filenames under the uploads sibling directory
app.get('/sync', (req, res) => {
    try {
        fs.appendFile('connections.txt', `${formatDate(new Date())} ${req.ip} / \n`, function (err) {
            if (err) return res.sendStatus(500)
        });

        res.json({ files: fs.readdirSync('./uploads') })
    } catch (error) {
        console.error(error);
        res.sendStatus(500)
    }
})

app.post('/upload-file', async (req, res) => {
    try {
        const files = req.files.upload
        fs.appendFile('connections.txt', `${formatDate(new Date())} ${req.ip} /upload \n`, function (err) {
            if (err) return res.sendStatus(500)
        });
        if(typeof files[Symbol.iterator] === 'function'){
            for(const file of files){
                console.log('saving: '+file.name)
                await file.mv(`./uploads/${file.name}`)
            }
        }else{
            console.log('saving: '+files.name)
            await files.mv(`./uploads/${files.name}`)
        }
        res.status(200).json({ files: fs.readdirSync('./uploads') })

    } catch (error) {
        console.error(error);
        res.sendStatus(500)
    }

})

app.delete('/delete', async (req, res) => {
    try {
        const filename = req.query.filename
        fs.appendFile('connections.txt', `${formatDate(new Date())} ${req.ip} /delete?filename=${filename} \n`, function (err) {
            if (err) return res.sendStatus(500)
        });
        await fs.promises.rm(`./uploads/${filename}`)
        res.status(200).json({ files: fs.readdirSync('./uploads') })
    } catch (error) {
        console.error(error);
        res.sendStatus(500)
    }

})

// Sends a file contents to Browser
app.get('/retrieve', (req, res) => {
    try {
        const filename = req.query.filename
        fs.appendFile('connections.txt', `${formatDate(new Date())} ${req.ip} /retrieve?filename=${filename} \n`, function (err) {
            if (err) return res.sendStatus(500)
        });
        console.log(filename)
        res.sendFile(path.join(__dirname, 'uploads', filename))

    } catch (error) {
        console.error(error);
        res.sendStatus(404)
    }
})
app.get("/",(req,res)=>{
    return "wecome to sebah file sharing app"
})
app.listen(8008)
const { createServer } = require('http')
const router = require('./services/router')
const { host, port } = require('./utils/config')

const server = createServer((req, res) => {
    router.lookup(req, res)
})

server.listen(port, host, err => {
    if (err) {
        console.error(err)
    }
})

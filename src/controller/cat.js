const catModel = require('../model/cat')
const userModel = require('../model/user')
const { v4: uuid } = require('uuid')

const getNotFoundResponse = (res) => {
    res.writeHead(404)
    return {
        error: {
            message: "Not found",
            code: 404
        }
    }
}

const getUnprocessableEntityResponse = (res) => {
    res.writeHead(422)
    return {
        error: {
            message: "Unprocessable Entity",
            code: 422
        }
    }
} 

const parseJsonBody = (request) => new Promise((resolve, reject) => {
    let rawJson = ''
    request
        .on('data', (chunk) => {
            rawJson += chunk
        })
        .on('end', () => {
            try {
                if (rawJson) {
                    const requestBody = JSON.parse(rawJson)
                    resolve(requestBody)
                } else {
                    resolve(null)
                }
            } catch (err) {
                reject(err)
            }
        })
        .on('error', reject)
})

const createCache = () => {
    let cache = {}

    setInterval(() => {
        cache = {}
        console.log('Cache clear!')
    }, 60000)

    return async (key, cb, res) => {
        if (cache[key]) {
            res.setHeader('X-Cached-Key', key)
            return cache[key]
        }
        const data = await cb(key)
        cache[key] = data
        return data
    }
}

const cache = createCache()

exports.getCats = async () => {
    const cats = await catModel.fetchAllCats()
    if (!cats) {
        return getNotFoundResponse(res)
    }
    return cats
}

exports.getCatById = async (res, catId) => {
    const cat = await cache(catId, catModel.fetchCatById, res)
    if (!cat) {
        return getNotFoundResponse(res)
    }
    return cat
}

exports.createCat = async (req, res) => {
    const catData = await parseJsonBody(req)
    if (catData.ownerId) {
        const users = await userModel.fetchAllUsers()
        if (!(users.some(user => user.id === catData.ownerId))) {
            return getUnprocessableEntityResponse(res)
        }
    }
    catData.id = uuid()
    await catModel.addNewCat(catData)
    return {
        catData
    }
}

exports.updateCatById = async (req, res, catId) => {
    const updateData = await parseJsonBody(req)
    if (updateData.ownerId) {
        const users = await userModel.fetchAllUsers()
        if (!(users.some(user => user.id === updateData.ownerId))) {
            return getUnprocessableEntityResponse(res)
        }
    }
    const cat = await catModel.fetchCatById(catId)
    const updatedCat = { ...cat, ...updateData }
    const updateResult = await catModel.update(updatedCat)
    if (!updateResult) {
        return getNotFoundResponse(res)
    }
    return updatedCat
}

exports.deleteCatById = async (res, catId) => {
    const updateResult = await catModel.delete(catId)
    if (!updateResult) {
        return getNotFoundResponse(res)
    }
    return {
        id: catId
    }
}
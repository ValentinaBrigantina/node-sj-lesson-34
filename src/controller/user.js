const userModel = require('../model/user')
const { v4: uuid } = require('uuid')
const { URL } = require('url')
const { host, port } = require('../utils/config')

const getNotFoundResponse = (res) => {
    res.writeHead(404)
    return {
        error: {
            message: "Not found",
            code: 404
        }
    }
}

const getBadRequestResponse = (res) => {
    res.writeHead(400)
    return {
        error: {
            message: "Bad Request",
            code: 400
        }
    }
}

const parseJsonBody = request => new Promise((resolve, reject) => {
    let rawJson = ''
    request
        .on('data', (cunck) => {
            rawJson += cunck
        })
        .on('end', () => {
            try {
                if(rawJson) {
                    const requestBody =JSON.parse(rawJson)
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

const parseQueryString = (request) => {
    const parseUrl = new URL(request.url, `http://${host}:${port}`)
    const queryParams = {}
    for (const [key, value] of parseUrl.searchParams.entries()) {
        queryParams[key] = value
    }
    return queryParams
}

exports.getUserAndCatsById = async (res, userId) => {
    const user = await userModel.fetchUserById(userId)
    if (!user) {
        return getNotFoundResponse(res)
    }
    
    return user
}

exports.getUsers = async (req, res) => {
    const users = await userModel.fetchAllUsers()
    if (!users) {
        return getNotFoundResponse(res)
    }
    const queryParams = parseQueryString(req)
    
    if (Object.keys(queryParams).length > 0) {
        if (queryParams.limit && queryParams.offset) {
            const limit = parseInt(queryParams.limit)
            const offset = parseInt(queryParams.offset)
            const start = limit * offset
            const end = start + limit
            return users.slice(start, end)
        } else {
            return getBadRequestResponse(res)
        }
    }   
    return users
}

exports.createUser = async (req) => {
    const userData = await parseJsonBody(req)
    userData.id = uuid()
    await userModel.addNewUser(userData)
    return {
        userData
    }
}

exports.updateUserById = async (req, res, userId) => {
    const updateData = await parseJsonBody(req)
    const user = await userModel.fetchUserById(userId)
    const updatedUser = { ...user, ...updateData}
    const updateResult = await userModel.update(updatedUser)
    if (!updateResult) {
        return getNotFoundResponse(res)
    }
    return updatedUser
}

exports.deleteUserById = async (res, userId) => {
    const updateResult = await userModel.deleteById(userId)
    if (!updateResult) {
        return getNotFoundResponse(res)
    }
    return {
        id: userId
    }
}

exports.deleteUser = async (req, res) => {
    const userData = await parseJsonBody(req)
    const updateResult = await userModel.delete(userData)
    if (!updateResult) {
        return getNotFoundResponse(res)
    }
    return userData
}
const { createReadStream, writeFile } = require('fs')
const path = require('path')

const dbUserJsonPath = path.resolve(process.cwd(), 'src/services/db_user.json')
const dbCatsJsonPath = path.resolve(process.cwd(), 'src/services/db_cats.json')

const readJSONAsync = (path) => new Promise((resolve) => {
    const readStream = createReadStream(path)
    let result = ''
    readStream
        .on('data', (chunk) => {
            result += chunk.toString()
        })
        .on('end', (chunk) => {
            if (!result) {
                resolve([])
            } else {
                resolve(JSON.parse(result))
            }
        })
})

const writeJSONAsync = (path, data) => new Promise((resolve, reject) => {
    const buff = Buffer.from(JSON.stringify(data, null, 4))
    writeFile(path, buff, (err) => {
        err ? reject(err) : resolve()
    })
})

exports.fetchUserById = async (id) => {
    const users = await readJSONAsync(dbUserJsonPath)
    const user = users.find((user) => user.id === id)
    if(!user) {
        return
    }
    const allCats = await readJSONAsync(dbCatsJsonPath)
    const cats = allCats.filter((cat) => cat.ownerId === user.id)
    user.pets = []
    cats.map(cat => user.pets.push(cat))
    return user
}

exports.fetchAllUsers = () => {
    return readJSONAsync(dbUserJsonPath)
}

exports.addNewUser = async (data) => {
    const users = await readJSONAsync(dbUserJsonPath)
    users.push(data)
    await writeJSONAsync(dbUserJsonPath, users)
}

exports.update = async (dataOfNewUser) => {
    const users = await readJSONAsync(dbUserJsonPath)
    const foundUserIndex = users.findIndex(user => user.id === dataOfNewUser.id)
    if (foundUserIndex === -1) {
        return false
    }
    users[foundUserIndex] = dataOfNewUser
    await writeJSONAsync(dbUserJsonPath, users)
    return true
}

exports.deleteById = async (id) => {
    const users = await readJSONAsync(dbUserJsonPath)
    let userBeenFound = false
    const filteredUsers = users.filter(user => {
        if (user.id !== id) {
            return true
        }
        userBeenFound = true
        return false
    })
    if (userBeenFound) {
        const allCats = await readJSONAsync(dbCatsJsonPath)
        allCats.forEach(cat => {
            if (cat.ownerId === id) {
                cat.ownerId = null
            }
        })
        await writeJSONAsync(dbCatsJsonPath, allCats)
        await writeJSONAsync(dbUserJsonPath, filteredUsers)
        return true
    }
    return false
}

exports.delete = async (data) => {
    const users = await readJSONAsync(dbUserJsonPath)
    const arrIds = data.ids
    let usersWereFound = false
    const filteredUsers = users.filter(user => {
        if (!arrIds.includes(user.id)) {
            return true
        }
        usersWereFound = true
        return false
    })
    if (usersWereFound) {
        const allCats = await readJSONAsync(dbCatsJsonPath)
        allCats.forEach(cat => {
            if (arrIds.includes(cat.ownerId)) {
                cat.ownerId = null
            }
        })
        await writeJSONAsync(dbCatsJsonPath, allCats)
        await writeJSONAsync(dbUserJsonPath, filteredUsers)
        return true
    }
    return false
}
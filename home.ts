import { command } from "bdsx/command"
import { Database } from "./minyee2913-2913simpleDB-main/2913simpleDB-main"
import { Vec3 } from "bdsx/bds/blockpos"
import { DimensionId } from "bdsx/bds/actor"
import { CxxString } from "bdsx/nativetype"
import { CommandPermissionLevel, PlayerCommandSelector } from "bdsx/bds/command"

const db = Database.connect("./home")

class Homedata extends Database.tableClass {
    @Database.field(Database.TEXT, {
        PRIMARY_KEY: true,
        NOTNULL: true
    })
    xuid: string
    @Database.field(Database.TEXT)
    name: string
    @Database.field(Database.JSON_TEXT)
    position: Record<string, Vec3> = {}
    @Database.field(Database.JSON_TEXT)
    dimension: Record<string, DimensionId> = {}
}

command.register("c", "set my home").overload( async (param, origin)=>{
    if (origin.isServerCommandOrigin()) return
    const o = origin.getEntity()!
    if (!o?.isPlayer()) return
    const db = Homedb.get({xuid: o.getXuid})!
    console.log(db.dimension[param.name])
    console.log(db.position[param.name])
},{
    name: CxxString
})

const Homedb = db.createTable(Homedata, true)

command.register("sethome", "set my home").overload( async (param, origin)=>{
    if (origin.isServerCommandOrigin()) return
    const o = origin.getEntity()!
    if (!o?.isPlayer()) return
    const xuid = o.getXuid()
    if (!Homedb.hasData({xuid: xuid})) {
        const db = new Homedata()
        db.name = o.getName()
        db.xuid = o.getXuid()
        db.dimension[param.name] = o.getDimension().getDimensionId()
        db.position[param.name] = o.getPosition()
        Homedb.insert(db)
        o.sendMessage("§eSuccessful setting home!")
    } else {
        const db = Homedb.get({xuid: xuid})!
        db.dimension[param.name] = o.getDimension().getDimensionId()
        db.position[param.name] = o.getPosition()
        Homedb.update({dimension: db.dimension, xuid: xuid,})
        Homedb.update({position: db.position, xuid: xuid})
        o.sendMessage("§eSuccessful setting home!")
    }
},{
    name: CxxString
})

command.register("home", "teleport to home").overload( async (param, origin)=>{
    if (origin.isServerCommandOrigin()) return
    const o = origin.getEntity()!
    if (!o?.isPlayer()) return
    const xuid = o.getXuid()
    if (!Homedb.hasData({xuid: xuid})) {
        o.sendMessage("§cYou don't have home!")
        return
    } else {
        const db = Homedb.get({xuid: xuid})!
        if (db.position[param.name] == undefined || db.position[param.name] == null) {
            o.sendMessage("§cThis home is not exist!")
            return
        } else {
            const db = Homedb.get({xuid: xuid})
            if (db === undefined) return
            const vec3 = db.position[param.name]
            const pos = Vec3.create({x: vec3.x, y: vec3.y, z: vec3.z})
            const dimension = db.dimension[param.name]
            o.teleport(pos, dimension)
            o.sendMessage("§eSuccessful teleported home!")
        }
    }
},{
    name: CxxString
})

command.register("deletehome", "delete the home").overload( async (param, origin)=>{
    if (origin.isServerCommandOrigin()) return
    const o = origin.getEntity()!
    if (!o?.isPlayer()) return
    const xuid = o.getXuid()
    if (!Homedb.hasData({xuid: xuid})) {
        o.sendMessage("§cYou don't have home!")
        return
    } else {
        const db = Homedb.get({xuid: xuid})!
        if (db.position[param.name] == undefined || db.position[param.name] == null) {
            o.sendMessage("§cThis home is not exist!")
            return
        } else {
            delete db.position[param.name]
            delete db.dimension[param.name]
            o.sendMessage("§eSuccessful home deleted!")
        }
    }
},{
    name: CxxString
})

command.register("invitehome", "invite player", CommandPermissionLevel.Operator).overload( async (param, origin)=>{
    if (origin.isServerCommandOrigin()) return
    const o = origin.getEntity()!
    if (!o?.isPlayer()) return
    const xuid = o.getXuid()
    if (!Homedb.hasData({xuid: xuid})) {
        o.sendMessage("§cYou don't have home!")
        return
    } else {
        const db = Homedb.get({xuid: xuid})!
        if (db.position[param.name] == undefined || db.position[param.name] == null) {
            o.sendMessage("§cThis home is not exist!")
            return
        } else {
            const pls = param.player.newResults(origin)
            const pl = pls[0]
            const db = Homedb.get({xuid: xuid})!
            const vec3 = db.position[param.name]
            const dimension = db.dimension[param.name]
            pl.teleport(vec3, dimension)
            o.sendMessage("§eSuccessful invite player")
            pl.sendMessage("§7You inviting to op's home")
        }
    }
},{
    name: CxxString,
    player: PlayerCommandSelector
})
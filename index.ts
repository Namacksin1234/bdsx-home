import { events } from "bdsx/event";

events.serverOpen.on(()=>{
    console.log('[ Home plugin ] Home plugin launched')
    import("./home")
})
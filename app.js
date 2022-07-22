let enigma = new Enigma(Componentes, configuracionInicial)
let abecedarioPlugs = document.querySelector("#abecedarioPlugIn")
// Manejo del keyboard keys
let keyboardRows = document.querySelectorAll("#keyboard .keyboard-row")
let keys = [] // Lista de las letras en el keyboard
function generateKeyboard() {
    
    let rows = ['QWERTZUIO', 'ASDFGHJK', 'PYXCVBNML']
    let abecedario = rows.join("").split("").sort()
    
    for(let letra of abecedario){
        let span = document.createElement("span")
        span.append(letra)
        abecedarioPlugs.append(span)
    }
    
    
    let counter = 0
    for(let keyboardRow of keyboardRows){
        let letras = rows[counter]
        counter++
        for(let letra of letras.split(""))
        {
            let contenedor = document.createElement('span')
            contenedor.append(letra)
            contenedor.classList.add('keyBoardKey','keyOff','keyOn')
            contenedor.classList.toggle('keyOn')
            
            keys.push(contenedor)
            keyboardRow.append(contenedor)
        }
    }
}
generateKeyboard()

let isPressed = false, mensaje = "", writingPlugIns = false

let body = document.querySelector('body')
body.addEventListener('keydown',e => {listenEnigmaKeyDown(e)})

body.addEventListener('keyup', (e) => {
    listenEnigmaKeyUp(e)})

function listenEnigmaKeyDown(e){
    `Funcion para escuchar todas las teclas en la funcion (Las escucha en el cuerpo)
    Si se escriben los plug ins, se desactiva`
    if(writingPlugIns) return
    e.preventDefault()
    if(!isPressed){
        isPressed = true
    if ( /^[a-zA-Z?!.,\s]{1}$/.test(e.key)){
        let letra = enigma.getEncription(e.key)
        mensaje += letra
        // console.log(mensaje)
        updateNotches()
        for (let key of keys){
            if (key.innerText === letra){
                key.classList.remove('keyOff')
                key.classList.add('keyOn')
                break;
            }
        }
    }
    else if (e.key === 'Backspace' ) {
        enigma.backSpace()
        mensaje = mensaje.substring(0,mensaje.length - 1)
        updateNotches()
    }
displayEncription()}

}

function listenEnigmaKeyUp(e){
    `Funcion que escucha las teclas hacia arriba enigma`
    if(writingPlugIns) return
    e.preventDefault()
    isPressed = false
    if ( /^[a-zA-Z?!.,\s]{1}$/.test(e.key)){
        let letra = mensaje[mensaje.length - 1]
        
        for (let key of keys){
            if (key.innerText === letra){
                key.classList.remove('keyOn')
                key.classList.add('keyOff')
                break;
            }
        }

    }
}

let reset = document.querySelector('#reset')
reset.addEventListener('click',engimaReset)

function engimaReset(){
    enigma.resetInicial()
    mensaje = ""
    updateNotches()
    setPlugBoard()
    console.info("Enigma ha sido reseteada a la posicion inicial!!")
}


class RotorHtml{
    constructor(objetoRotor){
        this.rotor = objetoRotor
        this.order = this.rotor.children[0]
        this.notch = this.rotor.children[1].children[0]
        this.settingsNotch()
        this.name = this.rotor.children[2].children[0].children[0]
        this.validRange = [1,26]
        this.validNames = ["I","II","III","IV","V"]
        this.translate = {1:"I",2:"II",3:"III",4:"IV",5:"V"}
        this.settingsName()
    }

    settingsNotch(){
        this.notch.min = 1
        this.notch.max = 26
        this.notchListener()
    }

    settingsName(){
        this.nameEventListener()

    }

    getName(){
        return this.name.innerText
    }
    getOrder(){
        return this.order.innerText
    }
    getNotch(){
        return this.notch.value
    }
    setName(texto){
        `Pone el nombre del texto del boton
        Puedes poner un número o el texto directo` 
        if (typeof texto === "number"){
            texto = this.translate[texto]
        } else {texto = texto.toUpperCase()}

        if (texto && this.validNames.includes(texto)){
            this.name.innerText = texto
        }
        
    }

    setNotch(texto){
        if (typeof texto === "number" && texto >= 1 && texto <= 26){
            this.notch.value = texto
        } 
        else{
            console.info("Number is out of range :(")
        }
        
    }

    notchListener(){
        `Hace que se cambie el notch posicion en el Rotor`
        this.notch.addEventListener('input', (e) => {
            e.preventDefault()
            enigma.setUpPosicionesIniciales(this.getOrder(),e.srcElement.value)
            enigma.resetInicial()
        })
        
    }

    nameEventListener(){
        `Hace que al picarle a un boton del menú, enigma cambie sus configuraciónes al rotor especificado`
        let optionHolders = this.name.nextSibling.nextSibling
        for(let a of optionHolders.children){
            a.addEventListener('click',(e) =>{
                e.preventDefault()
                this.setName(a.innerText)
                let number = Object.keys(this.translate).find(key => this.translate[key] === a.innerText)
                enigma.setRotor(this.getOrder() - 1,number)
                enigma.resetInicial()
            })
        }
        
    }
}

rotores = []

for (let i = 1; i <= 3; i++){
    let r = new RotorHtml(
        document.querySelector(`#rotor${i}`))
    rotores.push(r)
    r.setName(enigma.rotores[r.getOrder() - 1].nombre)
    r.setNotch(enigma.rotores[r.getOrder() - 1].getNotchPosition())
    
}

function updateNotches(){
    console.log("Se están cambiando las configuraciones de los notches")
    for (let rotor of rotores){     
        rotor.setNotch(enigma.rotores[rotor.getOrder() - 1].getNotchPosition())
    }
}

function displayEncription(){
    console.info(`Mensaje: \n${mensaje}`)
}

let plugBoard = document.querySelector("#plugIns")

function setPlugBoard(nuevos = undefined){
    console.log("Se están cambiando las configuraciones de los plugs")
    if(!nuevos){
    let letras = enigma.configuracion.plugIns.map(elemento => (
      (elemento.length === 2) ? elemento.join("") : elemento  
    )) 
    plugBoard.value = letras.join(" ")}
}

setPlugBoard()

function makePlugBoard(plugText){
    `Recibes el plug board como vendría escrito [ab, cd, s, i]
    Y asumes que lo que no venga se conecta a sí mismo
    params:
        plug board de la forma ab gh i o...
    returns:
        plug board de la forma [a,b], [c,g], r...`
    
    let abecedario = 'abcdefghijklmnopqrstuvwxyz'.split("")
    let plugs = []
    if(plugText){
        plugs = plugText.map(e=>(e.length === 2) ? e.split(""): e)
        for (let plug of plugs){
            for (let letra of plug){
                abecedario.splice(abecedario.indexOf(letra),1)    
            }
        }
    }
    plugs.push(...abecedario)
    enigma.setUpPlugBoard(plugs)
    engimaReset()
}


function validatePlugs(){
    `Esto lo que hace es validar lso plugs, si detecta que no es valido, lo regresa a como estaba
    En Enigma, si está bien, lo configura con el enigma`
    
    let plugs = plugBoard.value.trim().split(" ").map(e => e.toLowerCase())
    if (plugs[0] === ""){
        makePlugBoard("")
        return 
    }
    let isValid = true
    let abecedario = ""
    // Checa si solo son letras y son de length 2
    
    for(let plug of plugs){
        if(/^[a-z]{1,2}$/.test(plug)) {
            abecedario += plug
        }else{
            isValid = false;
            alert("Solamente se aceptan letras en los plugs, separadas en grupos de 1 o dos letras por espacios:\nEjemplo: ab ce y u")
            break
        }
    }
    if (isValid){
        if(abecedario.length <= 26 && (abecedario.length === [...new Set(abecedario.split(""))].length)){
            makePlugBoard(plugs)
            return 
        }
        else{
            alert("Tienes letras duplicadas, porfavor fijate en el plug board por si hay grupos con letras repetidas")
        }
    }
    setPlugBoard()
    
}


//  Estos eventos son para que puedas escribir los plug ins
plugBoard.addEventListener("focusin", (e) => {
    e.preventDefault()
    writingPlugIns = true
})

plugBoard.addEventListener("focusout", (e) => {
    e.preventDefault()
    writingPlugIns = false
    validatePlugs()
    checkIfTyped()

})
plugBoard.addEventListener("input", (e) => {
    e.preventDefault()
    checkIfTyped()

})


function checkIfTyped(){
    // todo no deteccta repetidos, porque nomás checa el primer indice
    let letrasEncendidas = new Set()
    let letras = plugBoard.value.toUpperCase().split(" ").join("").split("")
    for(let span of abecedarioPlugs.children){
        for (let letra of letras){
            if (letra === span.innerText){
                if(letrasEncendidas.has(letra)){
                    // Duplicado
                    span.classList.remove("keyOn")
                    span.classList.add("keyOnBad")
                    break
                }else{
                    // Nueva letra
                    letrasEncendidas.add(letra)
                    span.classList.add("keyOn")
                    span.classList.remove("keyOnBad")
                }
            }
        }
        !letrasEncendidas.has(span.innerText) && span.classList.remove("keyOnBad","keyOn")
    }
}

checkIfTyped()









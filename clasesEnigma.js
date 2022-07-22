let datos = `{
    "Configuracion": {
        "rotorOrder": [
            2,
            3,
            1
        ],
        "posicionInicialRotores": [
            2,
            26,
            1
        ],
        "TipoReflector": "C",
        "plugIns": [
            [
                "x",
                "z"
            ],
            [
                "s",
                "q"
            ],
            [
                "i",
                "d"
            ],
            [
                "a",
                "w"
            ],
            [
                "l",
                "r"
            ],
            [
                "y",
                "g"
            ],
            [
                "k",
                "u"
            ],
            [
                "m",
                "b"
            ],
            [
                "h",
                "f"
            ],
            [
                "v",
                "e"
            ],
            "c",
            "j",
            "n",
            "o",
            "p",
            "t"
        ]
    },
    "Componentes": {
        "rotor": {
            "I": {
                "wiring": "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
                "notch": "Q"
            },
            "II": {
                "wiring": "AJDKSIRUXBLHWTMCQGZNPYFVOE",
                "notch": "E"
            },
            "III": {
                "wiring": "BDFHJLCPRTXVZNYEIWGAKMUSQO",
                "notch": "V"
            },
            "IV": {
                "wiring": "ESOVPZJAYQUIRHXLNFTGKDCMWB",
                "notch": "J"
            },
            "V": {
                "wiring": "VZBRGITYUPSDNHLXAWMJQOFECK",
                "notch": "Z"
            }
        },
        "reflector": {
            "A": {
                "wiring": "EJMZALYXVBWFCRQUONTSPIKHGD"
            },
            "B": {
                "wiring": "YRUHQSLDPXNGOKMIEBFZCWVJAT"
            },
            "C": {
                "wiring": "FVPJIAOYEDRZXWGCTKUQSBNMHL"
            }
        }
    }
}`
datos = JSON.parse(datos)
const {Configuracion:configuracionInicial, Componentes} = datos

// * Creacion de los componentes de Engima
// El refelctor es simétrico, por eso no importa
class Reflector{
    constructor(nombre,wiring){
        `params:
            nombre: nombre del reflector
            wiring: es el string con el wiring del reflector
            
        globales:
            nombre
            wiring
            func getLetter`
        this.nombre = nombre;
        // Este crea le this.wiring
        this.transformWiring2dict(wiring);      
    }

    transformWiring2dict(wiring){
        /*"Esta funcion cambia el string de wiring a un diccionario"
        
        recibe:
            wiring = "ABCD...."
        return:
            this.wiring["A"] = "B"
        
        */
        let primeraLetra = 'A'.charCodeAt(0)
        this.wiring = {}
        for(let letra of wiring.split("")){
        this.wiring[String.fromCharCode(primeraLetra)]=letra.toUpperCase()
        primeraLetra++
        }        
        this.wiring
        }

    getLetter(letra = undefined){
        `Recibe una letra, y devuelve la encriptación
        args:
            letra : letra que quieres reflecjar
        return
            letra: letra reflejada
        `
        if (letra) return this.wiring[letra.toUpperCase()]
    }    

}
/*Rotacion Positiva counterClockwise */
class Rotor extends Reflector {
    constructor(nombre,rotor){
        `params:
            nombre: nombre del rotor
            rotor: objeto con la información del rotor. Debe tener
                wiring: con string del wiring
                notch: con la letra que es el notch en el rotor`
        
        let {wiring, notch} = rotor
        super(nombre, wiring)
        this.notch = notch
    }

    rotate(times = 1){
        `Rotate foward para escribr normalmente, y back es para borrar, puedes incluir
        un número de rotaciones con las que puedes rotar
        Positivo es foward, negativo es back
        1: foward
        -1: back

        params:
            times: numero de veces que quieres rotar. N para ir hacia adelante y -N para ir hacia atras

        returns:
            bool: esto indica si paso un notch, si paso, significa que el otro rotor debe girar
        `
        if (times === 0) return false
        times *= -1
        let valores = Object.values(this.wiring)
        let abecedario = Object.keys(this.wiring)

        if (times > 0){
            for (let i = 0; i < times; i++){valores.push(valores.shift())}
        }
        else {
            for (let i = 0; i < Math.abs(times); i++){valores.unshift(valores.pop())}
        }

        let nuevoWiring = {}
        for( let i = 0; i < valores.length; i++){
            nuevoWiring[abecedario[i]] = valores[i]
        }
        
        this.wiring = nuevoWiring
        return (times > 0) ?  this.getNotchPosition() === 26 : this.getNotchPosition() === 1
    }
    
    getLetter(letter,direction = "foward",isRotation = false){
        `Esta obtiene la letra del rotor
        En el caso de que sea foward, si la letra que se devuelve es el notch, 
        devuelve true como segundo argumento, que indica si el siguiente rotor debe girar
        En el caso de que no, regresa falso
        En el cado de elegir back, nunca rotará
        
        args:
            letter = letra
            direction = foward || back
            isRotation = bool indica si quieres que tenga la posibilidad de girar (si es backsapce, podría girar)
            

        returns
            [str, bool]
            str: es la letra que produce el rotor
            bool: indica si esta vuelta provoca un giro en el siguiente rotor
        `
        let isNextRotate = false
        
        direction = direction.toLowerCase()
        if(isRotation && direction !== "back" ){
            isNextRotate = this.rotate(1)
        } 
        else if (isRotation && direction === "back"){
            isNextRotate = this.rotate(-1)
        }
        letter = letter.toUpperCase()
        
        switch(direction){
            default:
            case "foward":
                let letra  = this.wiring[letter]
                return [letra, isNextRotate]
            case "back":
                return [Object.keys(this.wiring).find(key => this.wiring[key] === letter) , isNextRotate]
        }
    }

    setInitialNotchPosition(number = 1){
        `Pones una posición en el alfabeto (1-26), y el notch se pone ahí
        Se espera a que este comando, no cause ningun giro en otros rotores
        param:
            number: indica la posición donde quieres que esté el notch [1-26]
        `
        number--
        let valores = Object.values(this.wiring)
        if (number >= valores.length || number < 0) return 
        let idx = valores.indexOf(this.notch)  
        this.rotate((number - idx) )
    }

    getNotchPosition(){
        let valores = Object.values(this.wiring)
        return valores.indexOf(this.notch) + 1
    }

}

class PlugBoard {
    constructor(plugIns){
        `params:
            plugIns: Objeto con las configuraciones de los plugins
                Debe de tener:
                    Un array con todos plugs:
                        Puede ser un elemento con dos letras en una lista [a,b]
                        O puede ser un solo elemento (se asumirá que conecta a sí mismo)`
        this.plugIns = plugIns
        this.managePlugs()
    }

    managePlugs(){
        `Ordena los plugs recibidos del constructor, para que se hagan un diccionari
            return Implicit
                this.plugIns`
        let dictionary = {}
        for (let plug of this.plugIns){
            if (plug.length === 2){
                dictionary[plug[0].toUpperCase()] = plug[1].toUpperCase()
                dictionary[plug[1].toUpperCase()] = plug[0].toUpperCase()
           
            }
            else {
                dictionary[plug.toUpperCase()] = plug.toUpperCase()
            }
        }
        this.plugIns = dictionary
    }

    getLetter(letter){
        `Params:
            Letter: Letra le metes
        Returns:
            letter: Letra que sale del plug
            `   
        letter = letter.toUpperCase()
        return this.plugIns[letter]
    }

}

// * Composición de Engima
class Enigma{

    constructor(componentes,configuracion){
        `Variables globales:
            componentes objeto
            configuracon objeto
            rotores lista Rotores
            reflector Reflector
            plugBoard PlugBoard

        Params:
            Componentes: Lista de componentes, debe incluir:
                rotor:{
                    nombre:{
                        wiring:wiring
                        notch:notch
                    }
                },
                reflector:{
                    nombre: {
                        wiring : wiring
                    }
                }
            
            configuración : Lista de configuraciones del engima, debe incluir :
                Configuracion:{
                    rotorOrder: [1,2,3]
                    posicionInicialRotores: [8,6,25] //Son de los notches
                    TipoReflector: C
                    plugIns: lista plugIns
                }
                `
        this.componentes = componentes
        this.configuracion = configuracion
        this.resetInicial()
    }

    setUpOrdenRotores(primero = undefined, segundo = undefined, tercero = undefined){
        `Set up de los motores de más veloz a más lento (ints)
        si no viene ninguno, son los iniciales
        Params optional:
            primero: numero del primero
            segundo: número del segundo
            tercero: número del tercero
            
        Returns implicit: 
            this.rotores [], con el orden de los rotores de más rápido a más despacio
            siempre deben ser 3`

        if (primero){
            
            this.configuracion.rotorOrder = [primero,segundo,tercero]
            let diccionario = {1:"I", 2:"II", 3:"III", 4:"IV", 5:"V"}
            this.rotores = []
            for (let rotor of [primero, segundo, tercero]){
                try{
                    if (!diccionario[rotor]){ throw "Fuera del rango"} 
                this.rotores.push(
                    this.getRotor(diccionario[rotor]))}
                catch (e){
                    console.error("Los rotores son solo del 1-5")
                    break;
                }
            }
        }else{
            this.setUpOrdenRotores(...this.configuracion.rotorOrder) 
        }
        
    }

    setUpPosicionesIniciales(posicionRotor = undefined, posicion = 1){
        `Hace un set up de las posiciones iniciales de los rotores
        Adicionalmente, si se pasa un número del rotor, y su posicion, se 
        cambia individualemnte el rotor
        params:
            None: Configura todos los rotores con las configuraciones iniciales
        params (optional):
            posicionRotor: Número del rotor (1-3)
            posicion: posición del notch (1-26)
            `
        if (!posicionRotor){
        for(let i = 0; i < 3; i++){
            this.rotores[i].setInitialNotchPosition(
                this.configuracion.posicionInicialRotores[i])
        }}
        else {
            posicionRotor--;
            this.rotores[posicionRotor].setInitialNotchPosition(posicion)
            this.configuracion.posicionInicialRotores[posicionRotor] = posicion
        }
    }

    setUpReflector(nombre = undefined){
        `Pone el tipo de reflector que quieres. Si no pasas nombre, toma el de
        las configuraciones inciales
        
        params opcional
            nombre: nombre del reflector`
        let reflectorTipo = (!nombre) ? 
            this.configuracion.TipoReflector : 
            nombre
        
        this.configuracion.TipoReflector = reflectorTipo
        this.reflector = new Reflector(reflectorTipo,
            this.componentes.reflector[reflectorTipo].wiring)
    }

    setUpPlugBoard(nuevosPlugs = undefined){
        `Set up el plug con con los plug ins (si nole metes nada
            se pone con las configuraciones iniciales)
        params opcional
            nuevos plugs: `
        this.plugBoard =(!nuevosPlugs) ?
            new PlugBoard(this.configuracion.plugIns) :
            nuevosPlugs
        if(nuevosPlugs) {
            this.configuracion.plugIns = nuevosPlugs
        }
    }

    setRotor(orden, numero){
        `Le das el orden del rotor que quieres cambiar, y luego por el número del rotor
        param:
            orden: orden de rotor
            numero: número de rotor`
        
        this.configuracion.rotorOrder[orden--] = numero
        this.setUpOrdenRotores()
    }

    resetInicial(){
        this.setUpOrdenRotores()
        this.setUpPosicionesIniciales()
        this.setUpReflector()
        this.setUpPlugBoard()
    }

    getEncription(texto){
        `Si es un texto completo, devuelve el texto encriptado
        Si es una key, devuelve la key
        params:
            texto: str, puede ser tanto una tecla como un texto
        returs
            texto encriptado
        `
        let textoEncriptado = "", isRotation = true, results = undefined
        let counter = 0

        if (texto.length === 1){

           let codigo = texto.toUpperCase().charCodeAt(0)
           
           // Condición si no se encuentra en el abecedario
           if ([" ",",",".","!","?"].indexOf(texto) !== -1){
               this.getEncription('a')
               return texto
           }else if('A'.charCodeAt(0) > codigo || 'Z'.charCodeAt(0) < codigo){
               return ""
           }
           
           // Entra al plugboard
          
           textoEncriptado = this.plugBoard.getLetter(texto)
         
           // Entra a los rotores
           
           results = this.rotores[counter].getLetter(textoEncriptado,'foward',isRotation)
           textoEncriptado = results[0]
           isRotation = results[1]
           counter++
           results = this.rotores[counter].getLetter(textoEncriptado,'foward',isRotation)
           textoEncriptado = results[0]
           isRotation = results[1]
           counter++
           results = this.rotores[counter].getLetter(textoEncriptado,'foward',isRotation)
           textoEncriptado = results[0]
           isRotation = results[1]
           

           textoEncriptado = this.reflector.getLetter(textoEncriptado)

           results = this.rotores[counter].getLetter(textoEncriptado,'back',false)
           textoEncriptado = results[0]
         
           counter--
           results = this.rotores[counter].getLetter(textoEncriptado,'back',false)
           textoEncriptado = results[0]
          
           counter--
           results = this.rotores[counter].getLetter(textoEncriptado,'back',false)
           textoEncriptado = results[0]
           
           
           textoEncriptado = this.plugBoard.getLetter(textoEncriptado)
           
            return textoEncriptado
        }
        else {
            texto = texto.split("")
            for (let letra of texto){textoEncriptado += this.getEncription(letra)}
            return textoEncriptado
        }
    }
    
    backSpace(){
        `Lo activas y se modifican los rotadores para que cuenten como si no hubieras hecho nada`
        let isRotate = true, counter = 0
        isRotate = this.rotores[counter].getLetter('a',"back", true)
        counter++
        isRotate = this.rotores[counter].getLetter('a',"back", isRotate[1])
        counter++
        isRotate = this.rotores[counter].getLetter('a',"back", isRotate[1])
    }
    getRotor(nombre){
        `Param:
            rotores de json de los componentes
            nombre: nombre del rotor
        Returns
            Rotor: Tipo rotor`
        return new Rotor(nombre, this.componentes.rotor[nombre])
    }

}
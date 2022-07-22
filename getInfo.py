import random
import bs4
import requests
import json
"""Va a wikipedia y busca los datos de la configuración de enigma"""
tipos_rotores = ["I", "II", "III", "IV", "V"]

tipos_reflectores = ["Reflector A", "Reflector B", "Reflector C"]

counter = 0

wiring_rotores = []
wiring_reflectors = []

notches = []


URL = 'https://en.wikipedia.org/wiki/Enigma_rotor_details'
try:
    source = requests.get(URL)
    source.raise_for_status()
except:
    print("No se encontró lo que buscabas")
else:
    soup = bs4.BeautifulSoup(source.text, 'lxml')
    tables = soup.find_all(class_='wikitable')
    for table in tables:
        rows = table.find_all('tr')
        for row in rows:
            nombreColumna = row.find_all('td')
            try:
                a = nombreColumna[0].text.strip()
                if a in tipos_rotores:
                    if counter > 2:
                        texto = nombreColumna[1].text.strip()

                        notches.append(texto) if len(
                            texto) == 1 else wiring_rotores.append(texto)
                    else:
                        counter += 1
                elif a in tipos_reflectores:
                    texto = nombreColumna[1].text.strip()
                    wiring_reflectors.append(texto)

            except IndexError:
                pass
            except TypeError:
                pass


componentes = {"rotor": {}, "reflector": {}}

for tipo, wiring, notch in zip(tipos_rotores, wiring_rotores, notches):
    componentes["rotor"][tipo] = {
        "wiring": wiring,
        "notch": notch
    }

for tipo, wiring in zip(list(map(lambda x: x[-1], tipos_reflectores)), wiring_reflectors):
    componentes["reflector"][tipo] = {
        "wiring": wiring
    }


abecedario = "abcdefghijkmnlopqrstuvwxyz"
abecedario = [letra for letra in abecedario]

plugins = []
for i in range(10):
    l1 = random.choice(abecedario)
    abecedario.remove(l1)
    l2 = random.choice(abecedario)
    abecedario.remove(l2)
    plugins.append([l1, l2])

for letra in abecedario:
    plugins.append(letra)


tipoReflector = random.choice(["A", "B", "C"])
rotorOrden = list(range(1, 6))
random.shuffle(rotorOrden)
rotorOrden = rotorOrden[0:3]
rotoresInicialPositions = [random.randint(0, 25) for i in range(3)]

megaData = {
    "Configuracion":
    {"rotorOrder": rotorOrden,
     "posicionInicialRotores": rotoresInicialPositions,
     "TipoReflector": tipoReflector,

     "plugIns": plugins}, "Componentes": componentes}


with open("datos.json", 'w') as archivo:

    data = json.dumps(megaData, indent=4)
    archivo.write(data)


# with open("Componentes/componentes.json", 'w') as archivo:
#     archivo.write(json.dumps(componentes, indent=4))

# print("Se han guardado los componetes de Enigma")

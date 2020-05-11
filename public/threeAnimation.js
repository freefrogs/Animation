import {visibleHeightAtZDepth, visibleWidthAtZDepth, lerp} from "./utils.js"
import {nextSlide, prevSlide} from "./main.js"


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight)

const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera)

document.body.append(renderer.domElement)

const raycaster = new THREE.Raycaster()
const mousePosition = new THREE.Vector2()

const objLoader = new THREE.OBJLoader()
let arrowBox = []
let arrowBoxRotation = 0

objLoader.load(
    'public/models/cube.obj',
    ({children}) => {
      const screenBorderRight = visibleWidthAtZDepth(-10, camera) / 2
      const screenBottom = -visibleHeightAtZDepth(-10, camera) / 2
      addCube(children[0], nextSlide, screenBorderRight - 1.5, screenBottom + 1, 90)
      addCube(children[0], prevSlide, screenBorderRight -2.5, screenBottom + 1, -90)
      animate()
    }
);

const addCube = (object, callbackFn, x, y, angle) => {
  const cubeMesh = object.clone()

  cubeMesh.scale.setScalar(.3)
  cubeMesh.rotation.set(THREE.Math.degToRad(angle), 0, 0)

  const boundingBox = new THREE.Mesh(
      new THREE.BoxGeometry(.7, .7, .7),
      new THREE.MeshBasicMaterial({transparent: true, opacity: 0})
  )

  boundingBox.position.x = x
  boundingBox.position.y = y
  boundingBox.position.z = -10

  boundingBox.add(cubeMesh)

  boundingBox.callbackFn = callbackFn

  arrowBox.push(boundingBox)
  scene.add(boundingBox)
}

const animate = () => {
  arrowBoxRotation = lerp(arrowBoxRotation, 0, .07)
  //arrowBox.rotation.set(THREE.Math.degToRad(arrowBoxRotation), 0, 0)
  arrowBox.forEach(box => {
    box.rotation.set(THREE.Math.degToRad(arrowBoxRotation), 0, 0)
  })
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

export const handleThreeAnimation = (angle) => {
  arrowBoxRotation = angle
}

window.addEventListener('click', () => {
  //const mousePosition = new THREE.Vector2()
  mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1
  mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mousePosition, camera)
  //const interesctedObjects = raycaster.intersectObjects([arrowBox])
  const interesctedObjects = raycaster.intersectObjects(scene.children);
  for ( var i = 0; i < interesctedObjects.length; i++ ) {
    interesctedObjects[i].object.callbackFn()
  }
  //interesctedObjects.length && interesctedObjects[0].object.callbackFn()
})
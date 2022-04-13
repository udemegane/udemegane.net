import {
  ArcRotateCamera,
  Vector3,
  Engine,
  Observable,
  Scene,
  MeshBuilder,
  HemisphericLight,
  PBRMaterial,
  CubeTexture,
  Texture,
  Color3,
  Vector2,
} from "@babylonjs/core";
import { WaterMaterial } from "@babylonjs/materials";
// import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
import "@babylonjs/loaders/glTF";
import { SceneType } from "./sceneTypes";

export default function makeTitleScene(
  engine: Engine,
  onSwitchSceneObservable: Observable<SceneType>
): Scene {
  return createScene(engine, onSwitchSceneObservable);
}

function createScene(
  engine: Engine,
  onSwitchSceneObservable: Observable<SceneType>
): Scene {
  const scene = new Scene(engine);
  const camera: ArcRotateCamera = new ArcRotateCamera(
    "Camera",
    -Math.PI,
    Math.PI / 2,
    2,
    new Vector3(0.0, 15.0, 0.0),
    scene
  );
  camera.attachControl(true);
  // eslint-disable-next-line no-unused-vars
  const light = new HemisphericLight(
    "ambientLight",
    new Vector3(0, 1, 0),
    scene
  );

  // skybox
  const skybox = (() => {
    const skybox = MeshBuilder.CreateBox(
      "sky",
      {
        size: 3000,
      },
      scene
    ); // Mesh.CreateBox("sky", 3000.0, scene);
    const skyMaterial = new PBRMaterial("sky", scene);
    skyMaterial.backFaceCulling = false;
    skyMaterial.reflectionTexture = new CubeTexture("texture/night.env", scene);
    skyMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    // skyMaterial.disableLighting = true;
    skyMaterial.roughness = 0.2;
    skybox.material = skyMaterial;
    return skybox;
  })();

  // water
  ((skybox) => {
    // eslint-disable-next-line no-unused-vars
    const waterMesh = MeshBuilder.CreateGround(
      "ground",
      { width: 2048, height: 2048 },
      scene
    );

    const waterMaterial = new WaterMaterial(
      "water",
      scene,
      new Vector2(2048, 2048)
    );
    waterMaterial.backFaceCulling = true;
    waterMaterial.bumpTexture = new Texture("texture/940-bump.jpg", scene);
    waterMaterial.windForce = -7;
    waterMaterial.waveHeight = 2;
    waterMaterial.bumpHeight = 0.2;
    waterMaterial.waterColor = new Color3(0, 0, 190 / 255);
    waterMaterial.addToRenderList(skybox);
    waterMesh.material = waterMaterial;
    // return waterMesh;
  })(skybox);

  // SceneLoader.ImportMesh("", "3Dobjects/", "UnrealMannequin_F.glb", scene);
  return scene;
}

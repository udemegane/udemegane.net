import {
  Vector3,
  Observable,
  Scene,
  MeshBuilder,
  HemisphericLight,
  PBRMaterial,
  CubeTexture,
  Texture,
  Color3,
  Vector2,
  SceneLoader,
  FreeCamera,
  Mesh,
  DefaultRenderingPipeline,
  TargetCamera,
  LensRenderingPipeline,
} from "@babylonjs/core";
import { WaterMaterial } from "@babylonjs/materials";
// import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
import "@babylonjs/loaders/glTF";
import { Pane } from "tweakpane";
import { SceneData } from "../app";
import { SceneType } from "./sceneTypes";

const setUpDebugUI = (paramsArr: Object[]) => {
  const pane = new Pane();
  paramsArr.forEach((params) => {
    Object.keys(params).forEach((k) => {
      // typescriptに敗北しました。反省しています。
      // そのうち直しますが、今は眠いです。
      const key = k as keyof Object;
      pane.addInput(params, key);
    });
  });
};

const setUpDefaultPipeline = (
  scene: Scene,
  camera: TargetCamera
): DefaultRenderingPipeline => {
  const defaultPipeline = new DefaultRenderingPipeline(
    "defaultPipeline",
    true,
    scene,
    [camera]
  );
  defaultPipeline.fxaaEnabled = true;
  defaultPipeline.bloomEnabled = true;
  defaultPipeline.bloomKernel = 20;
  defaultPipeline.bloomWeight = 0.2;
  return defaultPipeline;
};

const setUpLensRenderingPipeline = (
  scene: Scene,
  camera: TargetCamera
): LensRenderingPipeline => {
  const params = {
    edge_blur: 1.0,
    chromatic_aberration: 1.0,
    distortion: 1.0,
    dof_focus_distance: 50,
    dof_aperture: 6.0, // set this very high for tilt-shift effect
    grain_amount: 1.0,
    dof_pentagon: true,
    dof_gain: 1.0,
    dof_threshold: 1.0,
    dof_darken: 0.25,
  };
  setUpDebugUI([params]);
  const lensPipeline = new LensRenderingPipeline(
    "lenspipeline",
    params,
    scene,
    1.0,
    [camera]
  );
  return lensPipeline;
};

const setUpPostProcess = (scene: Scene, camera: TargetCamera): Scene => {
  scene.postProcessRenderPipelineManager.addPipeline(
    setUpDefaultPipeline(scene, camera)
  );
  scene.postProcessRenderPipelineManager.addPipeline(
    setUpLensRenderingPipeline(scene, camera)
  );

  return scene;
};

export const titleScene = (
  scene: Scene,
  onAppEventObservable: Observable<SceneData>
): Scene => {
  console.log();
  const camera: FreeCamera = ((camera) => {
    const deg2rad = (deg: number) => {
      return deg * (Math.PI / 180);
    };
    camera.rotation = new Vector3(deg2rad(5), deg2rad(195), 0);
    camera.fov = 0.5;
    camera.attachControl(true);

    return camera;
  })(new FreeCamera("freeCam", new Vector3(-2.055, 1.15, 6.44), scene));
  scene = setUpPostProcess(scene, camera);
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
  const waterPlane = (skybox: Mesh) => {
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
  };

  SceneLoader.ImportMesh("", "3Dobjects/", "tree_env.glb", scene);

  const sceneMetaData: SceneData = {
    tag: SceneType.Title,
  };
  scene.metadata = sceneMetaData;
  return scene;
};

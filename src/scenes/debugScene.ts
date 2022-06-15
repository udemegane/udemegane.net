/* eslint-disable no-unused-vars */
import {
  ArcRotateCamera,
  HemisphericLight,
  ISceneLoaderAsyncResult,
  Mesh,
  Observable,
  Scene,
  SceneLoader,
  Skeleton,
  Vector3,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { SceneData } from "../app";
import { SceneScript, SceneType } from "./sceneTypes";
import { assertIsDefined, colors } from "../util";
import { skeletalMeshAsyncLoader } from "../loader";

export const debugScene: SceneScript = (
  scene: Scene,
  onAppEventObservable: Observable<SceneData>
): Promise<Scene> => {
  const camera: ArcRotateCamera = ((camera) => {
    camera.attachControl(true);
    return camera;
  })(new ArcRotateCamera("arcCam", 0, 0, 3.0, new Vector3(0, 1.3, 0), scene));

  const Ambientlight = new HemisphericLight(
    "hemilight1",
    new Vector3(0, 2, 0),
    scene
  );

  const sceneMetaData: SceneData = {
    tag: SceneType.Debug,
  };
  scene.metadata = sceneMetaData;

  return main(scene);
};

const main: (scene: Scene) => Promise<Scene> = async (scene: Scene) => {
  const animdSkeleton = ((res: ISceneLoaderAsyncResult) => {
    res.meshes.forEach((m) => (m.position.x += 2.5));
    if (!res.skeletons[0]) {
      console.warn(colors.yellow("No skeleton object detected."));
      return new Skeleton("nullSK", "null", scene);
    }
    return res.skeletons[0];
  })(
    await SceneLoader.ImportMeshAsync(
      "",
      "3Dobjects/babylon/",
      "AnimTest.babylon",
      scene
    )
  );
  const characterLoader = skeletalMeshAsyncLoader(scene, "3Dobjects/babylon/");
  const [bodyMesh, bodySkeleton] = await characterLoader("body.babylon");
  const [clothMesh, clothSkeleton] = await characterLoader("cloth.babylon");
  const [hairMesh, hairSkeleton] = await characterLoader("hair.babylon");

  return scene;
};

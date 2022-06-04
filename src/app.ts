import { Engine, Observable, Scene } from "@babylonjs/core";
import { SceneType } from "./scenes/sceneTypes";
import { titleScene } from "./scenes/title";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { colors } from "./util";
// import { chain, Either, getOrElse, left, right } from "fp-ts/es6/Either";

export type SceneData = {
  tag: SceneType;
};

const ObserverMask = {
  SWITCHSCENE: 0,
} as const;
// eslint-disable-next-line no-redeclare
type ObserverMask = typeof ObserverMask[keyof typeof ObserverMask];

const createCanvas = (): HTMLCanvasElement => {
  document.documentElement.style.overflow = "hidden";
  document.documentElement.style.width = "100%";
  document.documentElement.style.height = "100%";
  document.documentElement.style.margin = "0";
  document.documentElement.style.padding = "0";
  document.body.style.overflow = "hidden";
  document.body.style.width = "100%";
  document.body.style.height = "100%";
  document.body.style.margin = "0";
  document.body.style.padding = "0";

  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.id = "appCanvas";
  document.body.appendChild(canvas);
  return canvas;
};

const makeDebugMenu = (scene: Scene): Scene => {
  window.addEventListener("keydown", (ev) => {
    // Shift+Ctrl+Alt+I
    if (ev.shiftKey && ev.altKey && ev.keyCode === 73) {
      if (scene.debugLayer.isVisible()) {
        scene.debugLayer.hide();
      } else {
        scene.debugLayer.show();
      }
    }
  });
  return scene;
};

const makeScene =
  (engine: Engine, onAppEventObservable: Observable<SceneData>) =>
  (initScene: (scene: Scene) => Scene) =>
  (
    sceneScript: (
      scene: Scene,
      onAppEventObservable: Observable<SceneData>
    ) => Scene
  ): Scene => {
    return sceneScript(initScene(new Scene(engine)), onAppEventObservable);
  };

export const main = () => {
  // const canvas: HTMLCanvasElement = createCanvas();
  const engine: Engine = new Engine(createCanvas(), true);
  const onAppEventObservable: Observable<SceneData> = new Observable();
  const initScene = ((flag: string | undefined) => {
    if (flag === "true") {
      console.info(`
      [${colors.blue(
        "INFO"
      )}] env.INSPECTOR is true. Construct babylon inspector and scene explorer.
      `);
      return makeDebugMenu;
    } else return (scene: Scene) => scene;
  })(process.env.INSPECTOR);
  const sceneMaker = makeScene(engine, onAppEventObservable)(initScene);
  const title = sceneMaker(titleScene);
  // const scenes: TaggedScene[] = [sceneMaker(titleScene)];
  // console.log(`${scenes[0].tag}`);
  onAppEventObservable.add((sceneData: SceneData) => {
    const mayBeScene = engine.scenes.find(
      // このas良くないので型ガードしたほうがいい
      (s) => (s.metadata as SceneData).tag === sceneData.tag
    );
    if (mayBeScene instanceof Scene) {
      console.log("test");
      engine.runRenderLoop(() => {
        mayBeScene.render();
      });
    } else {
      console.warn("読み込みが終わってないよ");
    }
  });
  onAppEventObservable.notifyObservers({ tag: SceneType.Title });
};
main();

import { Engine, KeyboardEventTypes, Observable, Scene } from "@babylonjs/core";
import { SceneScript, SceneType } from "./scenes/sceneTypes";
import { titleScene } from "./scenes/title";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { colors } from "./util";
import { debugScene } from "./scenes/debugScene";
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

const attachDebugMenu = (scene: Scene) => {
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
};

const makeScene =
  (engine: Engine, onAppEventObservable: Observable<SceneData>) =>
  (initScene: (scene: Scene, obs: Observable<SceneData>) => Scene) =>
  (sceneScript: SceneScript): Promise<Scene> => {
    return sceneScript(
      initScene(new Scene(engine), onAppEventObservable),
      onAppEventObservable
    );
  };

const sceneChanger = (scene: Scene, obs: Observable<SceneData>): Scene => {
  scene.onKeyboardObservable.add((keyInfo) => {
    if (keyInfo.type === KeyboardEventTypes.KEYDOWN) {
      switch (keyInfo.event.code) {
        case "Key1":
          obs.notifyObservers({ tag: SceneType.Title });
          break;
        case "Key2":
          obs.notifyObservers({ tag: SceneType.Debug });
          break;
        default:
          break;
      }
    }
  });
  return scene;
};

export const main = async () => {
  // const canvas: HTMLCanvasElement = createCanvas();
  const engine: Engine = new Engine(createCanvas(), true);
  window.addEventListener("resize", (ev) => {
    engine.resize();
  });
  const onAppEventObservable: Observable<SceneData> = new Observable();
  const initScene = ((flag: string | undefined) => {
    if (flag === "true") {
      console.info(`
      [${colors.blue(
        "INFO"
      )}]: env.DEBUG is true. create and implement scene changer.
      `);
      return sceneChanger;
    } else return (scene: Scene) => scene;
  })(process.env.DEBUG);
  const sceneMaker = makeScene(engine, onAppEventObservable)(initScene);
  const title = await sceneMaker(titleScene);
  const debug = await sceneMaker(debugScene);
  console.info(`${colors.cyan("LOG")} ${title.uid}`);
  console.info(`${colors.cyan("LOG")} ${debug.uid}`);
  // const scenes: TaggedScene[] = [sceneMaker(titleScene)];
  // console.log(`${scenes[0].tag}`);
  onAppEventObservable.add((sceneData: SceneData) => {
    const mayBeScene = engine.scenes.find(
      // このas良くないので型ガードしたほうがいい
      (s) => (s.metadata as SceneData).tag === sceneData.tag
    );
    if (mayBeScene instanceof Scene) {
      const currentScene = mayBeScene;
      const tryToAttachDebugLayer = (
        flag: string | undefined,
        scene: Scene
      ) => {
        if (flag === "true") {
          console.info(
            `[${colors.blue(
              "INFO"
            )}]:env.INSPECTOR is true. attach babylon inspector and scene explorer.`
          );
          return attachDebugMenu(scene);
        }
      };
      tryToAttachDebugLayer(process.env.INSPECTOR, currentScene);

      engine.runRenderLoop(() => {
        currentScene.render();
      });
    } else {
      console.warn("読み込みが終わってないよ");
    }
  });
  onAppEventObservable.notifyObservers({ tag: SceneType.Title });
};
main();

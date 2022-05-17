import { Engine, Observable, Scene } from "@babylonjs/core";
import { SceneManager } from "./sceneManager";
import { SceneType, TaggedScene } from "./scenes/sceneTypes";
import { titleScene } from "./scenes/title";

export type SceneData = {
  tag: SceneType;
};

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

const main = () => {
  const canvas: HTMLCanvasElement = createCanvas();
  const engine: Engine = new Engine(canvas, true);
  const onAppEventObservable: Observable<SceneData> = new Observable();
  const sceneMaker = makeScene(engine, onAppEventObservable)(makeDebugMenu);
};
main();
class App {
  private _currentScene: Scene;
  private _scenes: Array<TaggedScene>;
  private _canvas: HTMLCanvasElement;
  private _engine: Engine;
  private _sceneManager: SceneManager;
  private _onSwitchSceneObservable: Observable<SceneType>;

  constructor() {
    // Prepare to load scenes
    this._canvas = this._createCanvas();
    this._engine = new Engine(this._canvas, true);
    this._onSwitchSceneObservable = new Observable();
    this._sceneManager = new SceneManager(this._onSwitchSceneObservable);
    // Loading all scenes
    this._loadScene();

    // Add observer for switching scenes
    // ここらへん全部あとでsceneManagerに移す
    this._onSwitchSceneObservable.add((sceneType: SceneType) => {
      const mayBeScene = this._scenes.find((s) => s.tag === sceneType)?.scene;
      if (!(mayBeScene instanceof Scene)) {
        // ここどうするか後で考える
        console.warn("まだシーン読み取り終わってないぽよ");
      } else {
        this._currentScene = mayBeScene;
        this._engine.runRenderLoop(() => {
          this._currentScene.render();
        });
      }
    });

    // Launch Title Scene
    this._sceneManager.switchScene(SceneType.Title);

    window.addEventListener("resize", () => {
      this._engine.resize();
    });
  }

  private _loadScene() {
    this._scenes = [];
    this._scenes.push({
      tag: SceneType.Title,
      scene: makeScene(this._engine, this._onSwitchSceneObservable),
    });
  }

  private _createCanvas() {
    // Commented out for development
    // document.documentElement.style["overflow"] = "hidden";
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

    // create the canvas html element and attach it to the webpage
    this._canvas = document.createElement("canvas");
    this._canvas.style.width = "100%";
    this._canvas.style.height = "100%";
    this._canvas.id = "appCanvas";
    document.body.appendChild(this._canvas);

    return this._canvas;
  }
}

// eslint-disable-next-line no-unused-vars
// const app: App = new App();

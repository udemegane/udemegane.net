import { Engine, Observable, Scene } from "@babylonjs/core";
import { SceneManager } from "./sceneManager";
import { SceneType, TaggedScene } from "./scenes/sceneTypes";
import makeTitleScene from "./scenes/title";

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
      scene: makeTitleScene(this._engine, this._onSwitchSceneObservable),
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
const app: App = new App();

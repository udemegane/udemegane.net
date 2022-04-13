// WIP!!!!!!!!!!!!!!!!!!!!
import { Observable, Scene } from "@babylonjs/core";
import { SceneType } from "./scenes/sceneTypes";

export class SceneManager {
  private _scene: Scene;
  private _sceneType: SceneType;
  private _onSwitchSceneObservable: Observable<SceneType>;

  constructor(onswitchSceneObservable: Observable<SceneType>) {
    this._onSwitchSceneObservable = onswitchSceneObservable;
  }

  get scene(): Scene {
    return this._scene;
  }

  get sceneType(): SceneType {
    return this.sceneType;
  }

  public switchScene(type: SceneType) {
    this._sceneType = type;
    this._onSwitchSceneObservable.notifyObservers(type);
  }
}

import { Observable, Scene } from "@babylonjs/core";
import { SceneData } from "../app";

export const SceneType = {
  Title: 0,
  Debug: -1,
} as const;
export type SceneScript = (
  scene: Scene,
  onAppEventObservable: Observable<SceneData>
) => Promise<Scene>;
// eslint-disable-next-line no-redeclare
export type SceneType = typeof SceneType[keyof typeof SceneType];

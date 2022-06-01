export const SceneType = {
  Title: 0,
} as const;
// eslint-disable-next-line no-redeclare
export type SceneType = typeof SceneType[keyof typeof SceneType];

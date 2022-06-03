import { Color3, Vector3 } from "@babylonjs/core";

const deg2rad = (deg: number) => (deg * Math.PI) / 180;

export const initParams = {
  camera: {
    position: new Vector3(-2.055, 1.15, 6.44),
    rotation: new Vector3(deg2rad(10), deg2rad(193), 0),
  },
  postprocess: {
    default: {
      tone_mapping: true,
      contrast: 1, // 0 to 5
      exposure: 1, // 0 to 5
      color_curves: true,
      bloom: {
        enabled: false,
        kernel: 20, // 0 to 500
        weight: 0.2, // 0 to 1
        threshold: 0.1, // 0 to 1
        scale: 1.0,
      },
      dof: false,
      chromatic_aberration: {
        enabled: false,
        amount: 0,
        radial_intensity: 0,
        direction: 0,
      },
      sharpen: {
        enabled: false,
        edge: 0.5,
        color: 1.0,
      },
      vignette: {
        enabled: false,
        multiply: false,
        weight: 0.2,
        color: "#000000ff",
      },
    },
    lens: {
      edge_blur: 1.0,
      chromatic_aberration: 1.0,
      distortion: 1.0,
      dof_focus_distance: 3.0,
      dof_aperture: 1.5, // set this very high for tilt-shift effect
      grain_amount: 1.0,
      dof_pentagon: true,
      dof_gain: 1.0,
      dof_threshold: 0.85,
      dof_darken: 0.08,
    },
  },
} as const;

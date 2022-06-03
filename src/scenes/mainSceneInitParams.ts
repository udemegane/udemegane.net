import { Color3, Vector3 } from "@babylonjs/core";

const deg2rad = (deg: number) => (deg * Math.PI) / 180;

export const initParams = {
  camera: {
    position: new Vector3(-2.055, 1.25, 6.44),
    rotation: new Vector3(deg2rad(13), deg2rad(193), 0),
  },
  godray: {
    position: new Vector3(0.9, 2.9, -11),
    rotation: new Vector3(deg2rad(308), deg2rad(27.1), deg2rad(1.4)),
    scale: new Vector3(5, 10, 1),
    exposure: 0.08,
    density: 0.8,
  },
  twitter: {
    position: new Vector3(-2.805, 0.61, 5.166),
    rotation: new Vector3(deg2rad(-58.7), deg2rad(12.35), deg2rad(169.9)),
    scale: new Vector3(0.018, -0.018, 0.018),
  },
  postprocess: {
    default: {
      tone_mapping: true,
      contrast: 1, // 0 to 5
      exposure: 0.95, // 0 to 5
      color_curves: true,
      bloom: {
        enabled: true,
        kernel: 50, // 0 to 500
        weight: 0.2, // 0 to 1
        threshold: 0.41, // 0 to 1
        scale: 1.0,
      },
      dof: {
        enabled: true,
        focus_distance: 2000,
        f_stop: 6.0,
        focal_length: 190,
      },
      chromatic_aberration: {
        enabled: true,
        amount: 20,
        radial_intensity: 0.6,
        direction: 0,
      },
      sharpen: {
        enabled: true,
        edge: 0.1,
        color: 0.83,
      },
      vignette: {
        enabled: true,
        multiply: false,
        weight: 3.04,
        fov: 0.18,
        x: 0.8,
        y: 0.0,
        color: "#0c0400ff",
      },
    },
    lens: {
      edge_blur: 1.0,
      chromatic_aberration: 1.0,
      distortion: 0.1,
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

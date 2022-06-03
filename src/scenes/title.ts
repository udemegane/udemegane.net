import {
  Color3,
  Color4,
  CubeTexture,
  DefaultRenderingPipeline,
  DepthOfFieldEffectBlurLevel,
  FreeCamera,
  HemisphericLight,
  LensRenderingPipeline,
  Mesh,
  MeshBuilder,
  Observable,
  PBRMaterial,
  Scene,
  SceneLoader,
  TargetCamera,
  Texture,
  Vector2,
  Vector3,
  VolumetricLightScatteringPostProcess,
} from "@babylonjs/core";
import { WaterMaterial } from "@babylonjs/materials";
// import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
import "@babylonjs/loaders/glTF";
import { FolderApi, InputParams, Pane } from "tweakpane";
import { initParams } from "./mainSceneInitParams";
import { SceneData } from "../app";
import { SceneType } from "./sceneTypes";

const tickEvent =
  (base: number, delta: number) => (cb: (tick: number) => void) => () => {
    cb((base += delta));
  };
const tickOne = tickEvent(0, 1);

// WIP
const setUpDebugUI =
  (pane: Pane) => (name: string, bindFunc: (f: FolderApi) => void) => {
    const f = pane.addFolder({
      title: name,
      expanded: true,
    });
    bindFunc(f);
  };

const setUpDefaultPipeline = (
  scene: Scene,
  camera: TargetCamera,
  paramController?: (name: string, bindFunc: (f: FolderApi) => void) => void
): DefaultRenderingPipeline => {
  const defaultPipeline = new DefaultRenderingPipeline(
    "defaultPipeline",
    true,
    scene,
    [camera]
  );
  defaultPipeline.fxaaEnabled = true;
  const initEffects = () => {
    const params = initParams.postprocess.default;
    defaultPipeline.imageProcessing.toneMappingEnabled = params.tone_mapping;
    defaultPipeline.imageProcessing.contrast = params.contrast;
    defaultPipeline.imageProcessing.exposure = params.exposure;
    defaultPipeline.imageProcessing.colorCurvesEnabled = params.color_curves;
    defaultPipeline.imageProcessing.vignetteEnabled = params.vignette.enabled;
    defaultPipeline.imageProcessing.vignetteWeight = params.vignette.weight;
    defaultPipeline.imageProcessing.vignetteCameraFov = params.vignette.fov;
    defaultPipeline.imageProcessing.vignetteCentreX = params.vignette.x;
    defaultPipeline.imageProcessing.vignetteCentreY = params.vignette.y;
    defaultPipeline.imageProcessing.vignetteColor = new Color4(
      parseInt(params.vignette.color.substring(1, 3), 16),
      parseInt(params.vignette.color.substring(3, 5), 16),
      parseInt(params.vignette.color.substring(5, 7), 16),
      parseInt(params.vignette.color.substring(7, 9), 16)
    );
    defaultPipeline.bloomEnabled = params.bloom.enabled;
    defaultPipeline.bloomWeight = params.bloom.weight;
    defaultPipeline.bloomKernel = params.bloom.kernel;
    defaultPipeline.bloomThreshold = params.bloom.threshold;
    defaultPipeline.bloomScale = params.bloom.scale;
    defaultPipeline.depthOfFieldEnabled = params.dof.enabled;
    defaultPipeline.depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.High;
    defaultPipeline.depthOfField.fStop = params.dof.f_stop;
    defaultPipeline.depthOfField.focalLength = params.dof.focal_length;
    defaultPipeline.depthOfField.focusDistance = params.dof.focus_distance;
    defaultPipeline.chromaticAberrationEnabled =
      params.chromatic_aberration.enabled;
    defaultPipeline.chromaticAberration.aberrationAmount =
      params.chromatic_aberration.amount;
    defaultPipeline.chromaticAberration.radialIntensity =
      params.chromatic_aberration.radial_intensity;
    defaultPipeline.chromaticAberration.direction.x =
      params.chromatic_aberration.direction === 0
        ? 0
        : Math.sin(params.chromatic_aberration.direction);
    defaultPipeline.chromaticAberration.direction.y =
      params.chromatic_aberration.direction === 0
        ? 0
        : Math.cos(params.chromatic_aberration.direction);
    defaultPipeline.sharpenEnabled = params.sharpen.enabled;
    defaultPipeline.sharpen.colorAmount = params.sharpen.color;
    defaultPipeline.sharpen.edgeAmount = params.sharpen.edge;
  };
  initEffects();
  // defaultPipeline.bloomEnabled = true;
  // defaultPipeline.bloomKernel = 20;
  // defaultPipeline.bloomWeight = 0.2;

  if (paramController) {
    const adjustGui = (f: FolderApi) => {
      const params = initParams.postprocess.default;
      f.addInput(params, "tone_mapping").on("change", (ev) => {
        defaultPipeline.imageProcessing.toneMappingEnabled = ev.value;
      });
      f.addInput(params, "contrast", { min: 0, max: 5 }).on("change", (ev) => {
        defaultPipeline.imageProcessing.contrast = ev.value;
      });
      f.addInput(params, "exposure", { min: 0, max: 10 }).on("change", (ev) => {
        defaultPipeline.imageProcessing.exposure = ev.value;
      });
      f.addInput(params, "color_curves").on("change", (ev) => {
        defaultPipeline.imageProcessing.colorCurvesEnabled = ev.value;
      });

      // bloom setting
      const bloom = f.addFolder({ title: "bloom", expanded: false });
      ((bloom: FolderApi, params) => {
        bloom.addInput(params, "enabled").on("change", (ev) => {
          defaultPipeline.bloomEnabled = ev.value;
        });
        bloom
          .addInput(params, "kernel", { min: 0, max: 100 })
          .on("change", (ev) => {
            defaultPipeline.bloomKernel = ev.value;
          });
        bloom
          .addInput(params, "weight", { min: 0, max: 1 })
          .on("change", (ev) => {
            defaultPipeline.bloomWeight = ev.value;
          });
        bloom
          .addInput(params, "threshold", { min: 0, max: 1 })
          .on("change", (ev) => {
            defaultPipeline.bloomThreshold = ev.value;
          });
        bloom
          .addInput(params, "scale", { min: 0, max: 1 })
          .on("change", (ev) => {
            defaultPipeline.bloomScale = ev.value;
          });
      })(bloom, params.bloom);

      // DoF setting
      const dof = f.addFolder({ title: "dof", expanded: true });
      ((fd: FolderApi, params) => {
        defaultPipeline.depthOfFieldBlurLevel =
          DepthOfFieldEffectBlurLevel.High;
        fd.addInput(params, "enabled").on("change", (ev) => {
          defaultPipeline.depthOfFieldEnabled = ev.value;
        });
        fd.addInput(params, "focus_distance", { min: 0, max: 10000 }).on(
          "change",
          (ev) => {
            defaultPipeline.depthOfField.focusDistance = ev.value;
          }
        );
        fd.addInput(params, "f_stop", { min: 0, max: 20 }).on(
          "change",
          (ev) => {
            defaultPipeline.depthOfField.fStop = ev.value;
          }
        );
        fd.addInput(params, "focal_length", { min: -100, max: 300 }).on(
          "change",
          (ev) => {
            defaultPipeline.depthOfField.focalLength = ev.value;
          }
        );
      })(dof, params.dof);

      // chromatic aberration setting
      const chromaticAberration = f.addFolder({
        title: "chromatic_aberration",
        expanded: true,
      });
      ((fc: FolderApi, params) => {
        fc.addInput(params, "enabled").on("change", (ev) => {
          defaultPipeline.chromaticAberrationEnabled = ev.value;
        });
        fc.addInput(params, "amount", { min: -100, max: 100 }).on(
          "change",
          (ev) => {
            defaultPipeline.chromaticAberration.aberrationAmount = ev.value;
          }
        );
        fc.addInput(params, "radial_intensity", { min: 0, max: 5 }).on(
          "change",
          (ev) => {
            defaultPipeline.chromaticAberration.radialIntensity = ev.value;
          }
        );
        fc.addInput(params, "direction", { min: 0, max: Math.PI * 2 }).on(
          "change",
          (ev) => {
            if (ev.value === 0) {
              defaultPipeline.chromaticAberration.direction.x = 0;
              defaultPipeline.chromaticAberration.direction.y = 0;
            } else {
              defaultPipeline.chromaticAberration.direction.x = Math.sin(
                ev.value
              );
              defaultPipeline.chromaticAberration.direction.y = Math.cos(
                ev.value
              );
            }
          }
        );
      })(chromaticAberration, params.chromatic_aberration);
      const sharpen = f.addFolder({ title: "sharpen", expanded: true });
      ((fs: FolderApi, params) => {
        fs.addInput(params, "enabled").on("change", (ev) => {
          defaultPipeline.sharpenEnabled = ev.value;
        });
        fs.addInput(params, "edge", { min: 0, max: 2 }).on("change", (ev) => {
          defaultPipeline.sharpen.edgeAmount = ev.value;
        });
        fs.addInput(params, "color", { min: 0, max: 1 }).on("change", (ev) => {
          defaultPipeline.sharpen.colorAmount = ev.value;
        });
      })(sharpen, params.sharpen);
      const vignette = f.addFolder({ title: "vignette", expanded: true });
      ((fv: FolderApi, params) => {
        fv.addInput(params, "enabled").on("change", (ev) => {
          defaultPipeline.imageProcessing.vignetteEnabled = ev.value;
        });
        // fv.addInput(params, "multiply").on("change", (ev) => {});
        fv.addInput(params, "weight", { min: 0, max: 10 }).on(
          "change",
          (ev) => {
            defaultPipeline.imageProcessing.vignetteWeight = ev.value;
          }
        );
        fv.addInput(params, "fov", { min: 0, max: 1 }).on("change", (ev) => {
          defaultPipeline.imageProcessing.vignetteCameraFov = ev.value;
        });
        fv.addInput(params, "color", { picker: "inline", expanded: true }).on(
          "change",
          (ev) => {
            const r = parseInt(ev.value.substring(1, 3), 16);
            const g = parseInt(ev.value.substring(3, 5), 16);
            const b = parseInt(ev.value.substring(5, 7), 16);
            const a = parseInt(ev.value.substring(7, 9), 16);
            defaultPipeline.imageProcessing.vignetteColor = new Color4(
              r,
              g,
              b,
              a
            );
          }
        );
      })(vignette, params.vignette);
    };
    paramController("default", adjustGui);
  }

  return defaultPipeline;
};

const setUpLensRenderingPipeline = (
  scene: Scene,
  camera: TargetCamera,
  paramController?: (name: string, bindFunc: (f: FolderApi) => void) => void
): LensRenderingPipeline => {
  const params = initParams.postprocess.lens;

  const lensPipeline = new LensRenderingPipeline(
    "lenspipeline",
    params,
    scene,
    1.0,
    [camera]
  );

  if (paramController) {
    // const addInputHelper =
    const zerooneOpt: InputParams = {
      min: 0,
      max: 1,
    };
    const adjustGui = (f: FolderApi) => {
      f.addInput({ Enabled: true }, "Enabled").on("change", (ev) => {
        // lensPipeline.dis;
      });
      f.addInput(params, "edge_blur", zerooneOpt).on("change", (ev) => {
        lensPipeline.edgeBlur = ev.value;
      });
      f.addInput(params, "chromatic_aberration", zerooneOpt).on(
        "change",
        (ev) => {
          lensPipeline.chromaticAberration = ev.value;
        }
      );
      f.addInput(params, "distortion", zerooneOpt).on("change", (ev) => {
        lensPipeline.dofDistortion = ev.value;
      });
      f.addInput(params, "dof_focus_distance").on("change", (ev) => {
        lensPipeline.setFocusDistance(ev.value);
      });
      f.addInput(params, "dof_aperture", { min: 0, max: 10 }).on(
        "change",
        (ev) => {
          lensPipeline.dofAperture = ev.value;
        }
      );
      f.addInput(params, "grain_amount", zerooneOpt).on("change", (ev) => {
        lensPipeline.grainAmount = ev.value;
      });
      f.addInput(params, "dof_pentagon").on("change", (ev) => {
        lensPipeline.pentagonBokeh = ev.value;
      });
      f.addInput(params, "dof_gain", zerooneOpt).on("change", (ev) => {
        // lensPipeline
      });
      f.addInput(params, "dof_threshold", zerooneOpt).on("change", (ev) => {
        lensPipeline.highlightsThreshold = ev.value;
      });
      f.addInput(params, "dof_darken", zerooneOpt).on("change", (ev) => {
        lensPipeline.darkenOutOfFocus = ev.value;
      });
    };
    paramController("lens", adjustGui);
  }
  return lensPipeline;
};

const setGodrayEffect = (
  scene: Scene,
  camera: TargetCamera,
  paramController?: (name: string, bindFunc: (f: FolderApi) => void) => void
) => {
  const godrays = new VolumetricLightScatteringPostProcess(
    "godrays",
    1.0,
    camera,
    undefined,
    100,
    Texture.BILINEAR_SAMPLINGMODE,
    scene.getEngine()
  );
  const params = initParams.godray;
  godrays.useDiffuseColor = true;
  godrays.mesh.position = params.position;
  godrays.mesh.rotation = params.rotation;
  godrays.mesh.scaling = params.scale;
  godrays.exposure = params.exposure;
  godrays.density = params.density;

  const vibratePosition = tickOne((tick: number) => {
    const rand = Math.random();
    godrays.mesh.position.x =
      params.position.x +
      Math.sin(tick * 0.003 + rand * 0.03) * 0.0005 +
      Math.cos(tick * 0.004 + rand * 0.02) * 0.0003;
    godrays.mesh.position.y =
      params.position.y + Math.cos(tick * 0.002 + rand * 0.02) * 0.0003;
    godrays.exposure =
      params.exposure + Math.sin(tick * 0.0005 + rand * 0.005) * 0.01;
  });

  scene.onBeforeRenderObservable.add((eventData) => {
    vibratePosition();
  });
  //scene.beforeRender = vibratePosition(0, 0.1);
};

const setUpPostProcess = (scene: Scene, camera: TargetCamera): Scene => {
  const paramController = setUpDebugUI(new Pane());
  // scene.postProcessRenderPipelineManager.addPipeline(setUpLensRenderingPipeline(scene, camera, paramController));
  scene.postProcessRenderPipelineManager.addPipeline(
    setUpDefaultPipeline(scene, camera)
  );
  setGodrayEffect(scene, camera);

  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.02;
  scene.fogColor = new Color3(0.9, 0.9, 1.0);
  return scene;
};

export const titleScene = (
  scene: Scene,
  onAppEventObservable: Observable<SceneData>
): Scene => {
  const camera: FreeCamera = ((camera) => {
    camera.rotation = initParams.camera.rotation;
    camera.fov = 0.5;
    // camera.attachControl(true);
    return camera;
  })(new FreeCamera("freeCam", initParams.camera.position, scene));

  scene = setUpPostProcess(scene, camera);
  // eslint-disable-next-line no-unused-vars
  const light = new HemisphericLight(
    "ambientLight",
    new Vector3(0, 1, 0),
    scene
  );
  // skybox
  const skybox = (() => {
    const skybox = MeshBuilder.CreateBox(
      "sky",
      {
        size: 3000,
      },
      scene
    ); // Mesh.CreateBox("sky", 3000.0, scene);
    const skyMaterial = new PBRMaterial("sky", scene);
    skyMaterial.backFaceCulling = false;
    skyMaterial.reflectionTexture = new CubeTexture("texture/night.env", scene);
    skyMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    // skyMaterial.disableLighting = true;
    skyMaterial.roughness = 0.2;
    skybox.material = skyMaterial;
    return skybox;
  })();

  // water
  const waterPlane = (skybox: Mesh) => {
    // eslint-disable-next-line no-unused-vars
    const waterMesh = MeshBuilder.CreateGround(
      "ground",
      { width: 2048, height: 2048 },
      scene
    );

    const waterMaterial = new WaterMaterial(
      "water",
      scene,
      new Vector2(2048, 2048)
    );
    waterMaterial.backFaceCulling = true;
    waterMaterial.bumpTexture = new Texture("texture/940-bump.jpg", scene);
    waterMaterial.windForce = -7;
    waterMaterial.waveHeight = 2;
    waterMaterial.bumpHeight = 0.2;
    waterMaterial.waterColor = new Color3(0, 0, 190 / 255);
    waterMaterial.addToRenderList(skybox);
    waterMesh.material = waterMaterial;
    // return waterMesh;
  };

  SceneLoader.ImportMesh("", "3Dobjects/", "tree_env.glb", scene);

  const sceneMetaData: SceneData = {
    tag: SceneType.Title,
  };
  scene.metadata = sceneMetaData;
  return scene;
};

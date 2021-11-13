import Camera from "../../lib/camera";
import { createTransition } from "../../lib/func";
import rpc from "@common/rpc";
import { setPedCustomization } from "./pedCustomization";
import config from "@common/configs/character";
import { Vector } from "@client/lib/vector";
import { mp, Vector3Mp } from "ragemp-c";

const player = mp.players.local;

let x = 0;
let y = 90;
let radius = 2;
let focus: "default" | "head" | "knee" | "foot" = "default";

rpc.on("customSetFocus", (data) => {
  if (focus === data) return;

  focus = data;
  freeCamera(400);
});

const customizationPos = new Vector({
  x: -134.3624725341797,
  y: -643.2844848632812,
  z: 168.8403778076172,
});
const customizationHeading = -84.4;

let cam: Camera = null;

rpc.on("mouseWheel", (deltaY) => {
  if (!cam) return;

  radius += deltaY / 5;
  if (radius < 1) {
    radius = 1;
  }
  if (radius > 3) {
    radius = 3;
  }

  freeCamera(150);
});

rpc.on("mouseMove", ({ x: deltaX, y: deltaY }) => {
  if (!cam) return;

  x += deltaX / 10;
  y += deltaY / 10;

  if (y > 170) {
    y = 170;
  }

  if (y < 20) {
    y = 20;
  }

  freeCamera(50);
});

rpc.on("customStart", () => {
  createTransition(3000);

  mp.game.streaming.requestIpl("ex_dt1_02_office_01c");
  player.position = customizationPos;
  player.setHeading(customizationHeading);

  let relativePos = new Vector(player.position);
  let camPos = polar3DToWorld3D(relativePos, radius, x, y);

  cam = Camera.createCamera("customCam", "default", camPos, new mp.Vector3(0, 0, 0), 60);

  mp.game.streaming.requestAnimDict("random@shop_robbery"); //preload the animation
  player.taskPlayAnim("random@shop_robbery", "robbery_action_f", 0, 0, -1, 33, 0, true, true, true);
});

rpc.on("customEnd", () => {
  Camera.setActiveCamera(cam, false);
  player.stopAnimTask("random@shop_robbery", "robbery_action_f", 0);
});

const degToRad = (deg: number) => (Math.PI * deg) / 180;

function polar3DToWorld3D(entityPosition: Vector3Mp, radius: number, polarAngleDeg: number, azimuthAngleDeg: number) {

}

function freeCamera(transitionTime: number) {

}

rpc.on("customizationApply", ([sex, customization, clearClothes]) => {
  setPedCustomization(player, sex, customization, clearClothes);
});

rpc.on("setDefaultClothes", ([sex, clothesId]) => {
  let clothes = config.defaultClothes[sex][clothesId];

  if (clothesId === -1) {
    if (sex === 0) {
      player.setDefaultComponentVariation();
      player.setComponentVariation(3, 15, 0, 2);
      player.setComponentVariation(4, 21, 0, 2);
      player.setComponentVariation(6, 34, 0, 2);
      player.setComponentVariation(8, 15, 0, 2);
      player.setComponentVariation(11, 15, 0, 2);
    } else {
      player.setDefaultComponentVariation();
      player.setComponentVariation(3, 15, 0, 2);
      player.setComponentVariation(4, 17, 0, 2);
      player.setComponentVariation(6, 35, 0, 2);
      player.setComponentVariation(8, 15, 0, 2);
      player.setComponentVariation(11, 15, 0, 2);
    }
  } else {
    player.setComponentVariation(3, clothes.torso, 0, 2);
    player.setComponentVariation(11, clothes.tops, 0, 2);
    player.setComponentVariation(4, clothes.legs, 0, 2);
    player.setComponentVariation(6, clothes.shoes, 0, 2);
  }
});

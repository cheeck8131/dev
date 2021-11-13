import Camera from "../../lib/camera";
import { createTransition, fadeScreen } from "../../lib/func";
import rpc from "@common/rpc";
import "./custom";
import { Vector } from "@client/lib/vector";
import { mp } from "ragemp-c";

const player = mp.players.local;

setTimeout(() => {
  rpc.trigger("handleOnLoading");
}, 100);

const authCam = Camera.createCamera("authCam", "default", new mp.Vector3(842, 1247, 376), new mp.Vector3(0, 0, 0), 55);

function enableAuthCams() {
  authCam.pointAtCoord(-173, 602, 231);
  Camera.setActiveCamera(authCam, true);
}
enableAuthCams();

rpc.on("loginUiLoaded", () => {
  fadeScreen(false, 1000);
});

rpc.on("handleOnLoading", () => {
  player.position = new Vector({ x: 775, y: 1297, z: 362 });
  fadeScreen(true, 0);
  player.freezePosition(true);
  mp.game.graphics.transitionToBlurred(100);
  mp.gui.chat.show(false);
  mp.game.ui.displayHud(false);
  mp.game.ui.displayRadar(false);
});

rpc.on("enableAuthCams", () => {
  enableAuthCams();
  mp.game.graphics.transitionToBlurred(100);
  createTransition(500);
});

rpc.on("handleAuthOut", () => {
  mp.game.graphics.transitionFromBlurred(100);
  Camera.setActiveCamera(authCam, false);
});

rpc.on("handleSpawn", () => {
  player.freezePosition(false);
  mp.gui.chat.show(true);
  mp.game.ui.displayHud(true);
  mp.game.ui.displayRadar(true);
});

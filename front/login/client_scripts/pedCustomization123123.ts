import { mp, PedMp, PlayerMp } from "ragemp-c";

const playerModels = [mp.game.joaat("MP_M_Freemode_01"), mp.game.joaat("MP_F_Freemode_01")];

// const GET_ENTITY_HEIGHT_ABOVE_GROUND = "0x1DD55701034110E5";

export function setPedCustomization(entity: PlayerMp | PedMp, sex: 0 | 1, customization: any, clearClothes?: boolean, modelType: number = 0, modelName: string = "") {
  if (modelType) {
    entity.model = mp.game.joaat(modelName);
  } else {
    entity.model = playerModels[sex];
  }

  if (clearClothes) {
    if (sex === 0) {
      entity.setDefaultComponentVariation();
      entity.setComponentVariation(3, 15, 0, 2);
      entity.setComponentVariation(4, 21, 0, 2);
      entity.setComponentVariation(6, 34, 0, 2);
      entity.setComponentVariation(8, 15, 0, 2);
      entity.setComponentVariation(11, 15, 0, 2);
    } else {
      entity.setDefaultComponentVariation();
      entity.setComponentVariation(3, 15, 0, 2);
      entity.setComponentVariation(4, 17, 0, 2);
      entity.setComponentVariation(6, 35, 0, 2);
      entity.setComponentVariation(8, 15, 0, 2);
      entity.setComponentVariation(11, 15, 0, 2);
    }
  }

  customization.faceFeatures.forEach((scale, index) => {
    entity.setFaceFeature(index, scale);
  });
  customization.appearance.forEach((value, index) => {
    let overlayID = value == 0 ? 255 : value - 1;

    if (entity.type === "player") {
      let player = entity as PlayerMp;
      player.setHeadOverlay(index, overlayID, 1, 0, 0);
    } else {
      let ped = entity as PedMp;
      ped.setHeadOverlay(index, overlayID, 1);
    }
  });
  entity.setComponentVariation(2, customization.head.hair, 0, 2);
  entity.setEyeColor(customization.head.eyeColor);
  entity.setHairColor(customization.head.hairColor, customization.head.hairHighlight);
  entity.setHeadOverlayColor(1, 1, customization.head.beardColor, 0);
  entity.setHeadOverlayColor(2, 1, customization.head.eyebrowColor, 0);
  entity.setHeadOverlayColor(5, 2, customization.head.blushColor, 0);
  entity.setHeadOverlayColor(8, 2, customization.head.lipstickColor, 0);
  entity.setHeadOverlayColor(10, 1, customization.head.chestHairColor, 0);
  entity.setHeadBlendData(
    customization.heredity.mother, // Лицо
    customization.heredity.father,
    0,
    customization.heredity.mother, // Кожа
    customization.heredity.father,
    0,
    customization.heredity.similarity, // Схожесть
    customization.heredity.skinSimilarity,
    0.0,
    false
  );
}

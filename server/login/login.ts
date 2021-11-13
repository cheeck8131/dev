import crypto from "crypto";
import { mp, PlayerMp } from "ragemp-s";
import { Character, Customization, Player } from "@server/db/player";
import { UCPAnswer, Question, AdminUcp } from "@server/db/ucpAnswers";
import { PlayerModel } from "../db/player";
import { addTriggerListener } from "../lib/events";
import { InviteCodeModel, InviteCodeDocument, InviteCode } from "../db/inviteCode";
import { UcpAnswerModel } from "../db/ucpAnswers";
import { UcpQuestionModel } from "../db/ucpQuestions";
import { Vector } from "@server/lib/vector";
import { namespace, Service } from "@server/lib/service_alpha0.3.7";

type AdminPanelQuestion = ArrayElement<AdminUcp["questions"]>;

const questionsMap = new Map<string, Question[]>();
const adminUcpQueue = new Map<string, PlayerMp>();
const playerInQueue = new Set<PlayerMp>();

mp.events.add(RageEnums.EventKey.PLAYER_QUIT, (player: PlayerMp) => {
  Service.services.login.exitFromUcp(player);
});

addTriggerListener({
  async ready(player) {
    player.dimension = player.id + 1;

    const doc = await PlayerModel.findOne({ rgscId: player.rgscId });

    player.db = doc;

    console.log("ready");

    player.dispatch({ type: "LOGIN_SET_DATA", data: { isRegistered: Boolean(player.db) } });
    player.dispatch({ type: "GUI_SET", gui: "login" });
  },
  adminExitFromUcp(player) {
    Service.services.login.exitFromUcp(player);
  },
  playerInQueue(player, add: boolean) {
    if (add) {
      playerInQueue.add(player);
      Service.services.login.updatePlayerInQueue(player);
    } else {
      playerInQueue.delete(player);
    }
  },
});

@namespace
export class Login extends Service {
  async updatePlayerInQueue(p: PlayerMp) {
    if (!p.db) return;

    let answers = await UcpAnswerModel.find({ status: "waiting" }, { ownerId: true, date: true });
    answers = answers.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let userAnswer = answers.find((x) => x.ownerId.equals(p.db._id));

    p.dispatch({ type: "LOGIN_SET_QUEUE", queueNumber: answers.indexOf(userAnswer) + 1 });
  }

  exitFromUcp = (player: PlayerMp) => {
    for (let e of adminUcpQueue.entries()) {
      if (e[1] === player) {
        adminUcpQueue.delete(e[0]);
      }
    }
  };

  spawn = (player: PlayerMp) => {
    player.setGui(null);
    player.triggerClient("handleSpawn");
    player.position = new Vector(player.character.position);
    player.heading = player.character.heading;
  };

  getUcpQuestions = async (player: PlayerMp) => {
    function getRandom(arr: any[], n: number) {
      let result = new Array(n),
        len = arr.length,
        taken = new Array(len);

      if (n > len) throw new RangeError("getRandomQuestions: more elements taken than available");

      while (n--) {
        const x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
      }
      return result;
    }

    let questions = questionsMap.get(String(player.db._id));

    if (!questions) {
      questions = getRandom(
        (await UcpQuestionModel.find()).map((x) => ({ text: x.text, answer: "", status: "waiting" })),
        3
      );

      questionsMap.set(String(player.db._id), questions);
    }

    return questions;
  };

  getHash = (str: string) => {
    const hash = crypto.createHash("sha256");
    let passwordHash = hash.update(str);
    passwordHash.update("privateKey_2017");
    return passwordHash.digest("hex");
  };

  async rpcTryRegister(player: PlayerMp, login: string, email: string, password: string, inviteCode?: string) {
    let inviteDoc: InviteCodeDocument;

    if (inviteCode) {
      inviteDoc = await InviteCodeModel.findOne({ code: inviteCode });

      if (inviteDoc) {
        await inviteDoc.remove();
      } else if (inviteCode === "access") {
        inviteDoc = new InviteCodeModel(new InviteCode("access", null));
        player.setAlert("warning", "Предупреждение безопасности: Невозможно проверить подлинность/принадлежность инвайт-кода к сущности");
      } else {
        player.dispatch({ type: "LOGIN_SET_ERRORS", errors: { index: "invite", text: "Проверьте правильность кода" } });
        player.setAlert("error", "Вы ввели неверный инвайт-код");
        return;
      }
    }

    const p = new Player(player.rgscId, login, this.getHash(password), email, inviteDoc ? inviteDoc.owner : null, Boolean(inviteDoc));
    const doc = new PlayerModel(p);

    await doc.save();

    player.db = doc;
    player.dispatch({ type: "LOGIN_SET_DATA", data: { isRegistered: true, isUcp: true, ucpAnswers: await this.getUcpQuestions(player) } });

    player.setAlert("success", "Вы успешно зарегистрировались");

    if (doc.isVerified) {
      player.setGui("customization");
    }
  }

  async rpcTryLogin(player: PlayerMp, login: string, password: string) {
    player.isAuthed = player.db.login === login && player.db.passwordHash === this.getHash(password);

    if (!player.isAuthed) {
      if (player.db.login === login) {
        player.dispatch({ type: "LOGIN_SET_ERRORS", errors: { index: "password", text: "Проверьте правильность пароля" } });
        player.setAlert("error", "Вы ввели неверный пароль");
        return;
      } else {
        player.dispatch({ type: "LOGIN_SET_ERRORS", errors: { index: "name", text: "Проверьте правильность логина" } });
        player.setAlert("error", "Вы ввели неверный логин");
        return;
      }
    }

    if (player.db.isVerified) {
      if (player.db.characters.length === 0) {
        player.setGui("customization");
      } else {
        player.dispatch({ type: "CHARACTERS_SET_LIST", characters: player.db.characters });
        player.setGui("characters");
      }
    } else {
      const answer = await UcpAnswerModel.findOne({ ownerId: player.db._id });

      let isWaiting = false;
      if (answer) {
        isWaiting = answer.status === "waiting";

        if (answer.status === "decilined") {
          player.dispatch({ type: "LOGIN_SET_DATA", data: { ucpAnswers: answer.questions } });
        }
      } else {
        player.dispatch({ type: "LOGIN_SET_DATA", data: { ucpAnswers: await this.getUcpQuestions(player) } });
      }

      player.dispatch({ type: "LOGIN_SET_DATA", data: { isRegistered: true, isUcp: true, isHelloPassed: true, isWaiting } });
    }

    player.setAlert("success", "Вы успешно авторизовались");
  }

  rpcSelectCharacter(player: PlayerMp, index: number) {
    let character = player.db.characters[index];
    if (!character) {
      player.setAlert("error", "internal error");
    } else {
      player.character = character;
      player.setAlert("success", `Вы успешно вошли за ${character.ruName}`);
      this.spawn(player);
    }
  }

  async rpcCreateCharacter(player: PlayerMp, sex: 0 | 1, customization: Customization, name: string, ruName: string, age: number) {
    if (player.db.characters.length >= 3) {
      player.setAlert("error", "У Вас максимальное кол-во персонажей");
      return;
    }

    const character = new Character(name, ruName, age, sex, customization);

    player.db.characters.push(character);
    await player.db.save();

    player.setAlert("success", "Вы успешно создали персонажа");

    player.character = character;
    this.spawn(player);
  }

  async rpcSendUcpAnswers(player: PlayerMp, questions: Question[]) {
    const answer = await UcpAnswerModel.findOne({ ownerId: player.db._id });

    if (answer) {
      answer.questions = questions;
      answer.status = "waiting";

      await answer.save();
    } else {
      const answer = new UCPAnswer(player.db._id, new Date(), "waiting", questions);

      const q = new UcpAnswerModel(answer);
      await q.save();
    }

    player.setAlert("success", "Заявка успешно отправлена");
    player.dispatch({ type: "LOGIN_SET_DATA", data: { isWaiting: true } });
    this.updatePlayerInQueue(player);
  }

  async rpcAdminGetUcpQ(player: PlayerMp) {
    let dataList = await UcpAnswerModel.find({ status: "waiting" });

    dataList = dataList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    dataList = dataList.filter((x) => !adminUcpQueue.has(String(x._id)));

    if (dataList.length === 0) {
      player.setAlert("warning", "Нет доступных заявок");
      player.dispatch({ type: "UCP_SET_QUESTIONS", data: { login: "", questions: [] } });
      return;
    }

    const data = dataList[0];

    const rawPlayer = await PlayerModel.findOne({ _id: data.ownerId });
    if (!rawPlayer) {
      await data.remove();
      player.setAlert("error", "Ошибка, повторите попытку");
      return;
    }

    const login = rawPlayer.login;

    const questionsPrimises = data.questions.map(async (question) => {
      let questionText = question.text;
      let answer = question.answer;

      let rawData = await UcpAnswerModel.find({ "questions.text": questionText, $text: { $search: answer } }, { score: { $meta: "textScore" } })
        .select({ textScore: 1, "questions.text": 1, "questions.answer": 1, ownerId: 1 })
        .sort({ score: { $meta: "textScore" } })
        .limit(4)
        .exec();

      let data = rawData.map((x) => ({
        score: (x as any)._doc.score,
        ownerId: x.ownerId,
        questions: x.questions.filter((y) => y.text === questionText),
      }));

      const maxScore = data[0].score;
      data.remove(data[0]);

      let similarityPromises = data.map(async (x) => {
        const userLogin = (await PlayerModel.findOne({ _id: x.ownerId }))?.login;

        return { login: userLogin, text: x.questions[0].answer, score: ~~((x.score / maxScore) * 100) };
      });

      let similarity = await Promise.all(similarityPromises);

      let ret: AdminPanelQuestion = {
        date: new Date(),
        status: question.status,
        text: question.text,
        reasonToDeciline: "",
        answer: question.answer,
        isSemilarity: similarity,
      };

      return ret;
    });

    const questions = await Promise.all(questionsPrimises);

    adminUcpQueue.set(String(data._id), player);

    player.dispatch({ type: "UCP_SET_QUESTIONS", data: { login, questions } });
  }

  async rpcUpdateAdminAnswers(player: PlayerMp, ucp: AdminUcp) {
    let accepted = true;

    for (const quest of ucp.questions) {
      if (quest.status === "decilined") {
        accepted = false;
      }
    }

    let owner = await PlayerModel.findOne({ login: ucp.login });
    let data = await UcpAnswerModel.findOne({ ownerId: owner._id });

    data.status = accepted ? "accepted" : "decilined";
    data.questions = ucp.questions.map((x) => ({
      adminAnswer: x.reasonToDeciline,
      text: x.text,
      answer: x.answer,
      status: x.status,
    }));
    data.date = new Date();

    await data.save();

    player.setGui(null);
    player.dispatch({ type: "UCP_SET_QUESTIONS", data: { questions: [], login: "" } });
    player.setAlert(accepted ? "success" : "warning", accepted ? "Вы подтвердили заявку" : "Вы отклонили заявку");

    let isOnline = mp.players
      .toArray()
      .filter((x) => x.db)
      .find((x) => x.db.login === ucp.login);

    if (isOnline) {
      if (accepted) {
        isOnline.dispatch({ type: "LOGIN_SET_DATA", data: { isWaiting: false } });
        isOnline.db.isVerified = true;
        await isOnline.db.save();
        this.spawn(isOnline);
      } else {
        isOnline.dispatch({ type: "LOGIN_SET_DATA", data: { isWaiting: false, ucpAnswers: data.questions } });
      }
    } else {
      owner.isVerified = true;
      await owner.save();
    }

    playerInQueue.forEach((p) => this.updatePlayerInQueue(p));
  }
}

(async () => {
  // let answer = "маша и медведь и";
  // let questionText = "2";
  // let rawData = await UcpAnswer.find({ "questions.text": questionText, $text: { $search: answer } }, { score: { $meta: "textScore" } })
  //   .select({ textScore: 1, "questions.text": 1, "questions.answer": 1, ownerId: 1 })
  //   .sort({ score: { $meta: "textScore" } })
  //   .limit(4)
  //   .exec();
  // let data = rawData.map((x) => ({
  //   score: (x as any)._doc.score,
  //   ownerId: x.ownerId,
  //   questions: x.questions.filter((y) => y.text === questionText),
  // }));
  // let similarityPromise = data.map(async (x) => {
  //   const userLogin = (await Player.findOne({ _id: x.ownerId }))?.login;
  //   return { login: userLogin, text: x.questions[0].answer, score: x.score };
  // });
  // let similarity = await Promise.all(similarityPromise);
  // console.log(JSON.stringify(similarity, null, "  "));
})();

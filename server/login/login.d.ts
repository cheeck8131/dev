import { Customization } from "@server/db/player";
import { Question, AdminUcp } from "@server/db/ucpAnswers";
import { Service } from "@server/lib/service";
import { PlayerMp } from "ragemp-s";
export declare class Login extends Service {
    rpcTryRegister(player: PlayerMp, login: string, email: string, password: string, inviteCode?: string): Promise<void>;
    rpcTryLogin(player: PlayerMp, login: string, password: string): Promise<void>;
    rpcSelectCharacter(player: PlayerMp, index: number): void;
    rpcCreateCharacter(player: PlayerMp, sex: 0 | 1, customization: Customization, name: string, ruName: string, age: number): Promise<void>;
    rpcSendUcpAnswers(player: PlayerMp, questions: Question[]): Promise<void>;
    rpcAdminGetUcpQ(player: PlayerMp): Promise<void>;
    rpcUpdateAdminAnswers(player: PlayerMp, ucp: AdminUcp): Promise<void>;
}

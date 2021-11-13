import type { UCPAnswer } from "@server/db/ucpAnswers";
declare type LoginActions = {
    type: "LOGIN_SET_DATA";
    data: {
        isHelloPassed?: boolean;
        isRegistered?: boolean;
        isUcp?: boolean;
        isWaiting?: boolean;
        ucpAnswers?: UCPAnswer["questions"];
    };
} | {
    type: "LOGIN_SET_ERRORS";
    errors: Errors | null;
} | {
    type: "LOGIN_SET_QUEUE";
    queueNumber: number;
};
export interface Errors {
    index: any;
    text: string;
}
export interface ILoginState {
    isHelloPassed: boolean;
    isRegistered: boolean;
    isUcp: boolean;
    isWaiting: boolean;
    ucpAnswers: UCPAnswer["questions"];
    errors: Errors | null;
    queueNumber: number;
}
declare const reducer: (state: ILoginState, action: LoginActions) => ILoginState;
export default reducer;

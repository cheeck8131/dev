declare type LoginActions = {
    type: "LOGIN_SET_INPUTS";
    inputs: {
        login?: string;
        email?: string;
        password?: string;
        inviteCode?: string;
        eyeState?: boolean;
    };
};
export interface ILoginState {
    login: string;
    email: string;
    password: string;
    inviteCode: string;
    eyeState: boolean;
}
declare const reducer: (state: ILoginState, action: LoginActions) => ILoginState;
export default reducer;

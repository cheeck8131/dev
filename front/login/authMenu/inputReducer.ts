type LoginActions = {
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

const initialState: ILoginState = {
  login: "",
  email: "",
  password: "",
  inviteCode: "",
  eyeState: false,
};

const reducer = (state = initialState, action: LoginActions): ILoginState => {
  switch (action.type) {
    case "LOGIN_SET_INPUTS": {
      return {
        ...state,
        ...action.inputs,
      };
    }

    default: {
      return state;
    }
  }
};

export default reducer;

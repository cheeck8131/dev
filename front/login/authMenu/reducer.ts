import type { UCPAnswer } from "@server/db/ucpAnswers";

type LoginActions =
  | {
      type: "LOGIN_SET_DATA";
      data: {
        isHelloPassed?: boolean;
        isRegistered?: boolean;
        isUcp?: boolean;
        isWaiting?: boolean;
        ucpAnswers?: UCPAnswer["questions"];
      };
    }
  | {
      type: "LOGIN_SET_ERRORS";
      errors: Errors | null;
    }
  | {
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

const initialState: ILoginState = {
  isHelloPassed: false,
  isRegistered: false,
  isUcp: false,
  isWaiting: false,
  ucpAnswers: [],
  errors: null,
  queueNumber: -1,
};

const reducer = (state = initialState, action: LoginActions): ILoginState => {
  switch (action.type) {
    case "LOGIN_SET_ERRORS": {
      return {
        ...state,
        errors: action.errors,
      };
    }

    case "LOGIN_SET_DATA": {
      return { ...state, ...action.data };
    }

    case "LOGIN_SET_QUEUE": {
      return {
        ...state,
        queueNumber: action.queueNumber,
      };
    }

    default: {
      return state;
    }
  }
};

export default reducer;

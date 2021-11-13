import { Character } from "@common/types/player";

type CharactersActions = {
  type: "CHARACTERS_SET_LIST";
  characters: Character[];
};

export interface ICharactersState {
  characters: Character[];
}

const initialState: ICharactersState = {
  characters: [],
};

const reducer = (state = initialState, action: CharactersActions): ICharactersState => {
  switch (action.type) {
    case "CHARACTERS_SET_LIST": {
      return {
        ...state,
        characters: action.characters,
      };
    }

    default: {
      return state;
    }
  }
};

export default reducer;

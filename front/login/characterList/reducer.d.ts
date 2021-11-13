import { Character } from "@common/types/player";
declare type CharactersActions = {
    type: "CHARACTERS_SET_LIST";
    characters: Character[];
};
export interface ICharactersState {
    characters: Character[];
}
declare const reducer: (state: ICharactersState, action: CharactersActions) => ICharactersState;
export default reducer;

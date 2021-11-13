import s from "./characters.module.scss";
import cls from "classnames";
import rpc from "rage-rpc";
import { server } from "@common/service";

// setTimeout(() => {
//   setGui("characters");
// }, 1000);

export default function Characters() {
  const charactersState = useSelector((state) => state.characters);
  const [focus, setFocus] = useState(-1);

  useEffect(() => {
    rpc.triggerClient("enableAuthCams");

    return () => rpc.triggerClient("handleAuthOut");
  }, []);

  let currentCharacter = charactersState.characters[focus];

  return (
    <div className={s.root}>
      <div className={s.block}>
        <h1 className={s.header}>Ваши персонажи</h1>

        {currentCharacter && (
          <div className={cls(s.hover)}>
            <h1 className={s.name}>{currentCharacter.name}</h1>
            <p>
              Пол: <span className={s.yellow}>{currentCharacter.sex ? "Женский" : "Мужской"}</span>
            </p>
            <p>
              Возраст: <span className={s.yellow}>{currentCharacter.age}</span>
            </p>
            <p>
              Деньги на руках: <span className={s.green}>${currentCharacter.money.toLocaleString()}</span>
            </p>
            <p>
              Деньги в банке: <span className={s.green}>${currentCharacter.bankMoney}</span>
            </p>
            <p>Дата создания: {new Date(currentCharacter.creationDate).toLocaleDateString()}</p>
            <p>Последний логин: {new Date(currentCharacter.lastSeen).toLocaleDateString()}</p>
            <p>Всего отыграно: {currentCharacter.hours} часов</p>
          </div>
        )}

        {new Array(3).fill(null).map((_, index) => {
          let character = charactersState.characters[index];

          if (character) {
            return (
              <div className={cls(s.character, { [s.active]: index === focus })} key={index} onClick={() => setFocus(index)}>
                {character.name}
              </div>
            );
          } else {
            return (
              <div className={cls(s.character, s.free)} key={index} onClick={() => setFocus(-1)}>
                Пустой слот
              </div>
            );
          }
        })}
      </div>

      <div
        className={s.bottomBtn}
        onClick={async () => {
          if (focus === -1) {
            setGui("customization");
          } else {
            await server.login.selectCharacter.async(focus);
          }
        }}
      >
        {focus === -1 ? "Создать" : "Выбрать"}
      </div>
    </div>
  );
}

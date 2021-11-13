/* eslint-disable jsx-a11y/anchor-is-valid */
import rpc from "rage-rpc";
import styles from "./styles.module.scss";
import clx from "classnames";
import { useKey } from "../../../lib/keyboard";
import valid from "validator";
import logo from "./img/logo.png";
import { server } from "@common/service";

export default function Login() {
  const { isHelloPassed, isRegistered, isUcp, isWaiting, ucpAnswers, errors, queueNumber } = useSelector((state) => state.login);
  const dispatch = useDispatch();

  const setLogin = (login: string) => dispatch({ type: "LOGIN_SET_INPUTS", inputs: { login } });
  const setPass = (password: string) => dispatch({ type: "LOGIN_SET_INPUTS", inputs: { password } });
  const setEmail = (email: string) => dispatch({ type: "LOGIN_SET_INPUTS", inputs: { email } });
  const setInviteCode = (inviteCode: string) => dispatch({ type: "LOGIN_SET_INPUTS", inputs: { inviteCode } });
  const setEyeState = (eyeState: boolean) => dispatch({ type: "LOGIN_SET_INPUTS", inputs: { eyeState } });

  useEffect(() => {
    rpc.triggerClient("loginUiLoaded");

    return () => rpc.triggerClient("handleAuthOut");
  }, []);

  useEffect(() => {
    rpc.triggerServer("playerInQueue", true);

    return () => rpc.triggerServer("playerInQueue", false);
  }, []);

  function HelloWindow(props: { waiting: boolean }) {
    const next = () => dispatch({ type: "LOGIN_SET_DATA", data: { isHelloPassed: true } });

    useKey("enter", next);

    return (
      <div className={styles.auth}>
        <img className={styles.authLogo} src={logo} alt="logo" />
        <h2 className={styles.authTitle}>VIBE PROJECT</h2>
        <p className={styles.authText}>
          {props.waiting ? (
            <>
              Ваша заявка была отправлена на проверку администрации. Пожалуйста, дождитесь вашей очереди.
              <br />
              <br />
              Ваше место в очереди: {queueNumber === 0 ? "Загрузка..." : queueNumber}
            </>
          ) : (
            "Добро пожаловать на Vibe Project. Наш сервер имеет текстовый Role Play режим с закрытым типом регистрации. Для того чтобы зарегистрироваться на нашем сервере вам придется ответить на 3 письменных вопроса или получить код приглашения от уже зарегистрированного игрока. Мы рады новым игрокам, однако настоятельно рекомендуем ознакомиться с правилами сервера перед подачей заявки."
          )}
        </p>
        {!props.waiting ? (
          <button className={styles.authContinue} onClick={next}>
            ПРОДОЛЖИТЬ
          </button>
        ) : null}
      </div>
    );
  }

  function Auth() {
    const { login, eyeState, password } = useSelector((x) => x.loginInput);

    const next = async () => {
      let pass = password.trim();

      await server.login.tryLogin.async(login, pass);
    };

    useKey("enter", next);

    return (
      <div className={styles.auth}>
        <img className={styles.authLogo} src={logo} alt="logo" />
        <h2 className={styles.authTitle}>АВТОРИЗАЦИЯ</h2>
        <div className={styles.authInputs}>
          <input
            type="text"
            placeholder="Имя пользователя"
            className={clx({ [styles.authInputMT]: true, [styles.authInput]: true, [styles.authError]: errors?.index === "name" })}
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
          {errors?.index === "name" && <p className={styles.authUsernameError}>{errors.text}</p>}
          <div className={styles.authPasswordWrapper}>
            <input
              type={eyeState ? "text" : "password"}
              placeholder="Пароль"
              id="authPassword"
              className={clx(styles.authInput, { [styles.authError]: errors?.index === "password" })}
              value={password}
              onChange={(e) => setPass(e.target.value)}
            />
            {errors?.index === "password" && <p className={styles.authUsernameError}>{errors.text}</p>}
            <svg
              onClick={() => setEyeState(!eyeState)}
              className={clx(styles.eye, eyeState ? styles.active : null)}
              width="32"
              height="20"
              viewBox="0 0 32 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0)">
                <path
                  d="M16.01 17.9125C13.7431 17.9125 11.559 17.2893 9.69242 16.1087L0.0878296 10.0366L9.67545 3.95076C11.5451 2.76379 13.7351 2.13599 16.01 2.13599C18.2878 2.13599 20.4809 2.76562 22.3525 3.95625L31.9121 10.0375L22.3345 16.1051C20.4669 17.2874 18.2799 17.9125 16.01 17.9125ZM16.016 4.76251C12.8447 4.76251 10.2634 7.12821 10.2634 10.0366C10.2634 12.945 12.8437 15.3107 16.016 15.3107C19.1882 15.3107 21.7685 12.945 21.7685 10.0366C21.7685 7.12821 19.1872 4.76251 16.016 4.76251Z"
                  fill="#939393"
                />
                <path
                  d="M16.009 2.18081C18.2769 2.18081 20.4599 2.8077 22.3235 3.99284L31.8243 10.0366L22.3066 16.0666C20.4469 17.2444 18.2699 17.8667 16.01 17.8667C13.7531 17.8667 11.579 17.2462 9.72138 16.0712L0.175682 10.0366L9.70341 3.98826C11.565 2.80587 13.7451 2.18081 16.009 2.18081ZM16.016 15.3555C19.2152 15.3555 21.8175 12.9697 21.8175 10.0366C21.8175 7.10348 19.2152 4.71673 16.016 4.71673C12.8168 4.71673 10.2135 7.10257 10.2135 10.0366C10.2135 12.9706 12.8168 15.3555 16.016 15.3555ZM16.009 2.08929C13.785 2.08929 11.561 2.69696 9.64652 3.9123L0 10.0366L9.66448 16.1471C11.575 17.3542 13.793 17.9582 16.01 17.9582C18.231 17.9582 20.4519 17.3524 22.3635 16.1416L32 10.0366L22.3804 3.91779C20.4649 2.69879 18.2369 2.08929 16.009 2.08929ZM16.016 15.264C12.8667 15.264 10.3133 12.923 10.3133 10.0366C10.3133 7.14924 12.8667 4.80825 16.016 4.80825C19.1653 4.80825 21.7176 7.14924 21.7176 10.0366C21.7176 12.9239 19.1653 15.264 16.016 15.264Z"
                  fill="#939393"
                />
                <path
                  d="M16.016 13.5719C18.1456 13.5719 19.872 11.9891 19.872 10.0366C19.872 8.08414 18.1456 6.50134 16.016 6.50134C13.8864 6.50134 12.16 8.08414 12.16 10.0366C12.16 11.9891 13.8864 13.5719 16.016 13.5719Z"
                  fill="#939393"
                />
                <path
                  d="M16.016 6.54617C18.1152 6.54617 19.8221 8.11201 19.8221 10.0357C19.8221 11.9594 18.1142 13.5252 16.016 13.5252C13.9168 13.5252 12.2099 11.9594 12.2099 10.0357C12.2099 8.11201 13.9168 6.54617 16.016 6.54617ZM16.016 6.45465C13.8589 6.45465 12.11 8.05802 12.11 10.0357C12.11 12.0134 13.8589 13.6167 16.016 13.6167C18.1731 13.6167 19.9219 12.0134 19.9219 10.0357C19.9219 8.05802 18.1731 6.45465 16.016 6.45465Z"
                  fill="#939393"
                />
                <path
                  className={styles.eyeActive}
                  d="M24.3843 19.2099L5.97734 2.33392L7.65991 0.791304L26.0669 17.6673L24.3843 19.2099Z"
                  fill="#939393"
                  stroke="#2F3136"
                  strokeWidth="0.5"
                />
                <path
                  className={styles.eyeActive}
                  d="M7.82908 0.721738L7.66013 0.566844L7.49119 0.721738L5.93401 2.14939L5.73302 2.33367L5.93401 2.51794L24.2159 19.2792L24.3848 19.4341L24.5538 19.2792L26.111 17.8515L26.3119 17.6672L26.111 17.483L7.82908 0.721738ZM7.66013 0.339168L26.5603 17.6672L24.3848 19.6617L5.48469 2.33367L7.66013 0.339168Z"
                  stroke="#2F3136"
                  strokeWidth="0.5"
                />
              </g>
              <defs>
                <clipPath id="clip0">
                  <rect width="32" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <a className={styles.authLink} href="#">
            Забыли пароль?
          </a>
        </div>
        <button className={styles.authBtn} onClick={next}>
          АВТОРИЗОВАТЬСЯ
        </button>
      </div>
    );
  }

  function Register() {
    const { login, inviteCode, eyeState, email, password } = useSelector((x) => x.loginInput);

    const next = async () => {
      let pass = password.trim();

      if (!valid.isLength(login, { min: 3, max: 25 })) {
        dispatch({ type: "LOGIN_SET_ERRORS", errors: { index: "name", text: "Длина логина должна быть между 3 - 25" } });
        return setAlert("error", "Длина имени пользователя должна быть между 3 - 25");
      }

      if (!valid.isAlphanumeric(login)) {
        dispatch({ type: "LOGIN_SET_ERRORS", errors: { index: "name", text: "Логин может содержать только английские буквы и цифры" } });
        return setAlert("error", "Имя пользователя может содержать только английские буквы и цифры");
      }

      if (!valid.isAlphanumeric(pass, "en-US")) {
        dispatch({ type: "LOGIN_SET_ERRORS", errors: { index: "password", text: "Пароль может содержать только английские буквы и цифры" } });
        return setAlert("error", "Пароль может содержать только английские буквы и цифры");
      }

      if (!valid.isLength(pass, { min: 6, max: 40 })) {
        dispatch({ type: "LOGIN_SET_ERRORS", errors: { index: "password", text: "Длина пароля должна быть между 6 - 40" } });
        return setAlert("error", "Длина пароля должна быть между 6 - 40");
      }

      if (!valid.isEmail(email)) {
        dispatch({ type: "LOGIN_SET_ERRORS", errors: { index: "email", text: "Введите корректный E-mail" } });
        return setAlert("error", "Введите корректный E-mail");
      }

      await server.login.tryRegister.async(login, email, pass, inviteCode.length === 0 ? undefined : inviteCode);
    };

    useKey("enter", next);

    const [isHover, setHover] = useState(false);

    return (
      <div className={clx(styles.auth, styles.reg)}>
        <h2 className={clx(styles.authTitle, styles.regTitle)}>РЕГИСТРАЦИЯ</h2>
        <div className={styles.authInputs}>
          <input
            type="text"
            placeholder="Имя пользователя"
            className={clx(styles.authInput, styles.authRegInput, styles.marginNone, { [styles.authError]: errors?.index === "name" })}
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
          {errors?.index === "name" && <p className={styles.authRegisterError}>{errors.text}</p>}

          <div className={styles.authPasswordWrapper}>
            <input
              type={eyeState ? "text" : "password"}
              placeholder="Пароль"
              id="authPassword"
              className={clx(styles.authInput, styles.authRegInput, { [styles.authError]: errors?.index === "password" })}
              value={password}
              onChange={(e) => setPass(e.target.value)}
            />
            {errors?.index === "password" && <p className={styles.authRegisterError}>{errors.text}</p>}

            <svg
              onClick={() => setEyeState(!eyeState)}
              className={clx(styles.eye, eyeState ? styles.active : null)}
              viewBox="0 0 32 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0)">
                <path
                  d="M16.01 17.9125C13.7431 17.9125 11.559 17.2893 9.69242 16.1087L0.0878296 10.0366L9.67545 3.95076C11.5451 2.76379 13.7351 2.13599 16.01 2.13599C18.2878 2.13599 20.4809 2.76562 22.3525 3.95625L31.9121 10.0375L22.3345 16.1051C20.4669 17.2874 18.2799 17.9125 16.01 17.9125ZM16.016 4.76251C12.8447 4.76251 10.2634 7.12821 10.2634 10.0366C10.2634 12.945 12.8437 15.3107 16.016 15.3107C19.1882 15.3107 21.7685 12.945 21.7685 10.0366C21.7685 7.12821 19.1872 4.76251 16.016 4.76251Z"
                  fill="#939393"
                />
                <path
                  d="M16.009 2.18081C18.2769 2.18081 20.4599 2.8077 22.3235 3.99284L31.8243 10.0366L22.3066 16.0666C20.4469 17.2444 18.2699 17.8667 16.01 17.8667C13.7531 17.8667 11.579 17.2462 9.72138 16.0712L0.175682 10.0366L9.70341 3.98826C11.565 2.80587 13.7451 2.18081 16.009 2.18081ZM16.016 15.3555C19.2152 15.3555 21.8175 12.9697 21.8175 10.0366C21.8175 7.10348 19.2152 4.71673 16.016 4.71673C12.8168 4.71673 10.2135 7.10257 10.2135 10.0366C10.2135 12.9706 12.8168 15.3555 16.016 15.3555ZM16.009 2.08929C13.785 2.08929 11.561 2.69696 9.64652 3.9123L0 10.0366L9.66448 16.1471C11.575 17.3542 13.793 17.9582 16.01 17.9582C18.231 17.9582 20.4519 17.3524 22.3635 16.1416L32 10.0366L22.3804 3.91779C20.4649 2.69879 18.2369 2.08929 16.009 2.08929ZM16.016 15.264C12.8667 15.264 10.3133 12.923 10.3133 10.0366C10.3133 7.14924 12.8667 4.80825 16.016 4.80825C19.1653 4.80825 21.7176 7.14924 21.7176 10.0366C21.7176 12.9239 19.1653 15.264 16.016 15.264Z"
                  fill="#939393"
                />
                <path
                  d="M16.016 13.5719C18.1456 13.5719 19.872 11.9891 19.872 10.0366C19.872 8.08414 18.1456 6.50134 16.016 6.50134C13.8864 6.50134 12.16 8.08414 12.16 10.0366C12.16 11.9891 13.8864 13.5719 16.016 13.5719Z"
                  fill="#939393"
                />
                <path
                  d="M16.016 6.54617C18.1152 6.54617 19.8221 8.11201 19.8221 10.0357C19.8221 11.9594 18.1142 13.5252 16.016 13.5252C13.9168 13.5252 12.2099 11.9594 12.2099 10.0357C12.2099 8.11201 13.9168 6.54617 16.016 6.54617ZM16.016 6.45465C13.8589 6.45465 12.11 8.05802 12.11 10.0357C12.11 12.0134 13.8589 13.6167 16.016 13.6167C18.1731 13.6167 19.9219 12.0134 19.9219 10.0357C19.9219 8.05802 18.1731 6.45465 16.016 6.45465Z"
                  fill="#939393"
                />
                <path
                  className={styles.eyeActive}
                  d="M24.3843 19.2099L5.97734 2.33392L7.65991 0.791304L26.0669 17.6673L24.3843 19.2099Z"
                  fill="#939393"
                  stroke="#2F3136"
                  strokeWidth="0.5"
                />
                <path
                  className={styles.eyeActive}
                  d="M7.82908 0.721738L7.66013 0.566844L7.49119 0.721738L5.93401 2.14939L5.73302 2.33367L5.93401 2.51794L24.2159 19.2792L24.3848 19.4341L24.5538 19.2792L26.111 17.8515L26.3119 17.6672L26.111 17.483L7.82908 0.721738ZM7.66013 0.339168L26.5603 17.6672L24.3848 19.6617L5.48469 2.33367L7.66013 0.339168Z"
                  stroke="#2F3136"
                  strokeWidth="0.5"
                />
              </g>
              <defs>
                <clipPath id="clip0">
                  <rect width="32" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <input
            type="email"
            placeholder="E-mail"
            className={clx(styles.authInput, styles.authRegInput, { [styles.authError]: errors?.index === "email" })}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors?.index === "email" && <p className={styles.authRegisterError}>{errors.text}</p>}

          <div className={styles.authPromoWrapper}>
            <div className={styles.authPromoText} style={{ opacity: isHover ? 1 : 0 }}>
              Мы поддерживаем опытных игроков и прекрасно понимаем их негодование когда их заставляют проходить UCP каждый раз при регистрации на новом сервере. Мы готовы пускать
              таких игроков в обход заявки на регистрацию с тем условием, что игрок, который вас пригласил берет на себя ответственность за ваше пребывание на сервере
            </div>

            <input
              type="text"
              placeholder="Код приглашения"
              className={clx(styles.authInput, styles.authRegInput, { [styles.authError]: errors?.index === "invite" })}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            {errors?.index === "invite" && <p className={styles.authUsernameError}>{errors.text}</p>}
            <div className={styles.authPromoIcon} onMouseOver={setHover.bind(null, true)} onMouseLeave={setHover.bind(null, false)}>
              ?
            </div>
          </div>
        </div>
        <button className={clx(styles.authBtn, styles.authBtnMT)} onClick={next}>
          зарегистрироваться
        </button>
      </div>
    );
  }

  function Ucp() {
    const next = () => {
      for (const a of ucpAnswers) {
        if (!valid.isLength(a.answer, { min: 100, max: 10000 }) && a.status !== "accepted") {
          dispatch({ type: "LOGIN_SET_ERRORS", errors: { index: ucpAnswers.indexOf(a), text: "Длина ответа должна быть 100 - 10000 символов" } });
          return setAlert("error", "Длина ответов должна быть 100 - 10000 символов");
        }

        if (a.status === "decilined") {
          a.status = "waiting";
        }
      }

      server.login.sendUcpAnswers(ucpAnswers);
    };

    return (
      <div className={clx(styles.auth, styles.authUcp)}>
        {ucpAnswers
          .filter((answer) => answer.status !== "accepted")
          .map((answer, index) => (
            <div key={index} className={clx({ [styles.authQuestion]: true, [styles.authQuestionError]: errors?.index === index })}>
              <p className={clx(styles.questionText)}>{answer.text}</p>
              {answer.status === "decilined" ? <p className={styles.decilineQuestionText}>Причина отклонения вопроса: {answer.adminAnswer}</p> : null}
              <textarea
                value={answer.answer}
                onChange={(e) => {
                  answer.answer = e.target.value;
                  dispatch({ type: "LOGIN_SET_DATA", data: { ucpAnswers: [...ucpAnswers] } });
                }}
                name="questionAnswer"
                className={clx(styles.questionAnswer)}
                rows={10}
              ></textarea>
              {errors?.index === index && <p className={styles.questionError}>{errors.text}</p>}
            </div>
          ))}
        <button className={clx(styles.authBtn)} onClick={next}>
          ОТПРАВИТЬ
        </button>
      </div>
    );
  }

  if (isRegistered && !isUcp) {
    return <Auth />;
  } else {
    if (isHelloPassed) {
      if (isUcp) {
        if (isWaiting) {
          return <HelloWindow waiting={true} />;
        } else {
          return Ucp();
        }
      } else {
        return <Register />;
      }
    } else {
      return <HelloWindow waiting={false} />;
    }
  }
}

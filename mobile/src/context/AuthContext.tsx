import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
    cadastrarUsuario,
    fazerLogin,
    LoginResponse,
} from "../service/api";


const CHAVE_SESSAO =
    "@hospeasy:sessao";


type AuthContextType = {

    usuario:
        LoginResponse | null;

    carregandoSessao:
        boolean;

    autenticado:
        boolean;

    login: (
        email: string,
        senha: string
    ) => Promise<void>;

    cadastro: (
        nome: string,
        email: string,
        senha: string
    ) => Promise<void>;

    logout:
        () => Promise<void>;
};


const AuthContext =
    createContext<
        AuthContextType | undefined
    >(undefined);


type Props = {
    children: ReactNode;
};


export function AuthProvider({
                                 children,
                             }: Props) {

    const [
        usuario,
        setUsuario,
    ] =
        useState<LoginResponse | null>(
            null
        );


    const [
        carregandoSessao,
        setCarregandoSessao,
    ] =
        useState(true);


    useEffect(() => {

        carregarSessao();

    }, []);


    async function carregarSessao() {

        try {

            const sessaoSalva =
                await AsyncStorage.getItem(
                    CHAVE_SESSAO
                );


            if (!sessaoSalva) {
                return;
            }


            const dados:
                LoginResponse =
                JSON.parse(
                    sessaoSalva
                );


            setUsuario(
                dados
            );

        } catch (erro) {

            console.error(
                "Erro ao carregar sessão:",
                erro
            );


            await AsyncStorage.removeItem(
                CHAVE_SESSAO
            );

        } finally {

            setCarregandoSessao(
                false
            );
        }
    }


    async function salvarSessao(
        dados: LoginResponse
    ) {

        setUsuario(
            dados
        );


        await AsyncStorage.setItem(
            CHAVE_SESSAO,
            JSON.stringify(
                dados
            )
        );
    }


    async function login(
        email: string,
        senha: string
    ) {

        const resposta =
            await fazerLogin(
                email.trim(),
                senha
            );


        await salvarSessao(
            resposta
        );
    }


    async function cadastro(
        nome: string,
        email: string,
        senha: string
    ) {

        const nomeLimpo =
            nome.trim();

        const emailLimpo =
            email
                .trim()
                .toLowerCase();


        /*
         * Primeiro cria o usuário.
         */
        await cadastrarUsuario({
            nome:
            nomeLimpo,

            email:
            emailLimpo,

            senha,
        });


        /*
         * Se o cadastro funcionou,
         * faz login automaticamente.
         */
        const respostaLogin =
            await fazerLogin(
                emailLimpo,
                senha
            );


        await salvarSessao(
            respostaLogin
        );
    }


    async function logout() {

        setUsuario(
            null
        );


        await AsyncStorage.removeItem(
            CHAVE_SESSAO
        );
    }


    return (

        <AuthContext.Provider
            value={{
                usuario,

                carregandoSessao,

                autenticado:
                    usuario !== null,

                login,

                cadastro,

                logout,
            }}
        >

            {children}

        </AuthContext.Provider>
    );
}


export function useAuth() {

    const contexto =
        useContext(
            AuthContext
        );


    if (!contexto) {

        throw new Error(
            "useAuth precisa estar dentro de AuthProvider"
        );
    }


    return contexto;
}
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
    fazerLogin,
    LoginResponse,
} from "../service/api";


const CHAVE_SESSAO =
    "@hospeasy:sessao";


type AuthContextType = {
    usuario: LoginResponse | null;

    carregandoSessao: boolean;

    autenticado: boolean;

    login: (
        email: string,
        senha: string
    ) => Promise<void>;

    logout: () => Promise<void>;
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


    async function login(
        email: string,
        senha: string
    ) {

        const resposta =
            await fazerLogin(
                email,
                senha
            );


        setUsuario(
            resposta
        );


        await AsyncStorage.setItem(
            CHAVE_SESSAO,
            JSON.stringify(
                resposta
            )
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
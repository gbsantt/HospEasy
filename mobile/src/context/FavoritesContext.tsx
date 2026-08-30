import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    Unidade,
} from "../types/Unidade";

import {
    adicionarFavorito,
    buscarFavoritos,
    removerFavorito,
} from "../service/api";

import {
    useAuth,
} from "./AuthContext";


type FavoritesContextType = {

    favoritos:
        Unidade[];

    carregandoFavoritos:
        boolean;

    favoritar: (
        unidade: Unidade
    ) => Promise<void>;

    desfavoritar: (
        unidadeId: number
    ) => Promise<void>;

    alternarFavorito: (
        unidade: Unidade
    ) => Promise<void>;

    estaFavoritado: (
        unidadeId: number
    ) => boolean;

    recarregarFavoritos:
        () => Promise<void>;
};


const FavoritesContext =
    createContext<
        FavoritesContextType | undefined
    >(undefined);


type Props = {
    children: ReactNode;
};


export function FavoritesProvider({
                                      children,
                                  }: Props) {

    const {
        usuario,
        autenticado,
    } = useAuth();


    const [
        favoritos,
        setFavoritos,
    ] =
        useState<Unidade[]>(
            []
        );


    const [
        carregandoFavoritos,
        setCarregandoFavoritos,
    ] =
        useState(false);


    useEffect(() => {

        if (
            autenticado &&
            usuario
        ) {

            recarregarFavoritos();

        } else {

            setFavoritos(
                []
            );
        }

    }, [
        autenticado,
        usuario?.id,
    ]);


    async function recarregarFavoritos() {

        if (!usuario) {

            setFavoritos(
                []
            );

            return;
        }


        try {

            setCarregandoFavoritos(
                true
            );


            const resposta =
                await buscarFavoritos(
                    usuario.token
                );


            setFavoritos(
                resposta
            );

        } catch (erro) {

            console.error(
                "Erro ao carregar favoritos:",
                erro
            );

        } finally {

            setCarregandoFavoritos(
                false
            );
        }
    }


    async function favoritar(
        unidade: Unidade
    ) {

        if (!usuario) {

            return;
        }


        const jaExiste =
            favoritos.some(
                (item) =>
                    item.unidadeId ===
                    unidade.unidadeId
            );


        if (jaExiste) {

            return;
        }


        /*
         * Atualização otimista:
         * coração muda na hora.
         */
        setFavoritos(
            (favoritosAtuais) => [
                ...favoritosAtuais,
                unidade,
            ]
        );


        try {

            await adicionarFavorito(
                unidade.unidadeId,
                usuario.token
            );

        } catch (erro) {

            console.error(
                "Erro ao favoritar:",
                erro
            );


            /*
             * Se o backend falhar,
             * desfaz a alteração visual.
             */
            setFavoritos(
                (
                    favoritosAtuais
                ) =>
                    favoritosAtuais.filter(
                        (item) =>
                            item.unidadeId !==
                            unidade.unidadeId
                    )
            );
        }
    }


    async function desfavoritar(
        unidadeId: number
    ) {

        if (!usuario) {

            return;
        }


        const favoritoAnterior =
            favoritos.find(
                (item) =>
                    item.unidadeId ===
                    unidadeId
            );


        setFavoritos(
            (
                favoritosAtuais
            ) =>
                favoritosAtuais.filter(
                    (unidade) =>
                        unidade.unidadeId !==
                        unidadeId
                )
        );


        try {

            await removerFavorito(
                unidadeId,
                usuario.token
            );

        } catch (erro) {

            console.error(
                "Erro ao desfavoritar:",
                erro
            );


            if (
                favoritoAnterior
            ) {

                setFavoritos(
                    (
                        favoritosAtuais
                    ) => {

                        const existe =
                            favoritosAtuais.some(
                                (item) =>
                                    item.unidadeId ===
                                    favoritoAnterior.unidadeId
                            );


                        if (existe) {

                            return favoritosAtuais;
                        }


                        return [
                            ...favoritosAtuais,
                            favoritoAnterior,
                        ];
                    }
                );
            }
        }
    }


    function estaFavoritado(
        unidadeId: number
    ) {

        return favoritos.some(
            (unidade) =>
                unidade.unidadeId ===
                unidadeId
        );
    }


    async function alternarFavorito(
        unidade: Unidade
    ) {

        if (
            estaFavoritado(
                unidade.unidadeId
            )
        ) {

            await desfavoritar(
                unidade.unidadeId
            );

            return;
        }


        await favoritar(
            unidade
        );
    }


    return (

        <FavoritesContext.Provider
            value={{
                favoritos,

                carregandoFavoritos,

                favoritar,

                desfavoritar,

                alternarFavorito,

                estaFavoritado,

                recarregarFavoritos,
            }}
        >

            {children}

        </FavoritesContext.Provider>
    );
}


export function useFavorites() {

    const contexto =
        useContext(
            FavoritesContext
        );


    if (!contexto) {

        throw new Error(
            "useFavorites precisa estar dentro de FavoritesProvider"
        );
    }


    return contexto;
}
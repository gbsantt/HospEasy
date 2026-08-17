import {
    createContext,
    ReactNode,
    useContext,
    useState,
} from "react";

import {
    Unidade,
} from "../types/Unidade";


type FavoritesContextType = {
    favoritos: Unidade[];

    favoritar: (
        unidade: Unidade
    ) => void;

    desfavoritar: (
        unidadeId: number
    ) => void;

    alternarFavorito: (
        unidade: Unidade
    ) => void;

    estaFavoritado: (
        unidadeId: number
    ) => boolean;
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

    const [
        favoritos,
        setFavoritos,
    ] = useState<Unidade[]>([]);


    function favoritar(
        unidade: Unidade
    ) {

        setFavoritos(
            (favoritosAtuais) => {

                const jaExiste =
                    favoritosAtuais.some(
                        (item) =>
                            item.unidadeId ===
                            unidade.unidadeId
                    );


                if (jaExiste) {
                    return favoritosAtuais;
                }


                return [
                    ...favoritosAtuais,
                    unidade,
                ];
            }
        );
    }


    function desfavoritar(
        unidadeId: number
    ) {

        setFavoritos(
            (favoritosAtuais) =>
                favoritosAtuais.filter(
                    (unidade) =>
                        unidade.unidadeId !==
                        unidadeId
                )
        );
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


    function alternarFavorito(
        unidade: Unidade
    ) {

        if (
            estaFavoritado(
                unidade.unidadeId
            )
        ) {

            desfavoritar(
                unidade.unidadeId
            );

            return;
        }


        favoritar(
            unidade
        );
    }


    return (
        <FavoritesContext.Provider
            value={{
                favoritos,
                favoritar,
                desfavoritar,
                alternarFavorito,
                estaFavoritado,
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
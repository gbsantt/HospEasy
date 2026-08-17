import {
    useEffect,
    useState,
} from "react";

import * as Location from "expo-location";

import {
    Coordenada,
} from "../utils/location";


export function useUserLocation() {
    const [
        localizacao,
        setLocalizacao,
    ] =
        useState<Coordenada | null>(
            null
        );

    const [
        carregando,
        setCarregando,
    ] =
        useState(true);

    const [
        erro,
        setErro,
    ] =
        useState<string | null>(
            null
        );


    useEffect(() => {
        carregarLocalizacao();
    }, []);


    async function carregarLocalizacao() {
        try {
            setCarregando(
                true
            );

            setErro(
                null
            );


            const permissao =
                await Location
                    .requestForegroundPermissionsAsync();


            if (
                permissao.status !==
                "granted"
            ) {
                setErro(
                    "Permissão de localização negada."
                );

                return;
            }


            const posicao =
                await Location
                    .getCurrentPositionAsync({
                        accuracy:
                        Location.Accuracy.Balanced,
                    });


            setLocalizacao({
                latitude:
                posicao.coords.latitude,

                longitude:
                posicao.coords.longitude,
            });

        } catch (erro) {

            console.error(
                "Erro ao obter localização:",
                erro
            );

            setErro(
                "Não foi possível obter sua localização."
            );

        } finally {

            setCarregando(
                false
            );

        }
    }


    return {
        localizacao,
        carregando,
        erro,
        recarregar:
        carregarLocalizacao,
    };
}
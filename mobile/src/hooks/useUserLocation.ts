import {
    useCallback,
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


    const carregarLocalizacao =
        useCallback(
            async () => {

                try {

                    setCarregando(
                        true
                    );

                    setErro(
                        null
                    );


                    const servicosAtivos =
                        await Location
                            .hasServicesEnabledAsync();


                    if (
                        !servicosAtivos
                    ) {

                        setErro(
                            "Ative a localização do dispositivo."
                        );

                        return;
                    }


                    const permissaoAtual =
                        await Location
                            .getForegroundPermissionsAsync();


                    let status =
                        permissaoAtual.status;


                    if (
                        status !==
                        Location.PermissionStatus.GRANTED
                    ) {

                        const novaPermissao =
                            await Location
                                .requestForegroundPermissionsAsync();


                        status =
                            novaPermissao.status;
                    }


                    if (
                        status !==
                        Location.PermissionStatus.GRANTED
                    ) {

                        setErro(
                            "Permissão de localização negada."
                        );

                        return;
                    }


                    let posicao =
                        await Location
                            .getLastKnownPositionAsync();


                    if (
                        !posicao
                    ) {

                        posicao =
                            await Location
                                .getCurrentPositionAsync({
                                    accuracy:
                                    Location.Accuracy.Balanced,
                                });
                    }


                    setLocalizacao({
                        latitude:
                        posicao.coords.latitude,

                        longitude:
                        posicao.coords.longitude,
                    });


                    setErro(
                        null
                    );

                } catch (error) {

                    console.warn(
                        "Localização indisponível no momento."
                    );


                    setErro(
                        "Não foi possível obter sua localização."
                    );

                } finally {

                    setCarregando(
                        false
                    );

                }

            },
            []
        );


    useEffect(() => {

        carregarLocalizacao();

    }, [
        carregarLocalizacao,
    ]);


    return {

        localizacao,

        carregando,

        erro,

        recarregar:
        carregarLocalizacao,

    };
}
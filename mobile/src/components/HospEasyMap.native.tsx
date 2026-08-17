import {
    StyleSheet,
    View,
} from "react-native";

import MapView, {
    Marker,
} from "react-native-maps";

import { Unidade } from "../types/Unidade";
import { colors } from "../theme/colors";


type Props = {
    unidades: Unidade[];

    onSelecionarUnidade: (
        unidade: Unidade
    ) => void;
};


export default function HospEasyMap({
                                        unidades,
                                        onSelecionarUnidade,
                                    }: Props) {

    function corMarcador(
        unidade: Unidade
    ) {
        if (
            unidade.statusCamera === "OFFLINE" ||
            unidade.statusCamera === "DESATIVADA" ||
            unidade.statusMedicao !== "ATUALIZADA"
        ) {
            return colors.offline;
        }

        if (
            unidade.percentualOcupacao >= 80
        ) {
            return colors.danger;
        }

        if (
            unidade.percentualOcupacao >= 50
        ) {
            return colors.warning;
        }

        return colors.primary;
    }


    const unidadesComLocalizacao =
        unidades.filter(
            (unidade) =>
                unidade.latitude !== null &&
                unidade.longitude !== null
        );


    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude:
                        -23.5505,

                    longitude:
                        -46.6333,

                    latitudeDelta:
                        0.15,

                    longitudeDelta:
                        0.15,
                }}
            >
                {unidadesComLocalizacao.map(
                    (unidade) => (
                        <Marker
                            key={
                                unidade.unidadeId
                            }

                            coordinate={{
                                latitude:
                                    unidade.latitude!,

                                longitude:
                                    unidade.longitude!,
                            }}

                            title={
                                unidade.nome
                            }

                            description={
                                `Ocupação: ${unidade.percentualOcupacao.toFixed(
                                    1
                                )}%`
                            }

                            pinColor={
                                corMarcador(
                                    unidade
                                )
                            }

                            onPress={() =>
                                onSelecionarUnidade(
                                    unidade
                                )
                            }
                        />
                    )
                )}
            </MapView>
        </View>
    );
}


const styles =
    StyleSheet.create({
        container: {
            flex: 1,
        },

        map: {
            width: "100%",
            height: "100%",
        },
    });
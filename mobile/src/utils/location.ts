export type Coordenada = {
    latitude: number;
    longitude: number;
};


export function calcularDistanciaKm(
    origem: Coordenada,
    destino: Coordenada
) {
    const raioTerraKm = 6371;

    const latitude1 =
        grausParaRadianos(
            origem.latitude
        );

    const latitude2 =
        grausParaRadianos(
            destino.latitude
        );

    const diferencaLatitude =
        grausParaRadianos(
            destino.latitude -
            origem.latitude
        );

    const diferencaLongitude =
        grausParaRadianos(
            destino.longitude -
            origem.longitude
        );


    const a =
        Math.sin(
            diferencaLatitude / 2
        ) *
        Math.sin(
            diferencaLatitude / 2
        ) +
        Math.cos(
            latitude1
        ) *
        Math.cos(
            latitude2
        ) *
        Math.sin(
            diferencaLongitude / 2
        ) *
        Math.sin(
            diferencaLongitude / 2
        );


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return raioTerraKm * c;
}


function grausParaRadianos(
    graus: number
) {
    return (
        graus *
        (Math.PI / 180)
    );
}
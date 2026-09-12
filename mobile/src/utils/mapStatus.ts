import { colors } from "../theme/colors";
import { Unidade } from "../types/Unidade";

export function statusNoMapa(unidade: Unidade) {
    if (!dadosAtuais(unidade)) {
        return { color: colors.offline, text: "Sem dados atuais" };
    }
    const percentual = unidade.percentualOcupacao;
    return {
        color: percentual >= 80 ? colors.danger : percentual >= 50 ? colors.warning : colors.primary,
        text: `${percentual.toFixed(0)}% de ocupação`,
    };
}

export function dadosAtuais(unidade: Unidade) {
    return unidade.statusCamera === "ONLINE" && unidade.statusMedicao === "ATUALIZADA";
}

export function temCoordenadas(unidade: Unidade): unidade is Unidade & { latitude: number; longitude: number } {
    return typeof unidade.latitude === "number" && Number.isFinite(unidade.latitude)
        && Math.abs(unidade.latitude) <= 90
        && typeof unidade.longitude === "number" && Number.isFinite(unidade.longitude)
        && Math.abs(unidade.longitude) <= 180;
}

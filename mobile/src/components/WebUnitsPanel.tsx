import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme/colors";
import { Unidade } from "../types/Unidade";
import { statusNoMapa, temCoordenadas } from "../utils/mapStatus";
import { useFavorites } from "../context/FavoritesContext";
import { calcularDistanciaKm, Coordenada } from "../utils/location";

type Props = {
    unidades: Unidade[];
    localizacao: Coordenada | null;
    erroLocalizacao: string | null;
    onAbrirUnidade: (unidade: Unidade) => void;
};

export default function WebUnitsPanel({ unidades, localizacao, erroLocalizacao, onAbrirUnidade }: Props) {
    const [busca, setBusca] = useState("");
    const [somenteFavoritos, setSomenteFavoritos] = useState(false);
    const { favoritos } = useFavorites();
    const filtradas = useMemo(() => {
        const texto = busca.trim().toLocaleLowerCase("pt-BR");
        return unidades.filter((u) => `${u.nome} ${u.endereco}`.toLocaleLowerCase("pt-BR").includes(texto)
            && (!somenteFavoritos || favoritos.some((favorito) => favorito.unidadeId === u.unidadeId)));
    }, [unidades, busca, somenteFavoritos, favoritos]);

    return <View style={styles.panel}>
        <Text accessibilityRole="header" style={styles.title}>Encontre uma unidade</Text>
        <TextInput accessibilityLabel="Buscar por nome ou endereço" placeholder="Nome da unidade ou endereço" placeholderTextColor={colors.textSecondary}
            value={busca} onChangeText={setBusca} style={styles.search} />
        <View style={styles.filters}>
            <Pressable accessibilityRole="button" accessibilityState={{ selected: !somenteFavoritos }} onPress={() => setSomenteFavoritos(false)} style={[styles.filter, !somenteFavoritos && styles.active]}>
                <Text style={styles.filterText}>Todas</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityState={{ selected: somenteFavoritos }} onPress={() => setSomenteFavoritos(true)} style={[styles.filter, somenteFavoritos && styles.active]}>
                <Text style={styles.filterText}>Favoritas</Text>
            </Pressable>
            <Text style={styles.count}>{filtradas.length} unidades</Text>
        </View>
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {erroLocalizacao && <Text style={styles.note}>{erroLocalizacao}</Text>}
            {!filtradas.length && <Text style={styles.note}>{somenteFavoritos ? "Nenhuma unidade favorita encontrada." : "Nenhuma unidade encontrada."}</Text>}
            {filtradas.map((unidade) => {
                const status = statusNoMapa(unidade);
                const distancia = localizacao && temCoordenadas(unidade) ? calcularDistanciaKm(localizacao, unidade) : null;
                return <Pressable key={unidade.unidadeId} accessibilityRole="button" accessibilityLabel={`Ver detalhes de ${unidade.nome}, ${status.text}`}
                    style={styles.unit} onPress={() => onAbrirUnidade(unidade)}>
                    <Text style={styles.name}>{unidade.nome}</Text>
                    <Text style={styles.address}>{unidade.endereco}</Text>
                    <View style={styles.status}>
                        <View style={[styles.dot, { backgroundColor: status.color }]} />
                        <Text style={styles.statusText}>{status.text}</Text>
                    </View>
                    {distancia !== null && <Text style={styles.address}>{distancia.toFixed(1)} km em linha reta</Text>}
                    {!temCoordenadas(unidade) && <Text style={styles.address}>Localização não informada</Text>}
                    <Text style={styles.details}>Ver detalhes →</Text>
                </Pressable>;
            })}
        </ScrollView>
    </View>;
}

const styles = StyleSheet.create({
    panel: { flex: 1, backgroundColor: colors.surface, padding: 20, minHeight: 0 },
    title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 14 },
    search: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, fontSize: 16, color: colors.text, backgroundColor: colors.background },
    filters: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 12, flexWrap: "wrap" },
    filter: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
    active: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
    filterText: { fontSize: 14, fontWeight: "600", color: colors.primaryDark },
    count: { fontSize: 12, color: colors.textSecondary, marginLeft: "auto" },
    list: { flex: 1 },
    listContent: { gap: 12, paddingBottom: 8 },
    unit: { padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 16, gap: 8 },
    name: { fontSize: 16, fontWeight: "700", color: colors.text },
    address: { fontSize: 14, lineHeight: 20, color: colors.textSecondary },
    status: { flexDirection: "row", alignItems: "center", gap: 8 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    statusText: { fontSize: 14, color: colors.text, fontWeight: "600" },
    details: { fontSize: 14, fontWeight: "700", color: colors.primaryDark },
    note: { fontSize: 14, lineHeight: 20, color: colors.textSecondary, paddingVertical: 8 },
});

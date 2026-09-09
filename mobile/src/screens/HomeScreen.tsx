import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DynamicIsland from "../components/DynamicIsland";
import HospEasyMap from "../components/HospEasyMap";
import UnitMapCard from "../components/UnitMapCard";
import MapBrand from "../components/MapBrand";
import WebUnitsPanel from "../components/WebUnitsPanel";
import { buscarSituacoesUnidades } from "../service/api";
import { Unidade } from "../types/Unidade";
import { RootStackParamList } from "../navigation/AppNavigator";
import { colors } from "../theme/colors";
import { useUserLocation } from "../hooks/useUserLocation";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [selecionadaId, setSelecionadaId] = useState<number | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [tentativa, setTentativa] = useState(0);
    const { localizacao, erro: erroLocalizacao } = useUserLocation();
    const { autenticado, usuario } = useAuth();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const web = Platform.OS === "web";
    const desktop = web && width >= 900;
    const selecionada = unidades.find((u) => u.unidadeId === selecionadaId);

    useEffect(() => {
        let ativo = true;
        let timer: ReturnType<typeof setTimeout>;
        const controller = new AbortController();
        async function carregar() {
            try {
                const dados = await buscarSituacoesUnidades(controller.signal);
                if (!ativo) return;
                setUnidades(dados);
                setErro(null);
            } catch {
                if (ativo) {
                    setErro("Não foi possível atualizar as unidades. Os dados podem estar desatualizados.");
                    setUnidades((atuais) => atuais.map((u) => ({ ...u, statusMedicao: "DESATUALIZADA" })));
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                    timer = setTimeout(carregar, 5000);
                }
            }
        }
        carregar();
        return () => { ativo = false; clearTimeout(timer); controller.abort(); };
    }, [tentativa]);

    function abrirUnidade(unidade: Unidade) {
        setSelecionadaId(null);
        navigation.navigate("Unit", { unidade });
    }

    return <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
            <MapBrand />
            {desktop && <Text style={styles.headerLabel}>Mapa de unidades de saúde</Text>}
            <Pressable accessibilityRole="button" accessibilityLabel={autenticado ? "Abrir meu perfil" : "Entrar"} onPress={() => navigation.navigate(autenticado ? "Profile" : "Access")} style={[styles.account, autenticado && styles.avatar]}>
                <Text style={[styles.accountText, autenticado && styles.avatarText]}>{autenticado ? usuario?.nome.trim().charAt(0).toUpperCase() : "Entrar"}</Text>
            </Pressable>
        </View>
        <View style={styles.legend}>
            <Text style={styles.legendTitle}>Ocupação</Text>
            {[[colors.primary, "Baixa"], [colors.warning, "Moderada"], [colors.danger, "Alta"], [colors.offline, "Sem dados atuais"]].map(([color, label]) =>
                <View key={label} style={styles.legendItem}><View style={[styles.dot, { backgroundColor: color }]} /><Text style={styles.legendText}>{label}</Text></View>)}
        </View>
        {(carregando || erro) && <View accessibilityRole="alert" style={styles.notice}>
            {carregando && <ActivityIndicator color={colors.primary} />}
            <Text style={styles.noticeText}>{carregando ? "Buscando unidades…" : erro}</Text>
            {erro && <Pressable accessibilityRole="button" onPress={() => setTentativa((value) => value + 1)}><Text style={styles.retry}>Tentar novamente</Text></Pressable>}
        </View>}
        <View style={[styles.content, desktop && styles.row]}>
            {web && <View style={desktop ? styles.sidebar : styles.mobilePanel}>
                <WebUnitsPanel unidades={unidades} localizacao={localizacao} erroLocalizacao={erroLocalizacao} onAbrirUnidade={abrirUnidade} />
            </View>}
            <View style={styles.mapArea}>
                <HospEasyMap unidades={unidades} localizacaoUsuario={localizacao} onSelecionarUnidade={(u) => setSelecionadaId(u.unidadeId)} />
                {selecionada && <UnitMapCard nome={selecionada.nome} percentual={selecionada.percentualOcupacao} tendencia={selecionada.tendencia}
                    nivelOcupacao={selecionada.nivelOcupacao} statusCamera={selecionada.statusCamera} statusMedicao={erro ? "DESATUALIZADA" : selecionada.statusMedicao}
                    onPress={() => abrirUnidade(selecionada)} onClose={() => setSelecionadaId(null)} />}
                {!web && <DynamicIsland unidades={unidades} localizacaoUsuario={localizacao} erroLocalizacao={erroLocalizacao} onAbrirUnidade={abrirUnidade} />}
            </View>
        </View>
    </View>;
}

const styles = StyleSheet.create({
    avatar: { width: 44, height: 44, borderRadius: 22, paddingHorizontal: 0, paddingVertical: 0, alignItems: "center", justifyContent: "center" },
    avatarText: { fontSize: 20, fontWeight: "800" },
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", gap: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerLabel: { fontSize: 16, color: colors.textSecondary, marginLeft: 20 },
    account: { marginLeft: "auto", paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.primaryLight, borderRadius: 12 },
    accountText: { color: colors.primaryDark, fontSize: 14, fontWeight: "700" },
    legend: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    legendTitle: { fontSize: 12, fontWeight: "700", color: colors.text },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
    legendText: { fontSize: 12, color: colors.textSecondary },
    dot: { width: 9, height: 9, borderRadius: 5 },
    notice: { padding: 12, flexDirection: "row", gap: 10, alignItems: "center", flexWrap: "wrap", backgroundColor: colors.primaryLight },
    noticeText: { color: colors.text, fontSize: 14, flexShrink: 1 },
    retry: { color: colors.primaryDark, fontWeight: "700", fontSize: 14, textDecorationLine: "underline" },
    content: { flex: 1, minHeight: 0, flexDirection: "column-reverse" },
    row: { flexDirection: "row" },
    sidebar: { width: 360, borderRightWidth: 1, borderColor: colors.border },
    mobilePanel: { height: "42%", minHeight: 210, borderTopWidth: 1, borderColor: colors.border },
    mapArea: { flex: 1, minHeight: 180, overflow: "hidden" },
});

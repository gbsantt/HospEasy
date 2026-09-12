import { useMemo,useState } from "react";
import { Pressable,ScrollView,StyleSheet,Text,TextInput,View,useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Gesture,GestureDetector } from "react-native-gesture-handler";
import Animated,{runOnJS,useAnimatedStyle,useSharedValue,withSpring} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Unidade } from "../types/Unidade";
import { Coordenada,calcularDistanciaKm } from "../utils/location";
import { temCoordenadas,statusNoMapa,dadosAtuais } from "../utils/mapStatus";
import { colors } from "../theme/colors";
type Props={unidades:Unidade[];localizacaoUsuario:Coordenada|null;erroLocalizacao?:string|null;onAbrirUnidade:(u:Unidade)=>void};
export default function DynamicIsland({unidades,localizacaoUsuario,erroLocalizacao,onAbrirUnidade}:Props){
    const {height}=useWindowDimensions();const insets=useSafeAreaInsets();const maxHeight=Math.max(90,Math.min(610,height-insets.top-insets.bottom-180));
    const [open,setOpen]=useState(false),[search,setSearch]=useState("");
    const animatedHeight=useSharedValue(82);const style=useAnimatedStyle(()=>({height:Math.min(animatedHeight.value,maxHeight)}));
    const {usuario,autenticado}=useAuth();const {favoritos}=useFavorites();
    const nav=useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    function toggle(next:boolean){setOpen(next);animatedHeight.value=withSpring(next?maxHeight:82,{damping:25,stiffness:180,overshootClamping:true});}
    const drag=Gesture.Pan().onEnd(e=>{runOnJS(toggle)(e.translationY<0);});
    const distances=useMemo(()=>localizacaoUsuario?unidades.filter(temCoordenadas).map(u=>({u,km:calcularDistanciaKm(localizacaoUsuario,u)})):[],[unidades,localizacaoUsuario]);
    const nearby=[...distances].sort((a,b)=>a.km-b.km).slice(0,2);
    const valid=distances.filter(x=>dadosAtuais(x.u));const maxDistance=Math.max(1,...valid.map(x=>x.km));
    const suggestions=[...valid].sort((a,b)=>(a.km/maxDistance*55+a.u.percentualOcupacao*.45)-(b.km/maxDistance*55+b.u.percentualOcupacao*.45)).slice(0,2);
    const favorites=unidades.filter(u=>favoritos.some(f=>f.unidadeId===u.unidadeId));
    function row(u:Unidade,detail?:string){const status=statusNoMapa(u);return <Pressable key={u.unidadeId} accessibilityRole="button" onPress={()=>{toggle(false);setSearch("");onAbrirUnidade(u);}} style={styles.card}>
        <Text style={styles.name}>{u.nome}</Text><Text style={styles.text}>{detail}</Text><Text style={[styles.text,{color:status.color}]}>{status.text}</Text></Pressable>;}
    return <Animated.View style={[styles.container,{bottom:Math.max(12,insets.bottom)},style]}>
        <BlurView intensity={45} tint="light" style={StyleSheet.absoluteFill}/>
        <GestureDetector gesture={drag}><Pressable accessibilityRole="button" accessibilityLabel={open?"Recolher painel":"Expandir painel"} onPress={()=>toggle(!open)} style={styles.handle}><View style={styles.bar}/></Pressable></GestureDetector>
        {open?<ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            <TextInput accessibilityLabel="Buscar unidade" value={search} onChangeText={setSearch} placeholder="Nome ou endereço" style={styles.input}/>
            {search.trim()?<><Text style={styles.heading}>Resultados</Text>{unidades.filter(u=>`${u.nome} ${u.endereco}`.toLowerCase().includes(search.trim().toLowerCase())).map(u=>row(u))}</>:<>
                <Text style={styles.heading}>Próximas de você</Text>{nearby.map(x=>row(x.u,`${x.km.toFixed(1)} km em linha reta`))}
                {!nearby.length&&<Text style={styles.text}>{erroLocalizacao||"Sem localização disponível. Use a busca para consultar unidades."}</Text>}
                <Text style={styles.heading}>Sugestões com dados atuais</Text>{suggestions.map(x=>row(x.u,`${x.km.toFixed(1)} km em linha reta`))}
                {!suggestions.length&&<Text style={styles.text}>Sem sugestões com localização e medição atuais.</Text>}
            </>}
            {!search.trim()&&<><Text style={styles.heading}>Todas as unidades</Text>{unidades.map(u=>row(u))}</>}
            <Text style={styles.heading}>Favoritos</Text>{favorites.map(u=>row(u))}
            {!favorites.length&&<Text style={styles.text}>Nenhum favorito disponível.</Text>}
            <Pressable accessibilityRole="button" style={styles.card} onPress={()=>nav.navigate(autenticado?"Profile":"Access")}><Text style={styles.name}>{usuario?usuario.nome:"Acessar perfil"} →</Text></Pressable>
            <Pressable accessibilityRole="button" style={styles.card} onPress={()=>nav.navigate(autenticado?"Suporte":"Login")}><Text style={styles.name}>Suporte →</Text></Pressable>
        </ScrollView>:<Pressable accessibilityRole="button" onPress={()=>toggle(true)} style={styles.closed}><Text style={styles.name}>⌕ Procurar unidade</Text><Text style={styles.name}>{usuario?.nome.charAt(0)||"●"}</Text></Pressable>}
    </Animated.View>;
}
const styles=StyleSheet.create({
    container:{position:"absolute",left:18,right:18,borderRadius:25,overflow:"hidden",borderWidth:1,borderColor:colors.glassBorder,backgroundColor:colors.glassLight,elevation:12,zIndex:50},
    handle:{height:24,alignItems:"center",justifyContent:"center"},bar:{width:46,height:4,borderRadius:4,backgroundColor:colors.primary},
    content:{padding:14,paddingBottom:24,gap:10},input:{minHeight:48,padding:12,borderWidth:1,borderColor:colors.primary,borderRadius:15,backgroundColor:"white",fontSize:16},
    card:{backgroundColor:colors.surface,borderRadius:14,padding:14,gap:4},name:{fontSize:14,fontWeight:"800",color:colors.text},
    text:{fontSize:13,lineHeight:19,color:colors.textSecondary},heading:{fontSize:15,fontWeight:"800",color:colors.primaryDark,marginTop:8},
    closed:{flex:1,flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingHorizontal:20,paddingBottom:8}
});

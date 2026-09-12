import { useState } from "react";
import { Text,View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuth } from "../context/AuthContext";
import { criarSuporte } from "../service/api";
import { categorias,CategoriaSuporte } from "../types/Suporte";
import { ScreenLayout,Field,Button,ErrorNotice,ui } from "../components/ScreenLayout";
export default function NovaSolicitacaoSuporteScreen({navigation}:NativeStackScreenProps<RootStackParamList,"NovaSolicitacaoSuporte">){
    const {usuario}=useAuth();const [assunto,setAssunto]=useState(""),[descricao,setDescricao]=useState("");
    const [categoria,setCategoria]=useState<CategoriaSuporte>("APLICATIVO"),[error,setError]=useState(""),[busy,setBusy]=useState(false);
    async function enviar(){if(!usuario)return;if(!assunto.trim()||!descricao.trim()){setError("Preencha assunto e descrição.");return;}
        setBusy(true);setError("");try{const s=await criarSuporte({assunto:assunto.trim(),descricao:descricao.trim(),categoria},usuario.token);navigation.replace("DetalheSuporte",{id:s.id});}
        catch(e){setError(e instanceof Error?e.message:"Não foi possível enviar.");}finally{setBusy(false);}}
    return <ScreenLayout title="Nova solicitação" onBack={()=>navigation.goBack()}>
        {!usuario?<Button title="Entrar para solicitar suporte" onPress={()=>navigation.navigate("Login")}/>:<>
        <Field label="Assunto" value={assunto} onChangeText={setAssunto} maxLength={150}/>
        <Text style={ui.label}>Categoria</Text><View style={ui.row}>{categorias.map(c=><Button key={c} title={c.replaceAll("_"," ")} secondary={categoria!==c} onPress={()=>setCategoria(c)}/>)}</View>
        <Field label="Descrição" value={descricao} onChangeText={setDescricao} multiline maxLength={5000}/>
        <Text style={ui.text}>Descreva o problema. Não informe senhas, códigos ou dados clínicos.</Text>
        <ErrorNotice message={error}/><Button title="Enviar solicitação" onPress={()=>void enviar()} busy={busy}/></>}
    </ScreenLayout>;
}

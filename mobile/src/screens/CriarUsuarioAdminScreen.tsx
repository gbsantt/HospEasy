import { useState } from "react";
import { Text,View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ScreenLayout,Field,Button,ErrorNotice,ui } from "../components/ScreenLayout";
import { useAuth } from "../context/AuthContext";
import { criarUsuarioAdmin,TipoUsuario } from "../service/api";
export default function CriarUsuarioAdminScreen({navigation}:NativeStackScreenProps<RootStackParamList,"CriarUsuarioAdmin">){
    const {usuario}=useAuth();const [nome,setNome]=useState(""),[email,setEmail]=useState(""),[senha,setSenha]=useState(""),[confirm,setConfirm]=useState("");
    const [tipo,setTipo]=useState<TipoUsuario>("USUARIO"),[error,setError]=useState(""),[busy,setBusy]=useState(false);
    async function save(){if(!usuario)return;if(!nome.trim()||!email.trim()||senha.length<6||senha!==confirm){setError("Preencha os dados e confirme a senha (mínimo 6 caracteres).");return;}
        setBusy(true);setError("");try{await criarUsuarioAdmin({nome:nome.trim(),email:email.trim().toLowerCase(),senha,tipo},usuario.token);navigation.goBack();}
        catch(e){setError(e instanceof Error?e.message:"Não foi possível criar o usuário.");}finally{setBusy(false);}}
    return <ScreenLayout title="Novo usuário" onBack={()=>navigation.goBack()}>
        {!usuario||usuario.tipo!=="ADMIN"?<Text style={ui.text}>Acesso exclusivo de administradores.</Text>:<>
        <Field label="Nome" value={nome} onChangeText={setNome} maxLength={120}/>
        <Field label="E-mail" value={email} onChangeText={setEmail} maxLength={180} keyboardType="email-address" autoCapitalize="none"/>
        <Field label="Senha" value={senha} onChangeText={setSenha} maxLength={72} secureTextEntry/>
        <Field label="Confirmar senha" value={confirm} onChangeText={setConfirm} maxLength={72} secureTextEntry/>
        <View style={ui.row}>{(["USUARIO","ADMIN"] as TipoUsuario[]).map(t=><Button key={t} title={t} secondary={tipo!==t} onPress={()=>setTipo(t)}/>)}</View>
        <ErrorNotice message={error}/><Button title="Cadastrar usuário" busy={busy} onPress={()=>void save()}/></>}
    </ScreenLayout>;
}

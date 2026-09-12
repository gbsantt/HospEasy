import { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ScreenLayout,Field,Button,ErrorNotice } from "../components/ScreenLayout";
import { useAuth } from "../context/AuthContext";
export default function RegisterScreen({navigation}:NativeStackScreenProps<RootStackParamList,"Register">){
    const {cadastro}=useAuth();const [nome,setNome]=useState(""),[email,setEmail]=useState(""),[senha,setSenha]=useState(""),[confirmar,setConfirmar]=useState("");
    const [error,setError]=useState(""),[busy,setBusy]=useState(false);
    async function criar(){if(!nome.trim()||!email.trim()||senha.length<6||senha!==confirmar){setError("Preencha os dados e confirme uma senha de pelo menos 6 caracteres.");return;}
        setBusy(true);setError("");try{await cadastro(nome,email,senha);navigation.reset({index:0,routes:[{name:"Home"}]});}
        catch(e){setError(e instanceof Error?e.message:"Não foi possível criar a conta.");}finally{setBusy(false);}}
    return <ScreenLayout title="Criar conta" onBack={()=>navigation.goBack()}>
        <Field label="Nome" value={nome} onChangeText={setNome} maxLength={120} autoComplete="name"/>
        <Field label="E-mail" value={email} onChangeText={setEmail} maxLength={180} autoCapitalize="none" keyboardType="email-address" autoComplete="email"/>
        <Field label="Senha" value={senha} onChangeText={setSenha} maxLength={72} secureTextEntry autoComplete="new-password"/>
        <Field label="Confirmar senha" value={confirmar} onChangeText={setConfirmar} maxLength={72} secureTextEntry/>
        <ErrorNotice message={error}/><Button title="Criar conta" busy={busy} onPress={()=>void criar()}/>
        <Button title="Já tenho conta" secondary onPress={()=>navigation.navigate("Login")}/>
    </ScreenLayout>;
}

import { useState } from "react";
import { Linking } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ScreenLayout,Field,Button,ErrorNotice } from "../components/ScreenLayout";
import { useAuth } from "../context/AuthContext";
export default function LoginScreen({navigation}:NativeStackScreenProps<RootStackParamList,"Login">){
    const {login}=useAuth();const [email,setEmail]=useState(""),[senha,setSenha]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
    async function entrar(){if(!email.trim()||!senha){setError("Preencha e-mail e senha.");return;}setBusy(true);setError("");
        try{await login(email,senha);navigation.reset({index:0,routes:[{name:"Home"}]});}
        catch(e){setError(e instanceof Error?e.message:"Não foi possível entrar.");}finally{setBusy(false);}}
    const support=process.env.EXPO_PUBLIC_SUPPORT_URL;
    return <ScreenLayout title="Entrar no HospEasy" onBack={()=>navigation.goBack()}>
        <Field label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" maxLength={180}/>
        <Field label="Senha" value={senha} onChangeText={setSenha} secureTextEntry autoComplete="current-password" maxLength={72}/>
        <ErrorNotice message={error}/><Button title="Entrar" busy={busy} onPress={()=>void entrar()}/>
        <Button title="Esqueci minha senha" secondary onPress={()=>navigation.navigate("ForgotPassword")}/>
        <Button title="Criar conta" secondary onPress={()=>navigation.navigate("Register")}/>
        {support&&/^(https:\/\/|mailto:)/.test(support)&&<Button title="Contato de suporte" secondary onPress={()=>{void Linking.openURL(support).catch(()=>setError("Não foi possível abrir o canal de suporte."));}}/>}
    </ScreenLayout>;
}

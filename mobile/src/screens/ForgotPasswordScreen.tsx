import { useState } from "react";
import { Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ScreenLayout,Field,Button,ErrorNotice,ui } from "../components/ScreenLayout";
import { solicitarRecuperacaoSenha } from "../service/api";
export default function ForgotPasswordScreen({navigation}:NativeStackScreenProps<RootStackParamList,"ForgotPassword">){
    const [email,setEmail]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
    async function enviar(){if(!email.trim()){setError("Informe seu e-mail.");return;}setBusy(true);setError("");
        try{await solicitarRecuperacaoSenha(email.trim().toLowerCase());navigation.navigate("VerifyCode",{email:email.trim().toLowerCase()});}
        catch(e){setError(e instanceof Error?e.message:"Não foi possível solicitar o código.");}finally{setBusy(false);}}
    return <ScreenLayout title="Recuperar senha" onBack={()=>navigation.goBack()}>
        <Text style={ui.text}>Se existir uma conta elegível, enviaremos as instruções. Aguarde pelo menos um minuto antes de solicitar outro código.</Text>
        <Field label="E-mail" value={email} onChangeText={setEmail} maxLength={180} keyboardType="email-address" autoCapitalize="none"/>
        <ErrorNotice message={error}/><Button title="Solicitar código" busy={busy} onPress={()=>void enviar()}/>
    </ScreenLayout>;
}

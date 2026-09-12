import { useState } from "react";
import { Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ScreenLayout,Field,Button,ErrorNotice,ui } from "../components/ScreenLayout";
import { verificarCodigoRecuperacao } from "../service/api";
export default function VerifyCodeScreen({navigation,route}:NativeStackScreenProps<RootStackParamList,"VerifyCode">){
    const email=route.params?.email;const [codigo,setCodigo]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
    async function verificar(){if(!email||!/^\d{6}$/.test(codigo)){setError("Informe os seis dígitos do código.");return;}setBusy(true);setError("");
        try{await verificarCodigoRecuperacao(email,codigo);navigation.navigate("ResetPassword",{email,codigo});}
        catch(e){setError(e instanceof Error?e.message:"Código inválido.");}finally{setBusy(false);}}
    return <ScreenLayout title="Verificar código" onBack={()=>navigation.goBack()}>
        {!email?<Button title="Solicitar um novo código" onPress={()=>navigation.navigate("ForgotPassword")}/>:<>
        <Text style={ui.text}>Se a conta for elegível, o código foi enviado para {email}. Ele expira em dez minutos.</Text>
        <Field label="Código de seis dígitos" value={codigo} onChangeText={v=>setCodigo(v.replace(/\D/g,"").slice(0,6))} keyboardType="number-pad" maxLength={6}/>
        <ErrorNotice message={error}/><Button title="Continuar" busy={busy} onPress={()=>void verificar()}/>
        <Button title="Solicitar outro código" secondary onPress={()=>navigation.navigate("ForgotPassword")}/></>}
    </ScreenLayout>;
}

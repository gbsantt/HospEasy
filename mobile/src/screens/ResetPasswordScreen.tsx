import { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ScreenLayout,Field,Button,ErrorNotice } from "../components/ScreenLayout";
import { redefinirSenha } from "../service/api";
export default function ResetPasswordScreen({navigation,route}:NativeStackScreenProps<RootStackParamList,"ResetPassword">){
    const email=route.params?.email,codigo=route.params?.codigo;
    const [senha,setSenha]=useState(""),[confirmar,setConfirmar]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
    async function salvar(){if(!email||!codigo||senha.length<6||senha!==confirmar){setError("Confirme uma senha de pelo menos 6 caracteres.");return;}
        setBusy(true);setError("");try{await redefinirSenha(email,codigo,senha);navigation.reset({index:0,routes:[{name:"Login"}]});}
        catch(e){setError(e instanceof Error?e.message:"Não foi possível redefinir a senha.");}finally{setBusy(false);}}
    return <ScreenLayout title="Nova senha" onBack={()=>navigation.goBack()}>
        {!email||!codigo?<Button title="Reiniciar recuperação" onPress={()=>navigation.navigate("ForgotPassword")}/>:<>
        <Field label="Nova senha" value={senha} onChangeText={setSenha} maxLength={72} secureTextEntry autoComplete="new-password"/>
        <Field label="Confirmar senha" value={confirmar} onChangeText={setConfirmar} maxLength={72} secureTextEntry/>
        <ErrorNotice message={error}/><Button title="Salvar nova senha" busy={busy} onPress={()=>void salvar()}/></>}
    </ScreenLayout>;
}

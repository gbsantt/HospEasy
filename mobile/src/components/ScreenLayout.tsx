import { ReactNode } from "react";
import { KeyboardAvoidingView,Platform,Pressable,ScrollView,StyleSheet,Text,TextInput,TextInputProps,View,ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
export function ScreenLayout({children,title,onBack}:{children:ReactNode;title?:string;onBack?:()=>void}) {
    return <SafeAreaView style={{flex:1,backgroundColor:colors.background}}>
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":undefined}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.page}>
                {onBack && <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onBack} style={ui.back}><Text style={ui.link}>← Voltar</Text></Pressable>}
                {title && <Text accessibilityRole="header" style={ui.title}>{title}</Text>}{children}
            </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>;
}
export function Field({label,...props}:TextInputProps & {label:string}) {
    return <View style={{gap:6}}><Text style={ui.label}>{label}</Text><TextInput accessibilityLabel={label}
        placeholderTextColor={colors.textSecondary} {...props} style={[ui.input,props.multiline&&{minHeight:130,textAlignVertical:"top"},props.style]}/></View>;
}
export function Button({title,onPress,busy=false,disabled=false,secondary=false}:{title:string;onPress:()=>void;busy?:boolean;disabled?:boolean;secondary?:boolean}) {
    return <Pressable accessibilityRole="button" accessibilityState={{disabled:disabled||busy}} disabled={disabled||busy}
        onPress={onPress} style={[ui.button,secondary&&{backgroundColor:colors.primaryLight},(disabled||busy)&&{opacity:0.55}]}>
        {busy?<ActivityIndicator color={colors.primary}/>:<Text style={[ui.buttonText,secondary&&{color:colors.primaryDark}]}>{title}</Text>}
    </Pressable>;
}
export function ErrorNotice({message}:{message?:string|null}) {return message?<Text accessibilityRole="alert" style={ui.error}>{message}</Text>:null;}
export const ui=StyleSheet.create({
    page:{flexGrow:1,padding:20,paddingBottom:40,width:"100%",maxWidth:800,alignSelf:"center",gap:16},
    back:{alignSelf:"flex-start",paddingVertical:12,paddingRight:20},
    title:{fontSize:28,fontWeight:"800",color:colors.text,flexShrink:1},
    label:{fontSize:14,fontWeight:"700",color:colors.text},
    input:{minHeight:52,borderWidth:1,borderColor:colors.border,borderRadius:14,padding:14,fontSize:16,color:colors.text,backgroundColor:colors.surface},
    button:{minHeight:48,padding:14,borderRadius:14,backgroundColor:colors.primary,alignItems:"center",justifyContent:"center"},
    buttonText:{color:"#fff",fontWeight:"700",fontSize:15,textAlign:"center"},
    link:{color:colors.primaryDark,fontWeight:"700",fontSize:15},
    error:{color:colors.danger,fontSize:15,lineHeight:22},
    text:{color:colors.text,fontSize:15,lineHeight:23},
    card:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:16,padding:16,gap:12},
    row:{flexDirection:"row",gap:10,flexWrap:"wrap",alignItems:"center"},
});

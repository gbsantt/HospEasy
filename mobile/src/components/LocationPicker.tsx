import { useEffect, useRef, useMemo as useThemeMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Map, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./map.web.css";
import { Palette } from "../theme/colors";
import { useTheme } from "../context/ThemeContext";
import AddressSearch from "./AddressSearch";
type Coordenada={latitude:number;longitude:number};
type Props={visible:boolean;coordenada:Coordenada|null;onChange:(point:Coordenada)=>void;onConfirm:()=>void;onClose:()=>void};
export default function LocationPicker({visible,coordenada,onChange,onConfirm,onClose}:Props){
    const styles=useStyles();const {mode}=useTheme();
    const container=useRef<HTMLDivElement|null>(null),map=useRef<Map|null>(null),marker=useRef<Marker|null>(null);
    const change=useRef(onChange);change.current=onChange;
    const initial=useRef(coordenada);initial.current=coordenada;
    useEffect(()=>{
        if(!visible||!container.current)return;
        const base=(process.env.EXPO_PUBLIC_BASE_PATH||"").replace(/\/$/,"");
        setWorkerUrl(new URL(base+"/maplibre/maplibre-gl-worker.mjs",window.location.origin).href);
        const point=initial.current;
        const instance=new Map({container:container.current,style:"https://tiles.openfreemap.org/styles/"+(mode==="dark"?"dark":"liberty"),center:point?[point.longitude,point.latitude]:[-46.6333,-23.5505],zoom:point?16:10});
        map.current=instance;instance.addControl(new NavigationControl(),"top-right");
        if(point)marker.current=new Marker({color:"#61B723"}).setLngLat([point.longitude,point.latitude]).addTo(instance);
        instance.on("click",event=>change.current({latitude:event.lngLat.lat,longitude:event.lngLat.lng}));
        const observer=new ResizeObserver(()=>instance.resize());observer.observe(container.current);
        return()=>{observer.disconnect();marker.current?.remove();marker.current=null;instance.remove();map.current=null;};
    },[visible]);
    useEffect(()=>{map.current?.setStyle("https://tiles.openfreemap.org/styles/"+(mode==="dark"?"dark":"liberty"));},[mode]);
    useEffect(()=>{
        if(!coordenada||!map.current)return;
        const point:[number,number]=[coordenada.longitude,coordenada.latitude];
        if(marker.current)marker.current.setLngLat(point);
        else marker.current=new Marker({color:"#61B723"}).setLngLat(point).addTo(map.current);
    },[coordenada]);
    return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}><View style={styles.modal}>
            <View style={styles.header}><View><Text style={styles.title}>Localização da unidade</Text><Text style={styles.subtitle}>Clique no mapa para marcar a posição exata.</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar mapa" onPress={onClose} style={styles.closeButton}><Text style={styles.closeText}>✕</Text></Pressable></View>
            {visible&&<AddressSearch onFound={point=>{onChange(point);map.current?.flyTo({center:[point.longitude,point.latitude],zoom:16});}}/>}
            <View style={styles.mapWrapper}><div ref={container} style={{width:"100%",height:"100%"}}/></View>
            <View style={styles.footer}><Text style={styles.coordinates}>{coordenada?coordenada.latitude.toFixed(6)+" • "+coordenada.longitude.toFixed(6):"Nenhum ponto selecionado."}</Text>
            <View style={styles.actions}><Pressable accessibilityRole="button" style={[styles.cancelButton,{flex:1,alignItems:"center",justifyContent:"center"}]} onPress={onClose}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
            <Pressable accessibilityRole="button" disabled={!coordenada} style={[styles.confirmButton,{flex:1,alignItems:"center",justifyContent:"center"},!coordenada&&styles.disabledButton]} onPress={onConfirm}><Text style={[styles.confirmText,{textAlign:"center"}]}>Confirmar localização</Text></Pressable></View></View>
        </View></View>
    </Modal>;
}
const createStyles = (colors: Palette) => StyleSheet.create({

        overlay: {

            flex: 1,

            backgroundColor:
                "rgba(0,0,0,0.55)",

            alignItems:
                "center",

            justifyContent:
                "center",

            padding: 12,

        },


        modal: {

            width:
                "100%",

            maxWidth:
                1000,

            height:
                "92%",

            maxHeight:
                750,

            overflow:
                "hidden",

            borderRadius:
                24,

            backgroundColor:
            colors.surface,

        },


        header: {

            paddingHorizontal:
                22,

            paddingVertical:
                18,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

            borderBottomWidth:
                1,

            borderBottomColor:
            colors.border,

        },


        title: {

            fontSize:
                20,

            fontWeight:
                "900",

            color:
            colors.text,

        },


        subtitle: {

            marginTop:
                3,

            fontSize:
                13,

            color:
            colors.textSecondary,

        },


        closeButton: {

            width:
                38,

            height:
                38,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderRadius:
                19,

        },


        closeText: {

            fontSize:
                20,

            color:
            colors.text,

        },


        mapWrapper: {

            flex:
                1,

            minHeight: 100,

        },


        footer: {

            padding:
                18,

            gap:
                14,

            borderTopWidth:
                1,

            borderTopColor:
            colors.border,

        },


        locationInfo: {

            minHeight:
                42,

        },


        locationTitle: {

            fontSize:
                12,

            fontWeight:
                "800",

            color:
            colors.textSecondary,

        },


        coordinates: {

            marginTop:
                4,

            fontSize:
                14,

            fontWeight:
                "800",

            color:
            colors.text,

        },


        noLocation: {

            fontSize:
                13,

            color:
            colors.textSecondary,

        },


        actions: {

            flexDirection:
                "row",

            justifyContent:
                "flex-end",

            gap:
                10,

        },


        cancelButton: {

            paddingVertical:
                12,

            paddingHorizontal:
                20,

            borderRadius:
                12,

            borderWidth:
                1,

            borderColor:
            colors.border,

        },


        cancelText: {

            fontWeight:
                "700",

            color:
            colors.text,

        },


        confirmButton: {

            paddingVertical:
                12,

            paddingHorizontal:
                20,

            borderRadius:
                12,

            backgroundColor:
            colors.primary,

        },


        disabledButton: {

            opacity:
                0.4,

        },


        confirmText: {

            fontWeight:
                "900",

            color:
                "#FFFFFF",

        },

    });
function useStyles() { const {colors}=useTheme(); return useThemeMemo(()=>createStyles(colors),[colors]); }

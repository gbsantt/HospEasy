import { useEffect, useRef, useState } from "react";
import { Map, Marker, NavigationControl, LngLatBounds, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./map.web.css";
import { Unidade } from "../types/Unidade";
import { Coordenada } from "../utils/location";
import { statusNoMapa, temCoordenadas } from "../utils/mapStatus";

type Props = {
    unidades: Unidade[];
    localizacaoUsuario?: Coordenada | null;
    onSelecionarUnidade: (unidade: Unidade) => void;
};

export default function HospEasyMap({ unidades, localizacaoUsuario, onSelecionarUnidade }: Props) {
    const container = useRef<HTMLDivElement>(null);
    const mapa = useRef<Map | null>(null);
    const centralizouUnidades = useRef(false);
    const centralizouUsuario = useRef(false);
    const selecionar = useRef(onSelecionarUnidade);
    selecionar.current = onSelecionarUnidade;
    const [pronto, setPronto] = useState(false);
    const [erro, setErro] = useState(false);
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        if (!container.current) return;
        setErro(false);
        setPronto(false);
        centralizouUnidades.current = false;
        centralizouUsuario.current = false;
        let instancia: Map;
        try {
            const base = (process.env.EXPO_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
            setWorkerUrl(new URL(`${base}/maplibre/maplibre-gl-worker.mjs`, window.location.origin).href);
            instancia = new Map({
                container: container.current,
                style: "https://tiles.openfreemap.org/styles/liberty",
                center: [0, 0],
                zoom: 1,
            });
        } catch {
            setErro(true);
            return;
        }
        mapa.current = instancia;
        instancia.addControl(new NavigationControl({ showCompass: false }), "top-right");
        let carregou = false;
        const timeout = setTimeout(() => setErro(true), 20000);
        instancia.on("load", () => {
            carregou = true;
            clearTimeout(timeout);
            setPronto(true);
            setErro(false);
        });
        instancia.on("error", (event) => {
            setErro(true);
        });
        instancia.on("idle", () => { if (carregou && instancia.areTilesLoaded()) setErro(false); });
        const observer = new ResizeObserver(() => instancia.resize());
        observer.observe(container.current);
        return () => {
            clearTimeout(timeout);
            observer.disconnect();
            instancia.remove();
            mapa.current = null;
        };
    }, [tentativa]);

    useEffect(() => {
        const instancia = mapa.current;
        if (!instancia || !pronto) return;
        const localizadas = unidades.filter(temCoordenadas);
        const marcadores = localizadas.map((unidade) => {
            const status = statusNoMapa(unidade);
            const button = document.createElement("button");
            button.type = "button";
            button.className = "hospeasy-marker";
            button.style.backgroundColor = status.color;
            button.textContent = "H";
            button.title = `${unidade.nome} — ${status.text}`;
            button.setAttribute("aria-label", button.title);
            button.addEventListener("click", () => selecionar.current(unidade));
            return new Marker({ element: button })
                .setLngLat([unidade.longitude, unidade.latitude]).addTo(instancia);
        });
        if (localizadas.length && !centralizouUnidades.current && !centralizouUsuario.current) {
            const bounds = new LngLatBounds();
            localizadas.forEach((u) => bounds.extend([u.longitude, u.latitude]));
            instancia.fitBounds(bounds, { padding: 70, maxZoom: 14, duration: 0 });
            centralizouUnidades.current = true;
        }
        return () => marcadores.forEach((marker) => marker.remove());
    }, [unidades, pronto]);

    useEffect(() => {
        const instancia = mapa.current;
        if (!instancia || !pronto || !localizacaoUsuario) return;
        const point = document.createElement("div");
        point.className = "hospeasy-user-marker";
        point.setAttribute("aria-label", "Sua localização");
        const coordinates: [number, number] = [localizacaoUsuario.longitude, localizacaoUsuario.latitude];
        const marker = new Marker({ element: point }).setLngLat(coordinates).addTo(instancia);
        if (!centralizouUsuario.current) {
            instancia.flyTo({ center: coordinates, zoom: 13 });
            centralizouUsuario.current = true;
        }
        return () => { marker.remove(); };
    }, [localizacaoUsuario, pronto]);

    return (
        <div className="hospeasy-map-shell">
            <div ref={container} className="hospeasy-map" aria-label="Mapa HospEasy de unidades de saúde" />
            {erro && <div role="status" className="hospeasy-map-message">
                Não foi possível carregar o mapa completo. As unidades continuam disponíveis na lista.
                <button onClick={() => setTentativa((value) => value + 1)}>Tentar novamente</button>
            </div>}
            {!erro && !pronto && <div role="status" className="hospeasy-map-message">Carregando mapa…</div>}
            <button className="hospeasy-location" disabled={!localizacaoUsuario || !pronto}
                aria-label="Centralizar na minha localização" title="Minha localização"
                onClick={() => localizacaoUsuario && mapa.current?.flyTo({ center: [localizacaoUsuario.longitude, localizacaoUsuario.latitude], zoom: 15 })}>◎</button>
        </div>
    );
}

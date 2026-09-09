import { useCallback, useEffect, useRef, useState } from "react";
import { Coordenada } from "../utils/location";

export function useUserLocation() {
    const [localizacao, setLocalizacao] = useState<Coordenada | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const ativo = useRef(true);

    const recarregar = useCallback(() => {
        if (!navigator.geolocation) {
            setErro("Este navegador não oferece localização. Você pode consultar as unidades pela lista.");
            setCarregando(false);
            return;
        }
        setCarregando(true);
        setErro(null);
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                if (!ativo.current) return;
                setLocalizacao({ latitude: coords.latitude, longitude: coords.longitude });
                setCarregando(false);
            },
            (error) => {
                if (!ativo.current) return;
                setErro(error.code === 1
                    ? "Localização não autorizada. Você ainda pode consultar as unidades."
                    : "Não foi possível localizar você. Consulte as unidades pela lista.");
                setCarregando(false);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
        );
    }, []);

    useEffect(() => {
        ativo.current = true;
        recarregar();
        return () => { ativo.current = false; };
    }, [recarregar]);

    return { localizacao, carregando, erro, recarregar };
}

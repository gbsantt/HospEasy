package com.hospeasy.backend.service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospeasy.backend.exception.ApiException;
import org.springframework.stereotype.Service;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.io.IOException;
@Service
public class GeocodificacaoService {
    private final HttpClient client=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private final ObjectMapper json=new ObjectMapper();
    private long ultima;
    public Coordenadas geocodificar(String endereco) {
        try {
            limitar();
            var uri=URI.create("https://nominatim.openstreetmap.org/search?q="+URLEncoder.encode(endereco.trim(),StandardCharsets.UTF_8)
                +"&format=jsonv2&limit=1&countrycodes=br&addressdetails=1");
            var req=HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(10))
                .header("User-Agent","HospEasy-TCC/1.0").header("Accept","application/json").GET().build();
            var res=client.send(req,HttpResponse.BodyHandlers.ofString());
            if(res.statusCode()==429) throw new ApiException(429,"GEOCODIFICACAO_LIMITE","Serviço de localização ocupado. Aguarde ou confirme as coordenadas manualmente.");
            if(res.statusCode()!=200) throw unavailable("Serviço de localização indisponível. Confirme as coordenadas manualmente ou tente novamente.");
            var results=json.readTree(res.body());
            if(!results.isArray() || results.isEmpty()) throw new ApiException(400,"ENDERECO_NAO_ENCONTRADO","Endereço não encontrado. Revise-o ou informe coordenadas confirmadas.");
            var r=results.get(0);
            String type=r.path("type").asText();
            boolean preciso=r.path("address").has("house_number") || java.util.Set.of("hospital","clinic","doctors","house","building").contains(type);
            if(!preciso) throw new ApiException(400,"LOCALIZACAO_APROXIMADA","A busca retornou apenas uma área aproximada. Confirme latitude e longitude da unidade antes de salvar.");
            double lat=Double.parseDouble(r.path("lat").asText()), lon=Double.parseDouble(r.path("lon").asText());
            if(!Double.isFinite(lat)||!Double.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180) throw unavailable("Coordenadas inválidas recebidas do serviço.");
            return new Coordenadas(lat,lon);
        } catch(HttpTimeoutException e) { throw unavailable("Tempo limite na localização. Tente novamente ou confirme as coordenadas manualmente."); }
        catch(InterruptedException e) { Thread.currentThread().interrupt(); throw unavailable("Consulta de localização interrompida."); }
        catch(IOException | NumberFormatException e) { throw unavailable("Falha de comunicação com o serviço de localização."); }
    }
    private ApiException unavailable(String msg) { return new ApiException(503,"GEOCODIFICACAO_INDISPONIVEL",msg); }
    private synchronized void limitar() throws InterruptedException {
        long wait=1100-(System.currentTimeMillis()-ultima); if(wait>0) Thread.sleep(wait); ultima=System.currentTimeMillis();
    }
    public record Coordenadas(double latitude,double longitude) {}
}

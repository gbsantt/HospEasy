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
        return buscar(endereco,true);
    }
    public Coordenadas pesquisar(String endereco) {
        return buscar(endereco,false);
    }
    private Coordenadas buscar(String endereco,boolean exigirPrecisao) {
        return buscar(endereco,exigirPrecisao,null);
    }
    private Coordenadas buscar(String endereco,boolean exigirPrecisao,com.fasterxml.jackson.databind.JsonNode[] postal) {
        String texto=endereco.trim();
        var cep=java.util.regex.Pattern.compile("(?i)^(?:cep\\s*:?\\s*)?(\\d{5})\\s*-?\\s*(\\d{3})$").matcher(texto);
        boolean buscaCep=cep.matches();
        if(!buscaCep && texto.matches("(?i)^(?:cep\\s*:?\\s*)?[\\d\\s-]+$"))
            throw new ApiException(400,"CEP_INVALIDO","Informe um CEP com 8 dígitos, com ou sem hífen.");
        String consulta=buscaCep ? "postalcode="+cep.group(1)+"-"+cep.group(2)
            : "q="+URLEncoder.encode(texto,StandardCharsets.UTF_8);
        try {
            limitar();
            com.fasterxml.jackson.databind.JsonNode enderecoCep=null;
            if(buscaCep) {
                enderecoCep=consultarCep(cep.group(1)+cep.group(2));
                if(postal!=null) postal[0]=enderecoCep;
                consulta="street="+encode(enderecoCep.path("street").asText())
                    +"&city="+encode(enderecoCep.path("city").asText())
                    +"&state="+encode(enderecoCep.path("state").asText());
            }
            var uri=URI.create("https://nominatim.openstreetmap.org/search?"+consulta
                +"&format=jsonv2&limit=5&countrycodes=br&addressdetails=1");
            var req=HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(10))
                .header("User-Agent","HospEasy-TCC/1.0").header("Accept","application/json").GET().build();
            var res=client.send(req,HttpResponse.BodyHandlers.ofString());
            if(res.statusCode()==429) throw new ApiException(429,"GEOCODIFICACAO_LIMITE","Serviço de localização ocupado. Aguarde ou confirme as coordenadas manualmente.");
            if(res.statusCode()!=200) throw unavailable("Serviço de localização indisponível. Confirme as coordenadas manualmente ou tente novamente.");
            var results=json.readTree(res.body());
            if(results==null || !results.isArray() || results.isEmpty()) {
                if(buscaCep) throw cepSemPonto(enderecoCep);
                throw new ApiException(400,"ENDERECO_NAO_ENCONTRADO","Endereço não encontrado. Revise-o ou informe coordenadas confirmadas.");
            }
            var r=results.get(0);
            if(buscaCep) {
                r=null;
                for(var candidato:results) {
                    var address=candidato.path("address");
                    String cidade=address.path("city").asText(address.path("town").asText(address.path("municipality").asText()));
                    String codigoPostal=address.path("postcode").asText().replaceAll("\\D","");
                    String bairro=address.path("suburb").asText(address.path("neighbourhood").asText());
                    boolean regiaoConfirmada=codigoPostal.equals(cep.group(1)+cep.group(2))
                        || (codigoPostal.isBlank() && !bairro.isBlank() && normalizar(bairro).equals(normalizar(enderecoCep.path("neighborhood").asText())));
                    if(normalizar(address.path("road").asText()).equals(normalizar(enderecoCep.path("street").asText()))
                        && regiaoConfirmada
                        && normalizar(cidade).equals(normalizar(enderecoCep.path("city").asText()))
                        && address.path("ISO3166-2-lvl4").asText().equalsIgnoreCase("BR-"+enderecoCep.path("state").asText())) {
                        r=candidato;break;
                    }
                }
                if(r==null) throw cepSemPonto(enderecoCep);
            }
            String type=r.path("type").asText();
            boolean preciso=r.path("address").has("house_number") || java.util.Set.of("hospital","clinic","doctors","house","building").contains(type);
            if(exigirPrecisao && (buscaCep || !preciso)) throw new ApiException(400,"LOCALIZACAO_APROXIMADA","A busca retornou apenas uma área aproximada. Confirme latitude e longitude da unidade antes de salvar.");
            double lat=Double.parseDouble(r.path("lat").asText()), lon=Double.parseDouble(r.path("lon").asText());
            if(!Double.isFinite(lat)||!Double.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180) throw unavailable("Coordenadas inválidas recebidas do serviço.");
            if(postal!=null) postal[1]=r;
            return new Coordenadas(lat,lon);
        } catch(HttpTimeoutException e) { throw unavailable("Tempo limite na localização. Tente novamente ou confirme as coordenadas manualmente."); }
        catch(InterruptedException e) { Thread.currentThread().interrupt(); throw unavailable("Consulta de localização interrompida."); }
        catch(IOException | NumberFormatException e) { throw unavailable("Falha de comunicação com o serviço de localização."); }
    }
    private ApiException unavailable(String msg) { return new ApiException(503,"GEOCODIFICACAO_INDISPONIVEL",msg); }
    private com.fasterxml.jackson.databind.JsonNode consultarCep(String cep) throws InterruptedException, IOException {
            var req=HttpRequest.newBuilder(URI.create("https://brasilapi.com.br/api/cep/v2/"+cep))
                .timeout(Duration.ofSeconds(6)).header("Accept","application/json").GET().build();
            var res=client.send(req,HttpResponse.BodyHandlers.ofString());
            if(res.statusCode()==404) throw new ApiException(400,"CEP_NAO_ENCONTRADO","CEP não encontrado. Verifique os 8 dígitos.");
            if(res.statusCode()!=200) throw unavailable("Não foi possível consultar o endereço do CEP. Tente novamente.");
            var data=json.readTree(res.body());
            if(data==null || !data.isObject() || !cep.equals(data.path("cep").asText().replace("-",""))) throw unavailable("Resposta inválida do serviço de CEP.");
            if(data.path("street").asText().isBlank() || data.path("city").asText().isBlank() || data.path("state").asText().isBlank()) throw cepSemPonto(data);
            // Provider coordinates may be the municipal centroid; use only the postal address.
            return data;
    }
    private String encode(String texto) { return URLEncoder.encode(texto,StandardCharsets.UTF_8); }
    public ResultadoBusca pesquisarOpcoes(String endereco) {
        var postal=new com.fasterxml.jackson.databind.JsonNode[2];
        ApiException falha;
        try {
            var ponto=buscar(endereco,false,postal);
            return new ResultadoBusca(java.util.List.of(new Sugestao(ponto.latitude(),ponto.longitude(),postal[1].path("display_name").asText(endereco.trim()),"Nominatim","Confira o local no mapa e ajuste o ponto da unidade.")),null);
        } catch(ApiException e) {
            if(!java.util.Set.of("ENDERECO_NAO_ENCONTRADO","CEP_SEM_LOCALIZACAO_CONFIRMADA","GEOCODIFICACAO_INDISPONIVEL").contains(e.getCodigo())) throw e;
            falha=e;
        }
        // An unresolved postal lookup must not be turned into a fuzzy search for eight digits.
        if(postal[0]==null && endereco.trim().matches("(?i)^(?:cep\\s*:?\\s*)?[\\d\\s-]+$")) throw falha;
        String consulta=postal[0]==null ? endereco.trim() : String.join(", ",postal[0].path("street").asText(),postal[0].path("neighborhood").asText(),postal[0].path("city").asText(),postal[0].path("state").asText(),"Brasil");
        try {
            var req=HttpRequest.newBuilder(URI.create("https://photon.komoot.io/api/?q="+encode(consulta)+"&limit=5"))
                .timeout(Duration.ofSeconds(8)).header("User-Agent","HospEasy-TCC/1.0").header("Accept","application/json").GET().build();
            var res=client.send(req,HttpResponse.BodyHandlers.ofString());
            if(res.statusCode()!=200) throw unavailable("A busca alternativa está indisponível. Tente novamente ou selecione o ponto manualmente.");
            var root=json.readTree(res.body());
            if(root==null || !root.path("features").isArray()) throw unavailable("Resposta inválida do serviço de localização.");
            var opcoes=new java.util.ArrayList<Sugestao>();
            var vistos=new java.util.HashSet<String>();
            for(var feature:root.path("features")) {
                var p=feature.path("properties");
                if(!"BR".equalsIgnoreCase(p.path("countrycode").asText())) continue;
                String nome=p.path("name").asText(p.path("street").asText());
                String cidade=p.path("city").asText();
                String ruaDigitada=normalizar(endereco.split(",",2)[0]).replaceFirst(" [0-9]+[a-z]?$","");
                if(postal[0]==null && endereco.contains(",") && ruaDigitada.matches("^(rua|avenida|travessa|estrada|rodovia|alameda) .*")
                    && !ruaDigitada.equals(normalizar(p.path("street").asText(nome)))) continue;
                // Never offer a city centre as a replacement for a street/address.
                if(!java.util.Set.of("street","house").contains(p.path("type").asText()) && p.path("street").asText().isBlank()) continue;
                if(postal[0]!=null && (!normalizar(p.path("street").asText(nome)).equals(normalizar(postal[0].path("street").asText()))
                    || !normalizar(cidade).equals(normalizar(postal[0].path("city").asText())))) continue;
                var geometry=feature.path("geometry");var coords=geometry.path("coordinates");
                if(!"Point".equals(geometry.path("type").asText()) || coords.size()<2 || !coords.get(0).isNumber() || !coords.get(1).isNumber()) continue;
                double lon=coords.get(0).asDouble(),lat=coords.get(1).asDouble();
                if(!Double.isFinite(lat)||!Double.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180) continue;
                String descricao=java.util.stream.Stream.of(nome,p.path("housenumber").asText(),p.path("district").asText(),cidade,p.path("state").asText(),p.path("postcode").asText())
                    .filter(s->!s.isBlank()).collect(java.util.stream.Collectors.joining(", "));
                if(descricao.isBlank() || !vistos.add(descricao)) continue;
                opcoes.add(new Sugestao(lat,lon,descricao,"Photon / OpenStreetMap","Resultado aproximado: bairro, CEP ou número podem diferir. Compare o endereço antes de usar este ponto."));
            }
            if(opcoes.isEmpty()) throw falha;
            return new ResultadoBusca(java.util.List.copyOf(opcoes),"Não foi possível confirmar o endereço exato. Estas são sugestões do mapa, não localizações confirmadas. Busca: "+consulta);
        } catch(InterruptedException e) { Thread.currentThread().interrupt();throw unavailable("Busca interrompida."); }
        catch(IOException e) { throw unavailable("Falha ao consultar a busca alternativa. Tente novamente ou selecione o ponto manualmente."); }
    }
    public record Sugestao(double latitude,double longitude,String endereco,String fonte,String aviso) {}
    public record ResultadoBusca(java.util.List<Sugestao> resultados,String aviso) {}
    private String normalizar(String texto) {
        return java.text.Normalizer.normalize(texto,java.text.Normalizer.Form.NFD).replaceAll("\\p{M}","").toLowerCase(java.util.Locale.ROOT).replaceAll("[^a-z0-9]+"," ").trim();
    }
    private ApiException cepSemPonto(com.fasterxml.jackson.databind.JsonNode data) {
        return new ApiException(400,"CEP_SEM_LOCALIZACAO_CONFIRMADA","CEP encontrado: "+data.path("street").asText()+", "+data.path("neighborhood").asText()+", "+data.path("city").asText()+" - "+data.path("state").asText()+". Não foi possível confirmar a rua no mapa. Selecione o ponto manualmente; o marcador não foi alterado.");
    }
    private synchronized void limitar() {
        long now=System.currentTimeMillis();
        if(now-ultima<1100) throw new ApiException(429,"GEOCODIFICACAO_LIMITE","Aguarde um instante antes de pesquisar outro endereço.");
        ultima=now;
    }
    public record Coordenadas(double latitude,double longitude) {}
}

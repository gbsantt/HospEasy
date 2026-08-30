package com.hospeasy.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;

import java.io.IOException;

import java.net.URI;
import java.net.URLEncoder;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import java.nio.charset.StandardCharsets;

import java.time.Duration;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;


@Service
public class GeocodificacaoService {

    /*
     * Nominatim / OpenStreetMap
     */
    private static final String URL_GEOCODIFICACAO =
            "https://nominatim.openstreetmap.org/search";


    /*
     * Identificação da aplicação enviada para o Nominatim.
     */
    private static final String USER_AGENT =
            "HospEasy-TCC/1.0";


    /*
     * Mantemos mais de 1 segundo entre as requisições
     * para respeitar o limite do serviço público.
     */
    private static final long INTERVALO_MINIMO_MS =
            1100;


    private final HttpClient httpClient;

    private final ObjectMapper objectMapper;


    /*
     * Evita repetir consultas do mesmo endereço
     * durante a execução do backend.
     */
    private final Map<String, Coordenadas>
            cache =
            new ConcurrentHashMap<>();


    private long ultimaRequisicaoEm =
            0;


    public GeocodificacaoService() {

        this.objectMapper =
                new ObjectMapper();


        this.httpClient =
                HttpClient
                        .newBuilder()
                        .connectTimeout(
                                Duration.ofSeconds(
                                        10
                                )
                        )
                        .build();
    }


    public Coordenadas geocodificar(
            String endereco
    ) {

        if (
                endereco == null ||
                        endereco.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Informe um endereço válido para localizar a unidade no mapa."
            );
        }


        String enderecoLimpo =
                limparEspacos(
                        endereco
                );


        String chaveCache =
                enderecoLimpo
                        .toLowerCase(
                                Locale.ROOT
                        );


        Coordenadas coordenadasCache =
                cache.get(
                        chaveCache
                );


        if (
                coordenadasCache != null
        ) {

            return coordenadasCache;
        }


        /*
         * Faz várias tentativas do mais específico para
         * o mais tolerante.
         *
         * Exemplo:
         *
         * Avenida Alfried Krupp, 776 - Centro,
         * Campo Limpo Paulista - SP
         *
         * 1) endereço exatamente como digitado
         * 2) endereço + Brasil
         * 3) troca "-" por ","
         * 4) remove o número
         * 5) remove o bairro e mantém via + cidade + estado
         */
        List<String> tentativas =
                montarTentativas(
                        enderecoLimpo
                );


        for (
                String tentativa :
                tentativas
        ) {

            Coordenadas coordenadas =
                    consultarNominatim(
                            tentativa
                    );


            if (
                    coordenadas != null
            ) {

                cache.put(
                        chaveCache,
                        coordenadas
                );


                return coordenadas;
            }
        }


        throw new IllegalArgumentException(
                "Endereço não encontrado. Tente informar rua ou avenida, número, cidade e estado."
        );
    }


    private List<String> montarTentativas(
            String endereco
    ) {

        Set<String> tentativas =
                new LinkedHashSet<>();


        String normalizado =
                limparEspacos(
                        endereco
                                .replace(
                                        " - ",
                                        ", "
                                )
                                .replace(
                                        "–",
                                        ","
                                )
                                .replace(
                                        "—",
                                        ","
                                )
                );


        /*
         * Endereço exatamente como o usuário digitou.
         */
        adicionarTentativa(
                tentativas,
                endereco
        );


        adicionarTentativa(
                tentativas,
                adicionarBrasil(
                        endereco
                )
        );


        /*
         * Formato mais amigável ao Nominatim:
         * hífens viram separadores por vírgula.
         */
        adicionarTentativa(
                tentativas,
                normalizado
        );


        adicionarTentativa(
                tentativas,
                adicionarBrasil(
                        normalizado
                )
        );


        /*
         * Alguns endereços existem no OSM, porém o número
         * do imóvel não está cadastrado.
         *
         * Nesse caso tentamos localizar a própria via.
         */
        String semNumero =
                removerNumeroDoEndereco(
                        normalizado
                );


        adicionarTentativa(
                tentativas,
                semNumero
        );


        adicionarTentativa(
                tentativas,
                adicionarBrasil(
                        semNumero
                )
        );


        /*
         * Caso o bairro atrapalhe a busca, tenta usar
         * somente:
         *
         * via + cidade + estado
         */
        String viaCidadeEstado =
                extrairViaCidadeEstado(
                        semNumero
                );


        adicionarTentativa(
                tentativas,
                viaCidadeEstado
        );


        adicionarTentativa(
                tentativas,
                adicionarBrasil(
                        viaCidadeEstado
                )
        );


        return new ArrayList<>(
                tentativas
        );
    }


    private Coordenadas consultarNominatim(
            String consulta
    ) {

        try {

            respeitarLimiteRequisicoes();


            String consultaCodificada =
                    URLEncoder.encode(
                            consulta,
                            StandardCharsets.UTF_8
                    );


            URI uri =
                    URI.create(
                            URL_GEOCODIFICACAO
                                    + "?q="
                                    + consultaCodificada
                                    + "&format=jsonv2"
                                    + "&limit=1"
                                    + "&countrycodes=br"
                                    + "&addressdetails=1"
                    );


            HttpRequest request =
                    HttpRequest
                            .newBuilder()
                            .uri(
                                    uri
                            )
                            .timeout(
                                    Duration.ofSeconds(
                                            15
                                    )
                            )
                            .header(
                                    "User-Agent",
                                    USER_AGENT
                            )
                            .header(
                                    "Accept",
                                    "application/json"
                            )
                            .header(
                                    "Accept-Language",
                                    "pt-BR,pt;q=0.9"
                            )
                            .GET()
                            .build();


            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse
                                    .BodyHandlers
                                    .ofString()
                    );


            if (
                    response.statusCode() < 200 ||
                            response.statusCode() >= 300
            ) {

                return null;
            }


            JsonNode resultados =
                    objectMapper.readTree(
                            response.body()
                    );


            if (
                    !resultados.isArray() ||
                            resultados.isEmpty()
            ) {

                return null;
            }


            JsonNode primeiroResultado =
                    resultados.get(
                            0
                    );


            JsonNode latitudeNode =
                    primeiroResultado.get(
                            "lat"
                    );


            JsonNode longitudeNode =
                    primeiroResultado.get(
                            "lon"
                    );


            if (
                    latitudeNode == null ||
                            longitudeNode == null
            ) {

                return null;
            }


            double latitude =
                    Double.parseDouble(
                            latitudeNode.asText()
                    );


            double longitude =
                    Double.parseDouble(
                            longitudeNode.asText()
                    );


            return new Coordenadas(
                    latitude,
                    longitude
            );

        } catch (
                InterruptedException exception
        ) {

            Thread.currentThread()
                    .interrupt();


            throw new IllegalArgumentException(
                    "A consulta do endereço foi interrompida. Tente novamente."
            );

        } catch (
                IOException |
                NumberFormatException exception
        ) {

            return null;
        }
    }


    private String removerNumeroDoEndereco(
            String endereco
    ) {

        /*
         * Remove números de endereço quando aparecem:
         *
         * ", 776,"
         * ", 776 "
         * " 776,"
         *
         * Sem destruir números que façam parte do nome
         * de uma rodovia ou cidade.
         */
        String resultado =
                endereco.replaceFirst(
                        "(?i)(,|\\s)\\s*\\d+[A-Za-z]?\\s*(?=,|$)",
                        ","
                );


        return limparVirgulas(
                resultado
        );
    }


    private String extrairViaCidadeEstado(
            String endereco
    ) {

        String[] partes =
                endereco.split(
                        ","
                );


        List<String> partesLimpas =
                new ArrayList<>();


        for (
                String parte :
                partes
        ) {

            String limpa =
                    limparEspacos(
                            parte
                    );


            if (
                    !limpa.isBlank()
            ) {

                partesLimpas.add(
                        limpa
                );
            }
        }


        if (
                partesLimpas.size() <= 3
        ) {

            return endereco;
        }


        /*
         * Normalmente:
         *
         * [0] via
         * [1] bairro
         * [2] cidade
         * [3] estado
         *
         * Mantemos o primeiro item e os dois últimos.
         */
        String via =
                partesLimpas.get(
                        0
                );


        String cidade =
                partesLimpas.get(
                        partesLimpas.size() - 2
                );


        String estado =
                partesLimpas.get(
                        partesLimpas.size() - 1
                );


        return via
                + ", "
                + cidade
                + ", "
                + estado;
    }


    private String adicionarBrasil(
            String endereco
    ) {

        if (
                endereco == null ||
                        endereco.isBlank()
        ) {

            return endereco;
        }


        String minusculo =
                endereco
                        .toLowerCase(
                                Locale.ROOT
                        );


        if (
                minusculo.contains(
                        "brasil"
                )
        ) {

            return endereco;
        }


        return endereco
                + ", Brasil";
    }


    private void adicionarTentativa(
            Set<String> tentativas,
            String tentativa
    ) {

        if (
                tentativa == null
        ) {

            return;
        }


        String limpa =
                limparVirgulas(
                        tentativa
                );


        if (
                !limpa.isBlank()
        ) {

            tentativas.add(
                    limpa
            );
        }
    }


    private String limparEspacos(
            String texto
    ) {

        if (
                texto == null
        ) {

            return "";
        }


        return texto
                .trim()
                .replaceAll(
                        "\\s+",
                        " "
                );
    }


    private String limparVirgulas(
            String texto
    ) {

        return limparEspacos(
                texto
        )
                .replaceAll(
                        "\\s*,\\s*",
                        ", "
                )
                .replaceAll(
                        "(,\\s*){2,}",
                        ", "
                )
                .replaceAll(
                        "^,\\s*|,\\s*$",
                        ""
                );
    }


    private synchronized void respeitarLimiteRequisicoes()
            throws InterruptedException {

        long agora =
                System.currentTimeMillis();


        long tempoDesdeUltimaRequisicao =
                agora -
                        ultimaRequisicaoEm;


        if (
                tempoDesdeUltimaRequisicao <
                        INTERVALO_MINIMO_MS
        ) {

            Thread.sleep(
                    INTERVALO_MINIMO_MS -
                            tempoDesdeUltimaRequisicao
            );
        }


        ultimaRequisicaoEm =
                System.currentTimeMillis();
    }


    public record Coordenadas(
            double latitude,
            double longitude
    ) {
    }
}

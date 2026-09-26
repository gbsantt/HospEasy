package com.hospeasy.backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import static org.junit.jupiter.api.Assertions.*;

/** Optional real-provider smoke test; ordinary builds never depend on public APIs. */
@EnabledIfEnvironmentVariable(named="HOSPEASY_GEOCODE_LIVE",matches="true")
class GeocodificacaoLiveTest {
    @Test void realPostalCodeAndAddressReturnLabelledSuggestions() throws Exception {
        var service=new GeocodificacaoService();
        for(String query:new String[]{"13233251","Rua Itu, Jardim Laura, Campo Limpo Paulista - SP"}) {
            var result=service.pesquisarOpcoes(query);
            assertFalse(result.resultados().isEmpty());
            for(var point:result.resultados()) {
                assertFalse(point.endereco().isBlank());
                assertFalse(point.aviso().isBlank());
                assertNotEquals(-23.20554,point.latitude(),0.00001);
                System.out.println(query+" -> "+point.fonte()+": "+point.endereco()+" ("+point.latitude()+", "+point.longitude()+")");
            }
            Thread.sleep(1100);
        }
    }
}

package com.hospeasy.backend.service;

import com.hospeasy.backend.config.RequestRateLimitFilter;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*;

class GeocodificacaoRateLimitTest {
    @Test void bothSearchEndpointsShareTheSameQuota() throws Exception {
        var filter=new RequestRateLimitFilter();var passed=new AtomicInteger();
        for(int i=0;i<11;i++) {
            var request=new MockHttpServletRequest();request.setMethod("GET");
            request.setServletPath(i%2==0?"/admin/geocodificacao/sugestoes":"/admin/geocodificacao");
            var response=new MockHttpServletResponse();
            filter.doFilter(request,response,(req,res)->passed.incrementAndGet());
            assertEquals(i==10?429:200,response.getStatus());
        }
        assertEquals(10,passed.get());
    }
}

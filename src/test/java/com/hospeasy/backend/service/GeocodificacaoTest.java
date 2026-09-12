package com.hospeasy.backend.service;
import com.hospeasy.backend.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.net.http.*;
import java.io.IOException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class GeocodificacaoTest {
 @SuppressWarnings("unchecked") private GeocodificacaoService service(int status,String body)throws Exception {
  var service=new GeocodificacaoService();var client=mock(HttpClient.class);var response=mock(HttpResponse.class);
  when(response.statusCode()).thenReturn(status);when(response.body()).thenReturn(body);
  when(client.send(any(HttpRequest.class),any(HttpResponse.BodyHandler.class))).thenReturn(response);
  ReflectionTestUtils.setField(service,"client",client);return service;
 }
 @Test void preciseAddressAccepted()throws Exception{
  var result=service(200,"[{\"lat\":\"-23.5\",\"lon\":\"-46.6\",\"address\":{\"house_number\":\"123\"}}]").geocodificar("Rua completa, 123");
  assertEquals(-23.5,result.latitude());assertEquals(-46.6,result.longitude());
 }
 @Test void notFoundAndApproximateAreDifferent()throws Exception{
  var empty=service(200,"[]");assertEquals("ENDERECO_NAO_ENCONTRADO",assertThrows(ApiException.class,()->empty.geocodificar("Rua")).getCodigo());
  var approximate=service(200,"[{\"lat\":\"-23\",\"lon\":\"-46\",\"type\":\"city\"}]");
  assertEquals("LOCALIZACAO_APROXIMADA",assertThrows(ApiException.class,()->approximate.geocodificar("Rua")).getCodigo());
 }
 @Test void providerFailureAndRateLimit()throws Exception{
  var offline=service(503,"");assertEquals(503,assertThrows(ApiException.class,()->offline.geocodificar("Rua")).getStatus());
  var limited=service(429,"");assertEquals(429,assertThrows(ApiException.class,()->limited.geocodificar("Rua")).getStatus());
 }
 @Test void timeoutAndNetworkDoNotBecomeAddressNotFound()throws Exception{
  for(Exception failure:new Exception[]{new HttpTimeoutException("timeout"),new IOException("network")}){
   var service=service(200,"[]");var client=(HttpClient)ReflectionTestUtils.getField(service,"client");
   when(client.send(any(HttpRequest.class),any(HttpResponse.BodyHandler.class))).thenThrow(failure);
   assertEquals(503,assertThrows(ApiException.class,()->service.geocodificar("Rua")).getStatus());
  }
 }
}

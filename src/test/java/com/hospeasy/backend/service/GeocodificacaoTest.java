package com.hospeasy.backend.service;
import com.hospeasy.backend.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.net.http.*;
import java.io.IOException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class GeocodificacaoTest {
 @Test void postalCodeUsesStructuredBrazilianSearch()throws Exception{
  for(String cep:new String[]{"01310100","01310-100","CEP: 01310-100"}){
   var service=service(200,"[{\"lat\":\"-23.5\",\"lon\":\"-46.6\",\"type\":\"postcode\"}]");
   assertEquals(-23.5,service.pesquisar(cep).latitude());
   var request=org.mockito.ArgumentCaptor.forClass(HttpRequest.class);
   verify((HttpClient)ReflectionTestUtils.getField(service,"client")).send(request.capture(),any(HttpResponse.BodyHandler.class));
   String query=request.getValue().uri().getQuery();
   assertTrue(query.startsWith("postalcode=01310-100&"));assertTrue(query.contains("countrycodes=br"));assertFalse(query.contains("q="));
  }
 }
 @Test void invalidPostalCodeDoesNotContactProvider()throws Exception{
  var service=service(200,"[]");
  assertEquals("CEP_INVALIDO",assertThrows(ApiException.class,()->service.pesquisar("01310-10")).getCodigo());
  verifyNoInteractions(ReflectionTestUtils.getField(service,"client"));
 }
 @Test void postalCodeStillRequiresManualConfirmationForAutomaticRegistration()throws Exception{
  var service=service(200,"[{\"lat\":\"-23\",\"lon\":\"-46\",\"type\":\"postcode\"}]");
  assertEquals("LOCALIZACAO_APROXIMADA",assertThrows(ApiException.class,()->service.geocodificar("01310100")).getCodigo());
  var empty=service(200,"[]");
  assertTrue(assertThrows(ApiException.class,()->empty.pesquisar("01310100")).getMessage().contains("CEP não encontrado"));
 }
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
 @Test void mapSearchAllowsApproximatePointForManualConfirmation()throws Exception{
  var result=service(200,"[{\"lat\":\"-23\",\"lon\":\"-46\",\"type\":\"city\"}]").pesquisar("São Paulo");
  assertEquals(-23,result.latitude());assertEquals(-46,result.longitude());
 }
 @Test void frequentRequestsDoNotQueueThreads()throws Exception{
  var service=service(200,"[{\"lat\":\"-23\",\"lon\":\"-46\",\"type\":\"city\"}]");
  service.pesquisar("São Paulo");
  assertEquals(429,assertThrows(ApiException.class,()->service.pesquisar("São Paulo")).getStatus());
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

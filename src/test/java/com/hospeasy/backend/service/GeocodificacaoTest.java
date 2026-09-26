package com.hospeasy.backend.service;
import com.hospeasy.backend.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.net.http.*;
import java.io.IOException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class GeocodificacaoTest {
 private static final String PHOTON="{\"features\":[{\"properties\":{\"type\":\"street\",\"name\":\"Rua Itú\",\"city\":\"Campo Limpo Paulista\",\"district\":\"Jardim Marsola\",\"postcode\":\"13231-448\",\"state\":\"São Paulo\",\"countrycode\":\"BR\"},\"geometry\":{\"type\":\"Point\",\"coordinates\":[-46.7697445,-23.1800386]}}]}";
 private void responses(GeocodificacaoService service,String... bodies)throws Exception{
  var queue=new java.util.ArrayDeque<HttpResponse>();
  for(String body:bodies){var response=mock(HttpResponse.class);when(response.statusCode()).thenReturn(200);when(response.body()).thenReturn(body);queue.add(response);}
  var client=(HttpClient)ReflectionTestUtils.getField(service,"client");
  when(client.send(any(HttpRequest.class),any(HttpResponse.BodyHandler.class))).thenAnswer(invocation->queue.remove());
 }
 @Test void unresolvedCepOffersExplicitlyUnconfirmedStreetSuggestion()throws Exception{
  var service=service(200,"");responses(service,POSTAL,"[]",PHOTON);
  var result=service.pesquisarOpcoes("13233251");
  assertEquals(1,result.resultados().size());assertTrue(result.aviso().contains("não localizações confirmadas"));
  assertTrue(result.aviso().contains("Jardim Laura"));
  assertTrue(result.resultados().getFirst().endereco().contains("Jardim Marsola"));
  assertTrue(result.resultados().getFirst().endereco().contains("13231-448"));
  assertNotEquals(-23.20554,result.resultados().getFirst().latitude());
 }
 @Test void fullAddressUsesAlternativeWithoutSilentlyChoosingItsPoint()throws Exception{
  var service=service(200,"");responses(service,"[]",PHOTON);
  var result=service.pesquisarOpcoes("Rua Itu, Jardim Laura, Campo Limpo Paulista - SP");
  assertEquals("Photon / OpenStreetMap",result.resultados().getFirst().fonte());
  assertTrue(result.resultados().getFirst().aviso().contains("podem diferir"));
 }
 @Test void alternativeRejectsCityCentresWrongStreetsForeignAndInvalidPoints()throws Exception{
  for(String candidate:new String[]{PHOTON.replace("street","city"),PHOTON.replace("Rua Itú","Rua Itatiba"),PHOTON.replace("BR","US"),PHOTON.replace("-23.1800386","123")}){
   var service=service(200,"");responses(service,"[]",candidate);
   assertEquals("ENDERECO_NAO_ENCONTRADO",assertThrows(ApiException.class,()->service.pesquisarOpcoes("Rua Itu, Campo Limpo Paulista")).getCodigo());
  }
 }
 @Test void existingSuccessfulLookupDoesNotCallAlternative()throws Exception{
  var service=service(200,"[{\"lat\":\"-23\",\"lon\":\"-46\",\"type\":\"city\"}]");
  assertEquals("Nominatim",service.pesquisarOpcoes("São Paulo").resultados().getFirst().fonte());
  verify((HttpClient)ReflectionTestUtils.getField(service,"client")).send(any(HttpRequest.class),any(HttpResponse.BodyHandler.class));
 }
 private static final String POSTAL="{\"cep\":\"13233251\",\"street\":\"Rua Itu\",\"neighborhood\":\"Jardim Laura\",\"city\":\"Campo Limpo Paulista\",\"state\":\"SP\",\"location\":{\"coordinates\":{\"latitude\":\"-23.20554\",\"longitude\":\"-46.7838\"}}}";
 private GeocodificacaoService postalService(String map)throws Exception{
  var service=service(200,POSTAL);
  var first=mock(HttpResponse.class);when(first.statusCode()).thenReturn(200);when(first.body()).thenReturn(POSTAL);
  var second=mock(HttpResponse.class);when(second.statusCode()).thenReturn(200);when(second.body()).thenReturn(map);
  var client=(HttpClient)ReflectionTestUtils.getField(service,"client");
  when(client.send(any(HttpRequest.class),any(HttpResponse.BodyHandler.class))).thenReturn(first,second);
  return service;
 }
 private String point(String road,String city,String state){
  return "[{\"lat\":\"-23.1\",\"lon\":\"-46.7\",\"address\":{\"postcode\":\"13233-251\",\"road\":\""+road+"\",\"city\":\""+city+"\",\"ISO3166-2-lvl4\":\""+state+"\"}}]";
 }
 @Test void municipalCentroidIsNeverUsedWhenStreetCannotBeConfirmed()throws Exception{
  for(String map:new String[]{"[]",point("Rua Itu","Campo Limpo Paulista","BR-SP").replace("13233-251","13231-448"),point("Rua Itatiba","Campo Limpo Paulista","BR-SP"),point("Rua Itu","Outra cidade","BR-SP"),point("Rua Itu","Campo Limpo Paulista","BR-RJ")}){
   var service=postalService(map);
   var error=assertThrows(ApiException.class,()->service.pesquisar("13233251"));
   assertEquals("CEP_SEM_LOCALIZACAO_CONFIRMADA",error.getCodigo());
   assertTrue(error.getMessage().contains("Rua Itu"));
   assertTrue(error.getMessage().contains("marcador não foi alterado"));
  }
 }
 @Test void onlyConfirmedStreetCoordinatesAreReturned()throws Exception{
  for(String cep:new String[]{"13233251","13233-251","CEP: 13233-251"}){
   var service=postalService(point("Rua Itu","Campo Limpo Paulista","BR-SP"));
   var result=service.pesquisar(cep);
   assertEquals(-23.1,result.latitude());assertEquals(-46.7,result.longitude());
   var requests=org.mockito.ArgumentCaptor.forClass(HttpRequest.class);
   verify((HttpClient)ReflectionTestUtils.getField(service,"client"),times(2)).send(requests.capture(),any(HttpResponse.BodyHandler.class));
   assertTrue(requests.getValue().uri().getQuery().contains("street=Rua+Itu&city=Campo+Limpo+Paulista&state=SP"));
  }
 }
 @Test void confirmedStreetStillRequiresManualUnitConfirmation()throws Exception{
  var service=postalService(point("Rua Itu","Campo Limpo Paulista","BR-SP"));
  assertEquals("LOCALIZACAO_APROXIMADA",assertThrows(ApiException.class,()->service.geocodificar("13233251")).getCodigo());
 }
 @Test void postalProviderFailureDoesNotReturnAnUnverifiedPoint()throws Exception{
  var service=service(503,"");
  assertEquals(503,assertThrows(ApiException.class,()->service.pesquisar("13233251")).getStatus());
  var missing=service(404,"");
  assertEquals("CEP_NAO_ENCONTRADO",assertThrows(ApiException.class,()->missing.pesquisar("13233251")).getCodigo());
 }
 @Test void invalidPostalCodeDoesNotContactProvider()throws Exception{
  var service=service(200,"[]");
  assertEquals("CEP_INVALIDO",assertThrows(ApiException.class,()->service.pesquisar("01310-10")).getCodigo());
  verifyNoInteractions(ReflectionTestUtils.getField(service,"client"));
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

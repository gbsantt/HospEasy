package com.hospeasy.backend;
import com.hospeasy.backend.config.RequestRateLimitFilter;
import com.hospeasy.backend.entity.*;
import com.hospeasy.backend.repository.*;
import com.hospeasy.backend.service.*;
import com.fasterxml.jackson.databind.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.*;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.*;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import java.net.*;
import java.net.http.*;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnabledIfEnvironmentVariable(named="TEST_DB_URL", matches="jdbc:postgresql://(localhost|127\\.0\\.0\\.1):[0-9]+/hospeasy_test")
@Import(HospEasyIntegrationTest.Events.class)
class HospEasyIntegrationTest {
 static final String SCHEMA="test_"+UUID.randomUUID().toString().replace("-","");
 static final String SECRET="test-only-secret-for-jwt-01234567890123456789";
 @DynamicPropertySource static void properties(DynamicPropertyRegistry p){
  p.add("spring.datasource.url",()->System.getenv("TEST_DB_URL"));
  p.add("spring.datasource.username",()->System.getenv().getOrDefault("TEST_DB_USERNAME","hospeasy_test"));
  p.add("spring.datasource.password",()->"");
  p.add("spring.flyway.schemas",()->SCHEMA);
  p.add("spring.flyway.default-schema",()->SCHEMA);
  p.add("spring.jpa.properties.hibernate.default_schema",()->SCHEMA);
  p.add("spring.datasource.hikari.connection-init-sql",()->"SET search_path TO "+SCHEMA);
  p.add("jwt.secret",()->SECRET);p.add("recovery.secret",()->SECRET);
  p.add("app.bootstrap.email",()->"");p.add("app.bootstrap.password",()->"");
  p.add("spring.mail.host",()->"localhost");p.add("app.cors.origins",()->"http://localhost:8081");
 }
 @Value("${local.server.port}") int port;
 @Autowired UsuarioRepository users; @Autowired PasswordEncoder encoder; @Autowired JwtService jwt;
 @Autowired JdbcTemplate sql; @Autowired RequestRateLimitFilter rate;
 @Autowired RecuperacaoSenhaService recovery; @Autowired DesafioRecuperacaoRepository challenges;
 @MockitoBean EmailService mail;
 static final ObjectMapper json=new ObjectMapper();
 static final ConcurrentMap<String,String> codes=new ConcurrentHashMap<>();
 @TestConfiguration static class Events{
  @EventListener public void capture(RecuperacaoSenhaService.CodigoEmail e){codes.put(e.email(),e.codigo());}
 }
 String admin,common,other;Usuario a,u,v;
 @BeforeEach void setup(){
  sql.execute("TRUNCATE solicitacao_suporte,desafio_recuperacao,historico_ocupacao,favorito,avaliacao,dispositivo_camera,unidade_atendimento,usuario RESTART IDENTITY CASCADE");
  ((Map<?,?>)ReflectionTestUtils.getField(rate,"windows")).clear();codes.clear();
  a=user("admin@test.local",TipoUsuario.ADMIN);u=user("user@test.local",TipoUsuario.USUARIO);v=user("other@test.local",TipoUsuario.USUARIO);
  admin=jwt.gerarToken(a);common=jwt.gerarToken(u);other=jwt.gerarToken(v);
 }
 Usuario user(String email,TipoUsuario role){var x=new Usuario();x.setNome("Teste");x.setEmail(email);x.setTipo(role);x.setSenhaHash(encoder.encode("SenhaTeste123"));return users.save(x);}
 record Result(int status,JsonNode body,String text){}
 Result call(String method,String path,String token,Object body) throws Exception{
  var b=HttpRequest.newBuilder(URI.create("http://localhost:"+port+path)).timeout(java.time.Duration.ofSeconds(15)).header("Content-Type","application/json");
  if(token!=null)b.header("Authorization","Bearer "+token);
  b.method(method,body==null?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)));
  var r=HttpClient.newHttpClient().send(b.build(),HttpResponse.BodyHandlers.ofString());
  JsonNode node;try{node=json.readTree(r.body());}catch(Exception e){node=json.getNodeFactory().textNode(r.body());}
  return new Result(r.statusCode(),node,r.body());
 }
 JsonNode ok(String method,String path,String token,Object body,int status)throws Exception{var r=call(method,path,token,body);assertEquals(status,r.status(),()->method+" "+path+" "+r.text());return r.body();}
 Map<String,Object> unitBody(){return Map.of("nome","Unidade teste","endereco","Rua teste, 123","capacidadeAreaMonitorada",100,"tipo","UPA","latitude",-23.5,"longitude",-46.6);}
 long unit()throws Exception{return ok("POST","/unidades",admin,unitBody(),201).path("unidade").path("id").asLong();}
 JsonNode camera(long id,boolean active)throws Exception{return ok("POST","/admin/unidades/"+id+"/dispositivos",admin,Map.of("nome","Camera teste","ativo",active),201);}
 Result measurement(String key,Object body)throws Exception{
  var b=HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/cameras/medicoes")).header("Content-Type","application/json");
  if(key!=null)b.header("X-Camera-Key",key);
  var r=HttpClient.newHttpClient().send(b.POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body))).build(),HttpResponse.BodyHandlers.ofString());
  return new Result(r.statusCode(),r.body().isBlank()?null:json.readTree(r.body()),r.body());
 }
 @Test void authenticationAndImmutableIdentity()throws Exception{
  ok("POST","/usuarios/login",null,Map.of("email",u.getEmail(),"senha","SenhaTeste123"),200);
  ok("POST","/usuarios/login",null,Map.of("email",u.getEmail(),"senha","incorreta"),401);
  var registration=ok("POST","/usuarios/cadastro",null,Map.of("nome","Novo","email","new@test.local","senha","SenhaTeste123","tipo","ADMIN"),200);
  assertEquals("USUARIO",registration.path("tipo").asText());
  ok("GET","/usuarios/me",common.substring(0,common.length()-8)+"tampered",null,401);
  ok("GET","/usuarios/me",new JwtService(SECRET,-1000).gerarToken(u),null,401);
  ok("PUT","/usuarios/"+u.getId(),admin,Map.of("nome","Renomeado","email","changed@test.local","tipo","USUARIO","ativo",true),200);
  user("user@test.local",TipoUsuario.USUARIO);
  assertEquals(u.getId().longValue(),ok("GET","/usuarios/me",common,null,200).path("id").asLong());
  ok("PUT","/usuarios/"+u.getId(),admin,Map.of("nome","Renomeado","email","changed@test.local","tipo","USUARIO","ativo",false),200);
  ok("GET","/usuarios/me",common,null,401);
  ok("POST","/usuarios/login",null,Map.of("email","changed@test.local","senha","SenhaTeste123"),401);
 }
 @Test void authorizationAndUserCrud()throws Exception{
  long id=unit();assertTrue(id>0);
  for(String route:List.of("/usuarios","/admin/unidades","/admin/suporte","/admin/unidades/"+id+"/dispositivos"))ok("GET",route,common,null,403);
  ok("PUT","/unidades/"+id,common,unitBody(),403);ok("POST","/unidades",common,unitBody(),403);ok("DELETE","/unidades/"+id,common,null,403);
  ok("GET","/usuarios",null,null,401);
  ok("PUT","/usuarios/"+a.getId(),admin,Map.of("nome","Admin","email",a.getEmail(),"tipo","USUARIO","ativo",true),409);
  var created=ok("POST","/usuarios",admin,Map.of("nome","Gerenciado","email","managed@test.local","senha","SenhaTeste123","tipo","USUARIO"),200);
  long uid=created.path("id").asLong();ok("GET","/usuarios/"+uid,admin,null,200);
  ok("PUT","/usuarios/"+uid,admin,Map.of("nome","Inativo","email","managed@test.local","tipo","USUARIO","ativo",false),200);
 }
 @Test void unitsValidationFavoritesAndReviews()throws Exception{
  long id=unit();
  assertEquals("SEM_CAMERA",ok("GET","/unidades/"+id+"/situacao",null,null,200).path("statusCamera").asText());
  assertEquals(1,ok("GET","/admin/unidades",admin,null,200).size());
  var invalid=new HashMap<>(unitBody());invalid.put("nome","a".repeat(151));ok("POST","/unidades",admin,invalid,400);
  ok("POST","/unidades/"+id+"/avaliacoes",common,Map.of("comentario","sem nota"),400);
  var review=ok("POST","/unidades/"+id+"/avaliacoes",common,Map.of("nota",4,"comentario","Bom"),201);
  long reviewId=review.path("id").asLong();
  ok("PUT","/usuarios/me/avaliacoes/"+reviewId,other,Map.of("nota",1,"comentario","Outro"),404);
  ok("POST","/usuarios/me/favoritos/"+id,common,null,200);
  assertEquals("SEM_CAMERA",ok("GET","/usuarios/me/favoritos",common,null,200).get(0).path("statusCamera").asText());
  assertEquals(0,ok("GET","/usuarios/me/favoritos",other,null,200).size());
  ok("PUT","/unidades/"+id,admin,unitBody(),200);
  ok("DELETE","/unidades/"+id,admin,null,204);
  ok("GET","/unidades/"+id,null,null,404);
  assertEquals(0,sql.queryForObject("SELECT count(*) FROM favorito",Integer.class));
  assertEquals(0,sql.queryForObject("SELECT count(*) FROM avaliacao",Integer.class));
 }
 @Test void supportOwnershipPaginationAndVersion()throws Exception{
  var s=ok("POST","/usuarios/me/suporte",common,Map.of("assunto","Ajuda","categoria","APLICATIVO","descricao","Descrição do problema","usuarioId",v.getId()),201);
  long id=s.path("id").asLong();
  ok("GET","/usuarios/me/suporte/"+id,other,null,404);
  ok("GET","/usuarios/me/suporte/"+id,common,null,200);
  assertEquals(u.getId().longValue(),ok("GET","/admin/suporte/"+id,admin,null,200).path("usuarioId").asLong());
  ok("PATCH","/admin/suporte/"+id+"/status",common,Map.of("status","RESOLVIDO","version",0),403);
  ok("PATCH","/admin/suporte/"+id+"/status",admin,Map.of("status","RESOLVIDO","version",0),200);
  ok("PATCH","/admin/suporte/"+id+"/status",admin,Map.of("status","ABERTO","version",0),409);
  assertEquals(1,ok("GET","/admin/suporte?status=RESOLVIDO&size=1",admin,null,200).path("totalElements").asInt());
 }
 @Test void camerasHashesRotationIdempotenceAndRollback()throws Exception{
  long id=unit();var c=camera(id,true);String key=c.path("cameraKey").asText();long device=c.path("dispositivo").path("id").asLong();
  assertEquals(DispositivoCameraService.hash(key),sql.queryForObject("SELECT chave_hash FROM dispositivo_camera WHERE id=?",String.class,device));
  assertFalse(ok("GET","/admin/unidades/"+id+"/dispositivos",admin,null,200).toString().contains(key));
  ok("POST","/admin/unidades/"+id+"/dispositivos",admin,Map.of("nome","Duplicada","ativo",true),409);
  assertEquals(401,measurement(null,Map.of("quantidadePessoas",10)).status());
  assertEquals(401,measurement("invalid",Map.of("quantidadePessoas",10)).status());
  var payload=Map.of("quantidadePessoas",25,"medicaoId",UUID.randomUUID().toString());
  assertEquals(204,measurement(key,payload).status());assertEquals(204,measurement(key,payload).status());
  assertEquals(1,sql.queryForObject("SELECT count(*) FROM historico_ocupacao",Integer.class));
  assertEquals("ONLINE",ok("GET","/unidades/"+id+"/situacao",null,null,200).path("statusCamera").asText());
  assertEquals(400,measurement(key,Map.of("quantidadePessoas",101)).status());
  // Force a database failure AFTER occupancy has been dirtied: the whole transaction must roll back.
  sql.execute("ALTER TABLE historico_ocupacao ADD CONSTRAINT test_fail CHECK (quantidade_pessoas <> 33)");
  assertEquals(409,measurement(key,Map.of("quantidadePessoas",33)).status());
  assertEquals(25,sql.queryForObject("SELECT ocupacao_atual FROM unidade_atendimento WHERE id=?",Integer.class,id));
  sql.execute("ALTER TABLE historico_ocupacao DROP CONSTRAINT test_fail");
  var rotated=ok("POST","/admin/dispositivos/"+device+"/regenerar-chave",admin,null,200);
  assertEquals(401,measurement(key,payload).status());
  String newKey=rotated.path("cameraKey").asText();assertEquals(204,measurement(newKey,Map.of("quantidadePessoas",12)).status());
  ok("POST","/admin/dispositivos/"+device+"/revogar-chave",admin,null,200);
  assertEquals(401,measurement(newKey,payload).status());
  assertFalse(ok("GET","/unidades/"+id+"/historico",null,null,200).toString().contains("registradoPor"));
 }
 @Test void passwordRecoveryLimitsConsumesAndRevokes()throws Exception{
  String body1=call("POST","/usuarios/esqueci-senha",null,Map.of("email",u.getEmail())).text();
  assertEquals(body1,call("POST","/usuarios/esqueci-senha",null,Map.of("email","missing@test.local")).text());
  String code=codes.get(u.getEmail());assertNotNull(code);
  recovery.solicitar(u.getEmail());assertEquals(code,codes.get(u.getEmail()));
  ok("POST","/usuarios/redefinir-senha",null,Map.of("email",u.getEmail(),"codigo",code,"novaSenha","NovaSenha123"),200);
  ok("GET","/usuarios/me",common,null,401);
  ok("POST","/usuarios/redefinir-senha",null,Map.of("email",u.getEmail(),"codigo",code,"novaSenha","NovaSenha123"),400);
  recovery.solicitar(v.getEmail());String actual=codes.get(v.getEmail());String wrong=actual.equals("000000")?"999999":"000000";
  for(int i=0;i<5;i++)assertThrows(RuntimeException.class,()->recovery.verificar(v.getEmail(),wrong));
  assertThrows(RuntimeException.class,()->recovery.verificar(v.getEmail(),actual));
  assertEquals(5,challenges.findById(v.getId()).orElseThrow().getTentativas());
 }
 @Test void oneActiveCameraUnderConcurrency()throws Exception{
  long id=unit();try(var pool=Executors.newVirtualThreadPerTaskExecutor()){
   var tasks=List.<Callable<Integer>>of(()->call("POST","/admin/unidades/"+id+"/dispositivos",admin,Map.of("nome","A","ativo",true)).status(),()->call("POST","/admin/unidades/"+id+"/dispositivos",admin,Map.of("nome","B","ativo",true)).status());
   var results=new ArrayList<Integer>();for(var result:pool.invokeAll(tasks))results.add(result.get());Collections.sort(results);assertEquals(List.of(201,409),results);
  }
 }
 @Test void resetIsSingleUseUnderConcurrencyAndExpires()throws Exception {
  recovery.solicitar(u.getEmail());String code=codes.get(u.getEmail());
  try(var pool=Executors.newVirtualThreadPerTaskExecutor()){
   Callable<Boolean> change=()->{try{recovery.redefinir(u.getEmail(),code,"NovaSenha123");return true;}catch(com.hospeasy.backend.exception.ApiException e){return false;}};
   int success=0;for(var r:pool.invokeAll(List.of(change,change)))if(r.get())success++;assertEquals(1,success);
  }
  recovery.solicitar(v.getEmail());sql.update("UPDATE desafio_recuperacao SET expira_em=now()-interval '1 minute' WHERE usuario_id=?",v.getId());
  assertThrows(com.hospeasy.backend.exception.ApiException.class,()->recovery.verificar(v.getEmail(),codes.get(v.getEmail())));
 }
 @Test void concurrentAdminsCannotRemoveLastAdministrator()throws Exception{
  var second=user("admin2@test.local",TipoUsuario.ADMIN);String token2=jwt.gerarToken(second);
  try(var pool=Executors.newVirtualThreadPerTaskExecutor()){
   var tasks=List.<Callable<Integer>>of(
    ()->call("PUT","/usuarios/"+second.getId(),admin,Map.of("nome","B","email",second.getEmail(),"tipo","USUARIO","ativo",true)).status(),
    ()->call("PUT","/usuarios/"+a.getId(),token2,Map.of("nome","A","email",a.getEmail(),"tipo","USUARIO","ativo",true)).status());
   var results=new ArrayList<Integer>();for(var result:pool.invokeAll(tasks))results.add(result.get());
   assertTrue(results.contains(200));assertTrue(results.contains(409)||results.contains(403));
   assertEquals(1,sql.queryForObject("SELECT count(*) FROM usuario WHERE tipo='ADMIN' AND ativo=true",Integer.class));
  }
 }
 @Test void legacyMigrationPreservesRecordsAndHashesKeys()throws Exception{
  String legacy="legacy_"+UUID.randomUUID().toString().replace("-","");
  String url=System.getenv("TEST_DB_URL");
  var config=org.flywaydb.core.Flyway.configure().dataSource(url,System.getenv().getOrDefault("TEST_DB_USERNAME","hospeasy_test"),"")
   .schemas(legacy).defaultSchema(legacy);
  config.target("1").load().migrate();
  try(var c=java.sql.DriverManager.getConnection(url,System.getenv().getOrDefault("TEST_DB_USERNAME","hospeasy_test"),"");var s=c.createStatement()){
   s.execute("SET search_path TO "+legacy);
   s.execute("INSERT INTO usuario(nome,email,senha_hash,tipo) VALUES ('Legado','legacy@test.local','hash','ADMIN')");
   s.execute("INSERT INTO unidade_atendimento(nome,endereco,ocupacao_atual,ultima_atualizacao,tipo,capacidade_area_monitorada) VALUES ('Legada','Rua',7,now(),'UPA',100)");
   s.execute("INSERT INTO dispositivo_camera(nome,chave_api,unidade_atendimento_id) VALUES ('A','legacy-test-key-A',1),('B','legacy-test-key-B',1)");
  }
  org.flywaydb.core.Flyway.configure().dataSource(url,System.getenv().getOrDefault("TEST_DB_USERNAME","hospeasy_test"),"").schemas(legacy).defaultSchema(legacy).load().migrate();
  assertEquals(2,sql.queryForObject("SELECT count(*) FROM "+legacy+".dispositivo_camera",Integer.class));
  assertEquals(1,sql.queryForObject("SELECT count(*) FROM "+legacy+".dispositivo_camera WHERE ativo",Integer.class));
  assertEquals(7,sql.queryForObject("SELECT ocupacao_atual FROM "+legacy+".unidade_atendimento",Integer.class));
  assertEquals(DispositivoCameraService.hash("legacy-test-key-A"),sql.queryForObject("SELECT chave_hash FROM "+legacy+".dispositivo_camera WHERE id=1",String.class));
 }
 @Test void cameraWithoutUnitIsRejectedByDatabaseAndInactiveKeyFails()throws Exception {
  long id=unit();var c=camera(id,false);
  assertEquals(401,measurement(c.path("cameraKey").asText(),Map.of("quantidadePessoas",1)).status());
  assertThrows(org.springframework.dao.DataIntegrityViolationException.class,()->sql.update("UPDATE dispositivo_camera SET unidade_atendimento_id=NULL WHERE id=?",c.path("dispositivo").path("id").asLong()));
  assertEquals(400,measurement(c.path("cameraKey").asText(),Map.of("quantidadePessoas",-1)).status());
 }
 @Test void legacyTokenAndAllowedCors()throws Exception {
  String legacy=io.jsonwebtoken.Jwts.builder().subject(u.getEmail()).expiration(new Date(System.currentTimeMillis()+60000))
   .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(SECRET.getBytes(java.nio.charset.StandardCharsets.UTF_8))).compact();
  ok("GET","/usuarios/me",legacy,null,401);
  var request=HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/usuarios/me")).header("Origin","http://localhost:8081")
   .header("Access-Control-Request-Method","GET").header("Access-Control-Request-Headers","authorization").method("OPTIONS",HttpRequest.BodyPublishers.noBody()).build();
  var response=HttpClient.newHttpClient().send(request,HttpResponse.BodyHandlers.discarding());
  assertEquals(200,response.statusCode());assertEquals("http://localhost:8081",response.headers().firstValue("Access-Control-Allow-Origin").orElseThrow());
  assertTrue(response.headers().firstValue("Access-Control-Allow-Credentials").isEmpty());
 }
 @Test void accountRecoveryRequestWindowCannotBeBypassed() {
  for(int i=0;i<8;i++){recovery.solicitar(u.getEmail());sql.update("UPDATE desafio_recuperacao SET solicitado_em=now()-interval '61 seconds' WHERE usuario_id=?",u.getId());}
  assertEquals(5,challenges.findById(u.getId()).orElseThrow().getSolicitacoes());
 }
 @Test void corsAndRateLimit()throws Exception{
  var b=HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/usuarios/me")).header("Origin","https://untrusted.invalid").header("Access-Control-Request-Method","GET").method("OPTIONS",HttpRequest.BodyPublishers.noBody()).build();
  assertEquals(403,HttpClient.newHttpClient().send(b,HttpResponse.BodyHandlers.discarding()).statusCode());
  for(int i=0;i<5;i++)ok("POST","/usuarios/esqueci-senha",null,Map.of("email","missing@test.local"),200);
  ok("POST","/usuarios/esqueci-senha",null,Map.of("email","missing@test.local"),429);
 }
}

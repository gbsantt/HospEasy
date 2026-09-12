package db.migration;
import org.flywaydb.core.api.migration.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
public class V3__Hash_camera_keys extends BaseJavaMigration {
    @Override public void migrate(Context context) throws Exception {
        var c=context.getConnection();
        try(var select=c.prepareStatement("SELECT id, chave_api FROM dispositivo_camera WHERE chave_hash IS NULL");
            var rows=select.executeQuery();
            var update=c.prepareStatement("UPDATE dispositivo_camera SET chave_hash=? WHERE id=?")) {
            while(rows.next()) {
                String digest=HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(rows.getString(2).getBytes(StandardCharsets.UTF_8)));
                update.setString(1,digest); update.setLong(2,rows.getLong(1)); update.executeUpdate();
            }
        }
        try(var s=c.createStatement()) {
            // Preserve all devices and keys. Deterministically keep the oldest active device.
            s.executeUpdate("UPDATE dispositivo_camera SET ativo=false WHERE ativo=true AND id NOT IN (SELECT min(id) FROM dispositivo_camera WHERE ativo=true GROUP BY unidade_atendimento_id)");
            s.execute("ALTER TABLE dispositivo_camera ALTER COLUMN chave_hash SET NOT NULL");
            s.execute("CREATE UNIQUE INDEX uk_camera_hash ON dispositivo_camera(chave_hash)");
            s.execute("CREATE UNIQUE INDEX uk_camera_ativa_unidade ON dispositivo_camera(unidade_atendimento_id) WHERE ativo=true");
            s.execute("ALTER TABLE dispositivo_camera DROP COLUMN chave_api");
        }
    }
}

import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { buscarRelatorioPDF } from "./api";
export async function downloadReport(id:number,token:string) {
    if(!await Sharing.isAvailableAsync()) throw new Error("Compartilhamento de arquivos indisponível neste dispositivo.");
    const data=await buscarRelatorioPDF(id,token);
    const file=new File(Paths.cache,`unidade-${id}-ocupacao.pdf`);
    try {
        file.write(new Uint8Array(data));
        await Sharing.shareAsync(file.uri,{mimeType:"application/pdf",UTI:"com.adobe.pdf",dialogTitle:"Salvar relatório da unidade"});
    } finally { if(file.exists)file.delete(); }
}

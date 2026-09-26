import { buscarRelatorioPDF } from "./api";
export async function downloadReport(id:number,token:string) {
    const data=await buscarRelatorioPDF(id,token);
    const url=URL.createObjectURL(new Blob([data],{type:"application/pdf"}));
    const link=document.createElement("a");link.href=url;link.download=`unidade-${id}-ocupacao.pdf`;
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
}

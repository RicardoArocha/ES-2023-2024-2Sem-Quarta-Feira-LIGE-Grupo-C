package com.meuprojeto;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class CsvConverter {
    public static void main(String[] args) {
        Path pathToCsv = Paths.get("src/main/resources/caracterizacaodasSalas.csv");
        try {
            // Ler o conteúdo do arquivo usando a codificação ANSI
            byte[] csvBytes = Files.readAllBytes(pathToCsv);
            String content = new String(csvBytes, "Windows-1252"); // Ou a codificação correta que o arquivo usa

            // Converter o conteúdo para UTF-8
            byte[] utf8Bytes = content.getBytes(StandardCharsets.UTF_8);

            // Salvar o novo conteúdo em UTF-8
            Files.write(pathToCsv, utf8Bytes);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

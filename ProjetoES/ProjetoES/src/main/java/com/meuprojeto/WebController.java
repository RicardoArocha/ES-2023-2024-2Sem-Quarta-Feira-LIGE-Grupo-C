package com.meuprojeto;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import org.springframework.web.bind.annotation.PathVariable;
import java.io.FileReader;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.net.MalformedURLException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;


@Controller
public class WebController {

    @GetMapping("/")
    public String viewHome() {
        return "hub"; // Sem a extensão .html, o Spring irá procurar por um arquivo chamado hub.html em src/main/resources/templates
    }

    @GetMapping("/horarios")
    public String viewHorarios() {
        return "horarios"; // Assumindo que você tem um arquivo horarios.html
    }

    @GetMapping("/salas")
    public String viewSalas() {
        return "salas"; // Assumindo que você tem um arquivo salas.html
    }

    //tens de copair isto e fazer igual mas para o ficheiro de salas. e aqui fica upload-horarios e no outro upload-salas
    @PostMapping("/upload")
    public ResponseEntity<String> handleFileUpload(@RequestParam("file") MultipartFile file) {
        if (!file.isEmpty()) {
            try {
                // Define o caminho onde o arquivo será salvo
                String saveDirectory = System.getProperty("user.dir") + "/src/main/resources/";
                java.nio.file.Path path = Paths.get(saveDirectory + file.getOriginalFilename());
                
                // Substitui o arquivo existente com o mesmo nome
                Files.copy(file.getInputStream(), path, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                
                return ResponseEntity.ok("Arquivo carregado com sucesso: " + file.getOriginalFilename());
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Falha ao carregar o arquivo: " + e.getMessage());
            }
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Arquivo vazio não pode ser carregado");
        }
    }


    private static final String CSV_SALAS_PATH = "src/main/resources/caracterizacaodasSalas.csv";
    private static final String CSV_HORARIO_PATH = "src/main/resources/HorarioDeExemploAtualizado.csv";

    private static final String CSV_Horarios = "src/main/resources/HorarioDeExemploAtualizado.csv";
    private static final Logger log = LoggerFactory.getLogger(WebController.class);


    @GetMapping("/HorarioDeExemploAtualizado.csv")
    public ResponseEntity<Resource> getScheduleFile() {
        try {
            Resource file = new UrlResource(Paths.get("src/main/resources/HorarioDeExemploAtualizado.csv").toUri());
            if (file.exists() || file.isReadable()) {
                return ResponseEntity.ok().body(file);
            } else {
                log.error("O arquivo HorarioDeExemploAtualizado.csv não foi encontrado ou não pode ser lido.");
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            log.error("URL mal formada: ", e);
            return ResponseEntity.badRequest().build();
        }
    }
    @GetMapping("/caracterizacaodasSalas.csv")
    public ResponseEntity<Resource> getScheduleFile2() {
        try {
            Resource file = new UrlResource(Paths.get("src/main/resources/caracterizacaodassalas.csv").toUri());
            if (file.exists() || file.isReadable()) {
                return ResponseEntity.ok().body(file);
            } else {
                log.error("O arquivo Caracterizacaodassalas.csv não foi encontrado ou não pode ser lido.");
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            log.error("URL mal formada: ", e);
            return ResponseEntity.badRequest().build();
        }
    }
    @PostMapping("/upload-horarios")
public ResponseEntity<String> handleFileSave(@RequestParam("file") MultipartFile file) {
    if (!file.isEmpty()) {
        try {
            String saveDirectory = System.getProperty("user.dir") + "/src/main/resources/";
            Path path = Paths.get(saveDirectory + file.getOriginalFilename());
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            return ResponseEntity.ok("Arquivo guardado com sucesso: " + file.getOriginalFilename());
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao guardar o arquivo: " + e.getMessage());
        }
    } else {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Arquivo vazio não pode ser guardado");
    }
}

@PostMapping("/upload-salas")
public ResponseEntity<String> handleFileSave2(@RequestParam("file") MultipartFile file) {
    if (!file.isEmpty()) {
        try {
            String saveDirectory = System.getProperty("user.dir") + "/src/main/resources/";
            Path path = Paths.get(saveDirectory + file.getOriginalFilename());
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            return ResponseEntity.ok("Arquivo guardado com sucesso: " + file.getOriginalFilename());
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao guardar o arquivo: " + e.getMessage());
        }
    } else {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Arquivo vazio não pode ser guardado");
    }
}
}


package com.meuprojeto;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

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
}


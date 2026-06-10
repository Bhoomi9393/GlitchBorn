package com.glitchborn.controller;

import com.glitchborn.dto.PlayerStateResponse;
import com.glitchborn.model.*;
import com.glitchborn.service.PlayerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/game")
public class GameController {

    private final PlayerService service;

    public GameController(PlayerService service) {
        this.service = service;
    }

    @PostMapping("/join")
    public ResponseEntity<PlayerStateResponse> join(@RequestParam String playerId) {
        Player p = service.join(playerId);
        return ResponseEntity.ok(PlayerStateResponse.from(p));
    }

    @DeleteMapping("/leave")
    public ResponseEntity<Map<String, Object>> leave(@RequestParam String playerId) {
        boolean removed = service.leave(playerId);
        return ResponseEntity.ok(Map.of("playerId", playerId, "removed", removed));
    }

    @GetMapping("/state")
    public ResponseEntity<PlayerStateResponse> state(@RequestParam String playerId) {
        return service.find(playerId)
                .map(p -> ResponseEntity.ok(PlayerStateResponse.from(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public ResponseEntity<List<PlayerStateResponse>> all() {
        List<PlayerStateResponse> list = service.all().stream()
                .map(PlayerStateResponse::from)
                .toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/cursorMode")
    public ResponseEntity<PlayerStateResponse> cursorMode(@RequestParam String playerId,
                                                          @RequestParam boolean enabled) {
        return service.setCursorMode(playerId, enabled)
                .map(p -> ResponseEntity.ok(PlayerStateResponse.from(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Keyboard move: key = W | A | S | D
    @PostMapping("/moveKey")
    public ResponseEntity<PlayerStateResponse> moveKey(@RequestParam String playerId,
                                                       @RequestParam String key) {
        ControlKey parsed;
        try {
            parsed = ControlKey.valueOf(key.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }

        return service.moveKey(playerId, parsed)
                .map(p -> ResponseEntity.ok(PlayerStateResponse.from(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Cursor move (agar.io style): send current cursor coordinate in world space
    @PostMapping("/moveCursor")
    public ResponseEntity<PlayerStateResponse> moveCursor(@RequestParam String playerId,
                                                          @RequestParam double cursorX,
                                                          @RequestParam double cursorY) {
        return service.moveCursor(playerId, cursorX, cursorY)
                .map(p -> ResponseEntity.ok(PlayerStateResponse.from(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Start a random glitch (9s)
    @PostMapping("/glitch/random")
    public ResponseEntity<PlayerStateResponse> glitchRandom(@RequestParam String playerId) {
        return service.glitchRandom(playerId)
                .map(p -> ResponseEntity.ok(PlayerStateResponse.from(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Start a specific glitch (CONTROL_REMAPPING | CURSOR_INVERT | TELEPORT | SCREEN_SHAKE), 9s
    @PostMapping("/glitch/apply")
    public ResponseEntity<PlayerStateResponse> glitchApply(@RequestParam String playerId,
                                                           @RequestParam String type) {
        GlitchType parsed;
        try {
            parsed = Glitchtype.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
        return service.glitchSpecific(playerId, parsed)
                .map(p -> ResponseEntity.ok(PlayerStateResponse.from(p)))
                .orElse(ResponseEntity.notFound().build());
    }
}

package com.glitchborn.service;

import java.util.Collection;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import com.glitchborn.model.ControlKey;
import com.glitchborn.model.Glitchtype;
import com.glitchborn.model.Player;

@Service
public class PlayerService {

    private final ConcurrentHashMap<String, Player> players = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private static final long GLITCH_DURATION_MS = 9000;

    public Player join(String playerId) {
        return players.computeIfAbsent(playerId, Player::new);
    }

    public boolean leave(String playerId) {
        return players.remove(playerId) != null;
    }

    public Optional<Player> find(String playerId) {
        Player p = players.get(playerId);
        if (p != null) p.tick();
        return Optional.ofNullable(p);
    }

    public Collection<Player> all() {
        players.values().forEach(Player::tick);
        return players.values();
    }

    public Optional<Player> setCursorMode(String playerId, boolean enabled) {
        return find(playerId).map(p -> { p.setCursorMode(enabled); return p; });
    }

    public Optional<Player> moveKey(String playerId, ControlKey key) {
        return find(playerId).map(p -> {
            if (p.isCursorMode()) return p;
            p.moveByKey(key);
            return p;
        });
    }

    public Optional<Player> moveCursor(String playerId, double cursorX, double cursorY) {
        return find(playerId).map(p -> {
            if (!p.isCursorMode()) return p; 
            p.moveToCursor(cursorX, cursorY);
            return p;
        });
    }

    public Optional<Player> glitchRandom(String playerId) {
        return find(playerId).map(p -> {
            Glitchtype type = randomGlitch();
            applyTimedGlitch(p, type, GLITCH_DURATION_MS);
            return p;
        });
    }

    public Optional<Player> glitchSpecific(String playerId, Glitchtype type) {
        return find(playerId).map(p -> {
            applyTimedGlitch(p, type, GLITCH_DURATION_MS);
            return p;
        });
    }

    private void applyTimedGlitch(Player p, Glitchtype type, long durationMs) {
        p.applyGlitch(Glitchtype.CONTROL_REMAPPING);
        scheduler.schedule(() -> p.clearGlitch(type), durationMs + 50, TimeUnit.MILLISECONDS);
    }

    private Glitchtype randomGlitch() {
        Glitchtype[] values = Glitchtype.values();
        return values[ThreadLocalRandom.current().nextInt(values.length)];
    }
}

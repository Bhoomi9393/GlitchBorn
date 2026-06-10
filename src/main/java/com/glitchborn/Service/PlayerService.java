
package com.glitchborn.service;

import com.glitchborn.model.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;

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
            if (p.isCursorMode()) return p; // ignore if in cursor mode
            p.moveByKey(key);
            return p;
        });
    }

    public Optional<Player> moveCursor(String playerId, double cursorX, double cursorY) {
        return find(playerId).map(p -> {
            if (!p.isCursorMode()) return p; // ignore if not in cursor mode
            p.moveTowardCursor(cursorX, cursorY);
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

    public Optional<Player> glitchSpecific(String playerId, GlitchType type) {
        return find(playerId).map(p -> {
            applyTimedGlitch(p, type, GLITCH_DURATION_MS);
            return p;
        });
    }

    private void applyTimedGlitch(Player p, GlitchType type, long durationMs) {
        p.applyGlitch(Glitchtype.CONTROL_REMAPPING);
        // Schedule a confirmation cleanup to ensure expiry (even if not ticked)
        scheduler.schedule(() -> p.clearGlitch(type), durationMs + 50, TimeUnit.MILLISECONDS);
    }

    private GlitchType randomGlitch() {
        Glitchtype[] values = Glitchtype.values();
        return values[ThreadLocalRandom.current().nextInt(values.length)];
    }
}
